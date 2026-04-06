<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Advertisement;
use App\Models\Admin;
use App\Models\Hotel;

class AdvertisementController extends Controller
{
    // Fixed ad packages (label => [days, price_npr])
    const PACKAGES = [
        '1_week'  => ['label' => '1 Week',  'days' => 7,  'price' => 1000],
        '2_weeks' => ['label' => '2 Weeks', 'days' => 14, 'price' => 1800],
        '1_month' => ['label' => '1 Month', 'days' => 30, 'price' => 3000],
    ];

    // Public: return available packages
    public function packages()
    {
        return response()->json(self::PACKAGES);
    }

    // Public: get all approved active ads for homepage carousel
    public function publicIndex()
    {
        $today = now()->toDateString();
        $ads = Advertisement::with('hotel:id,name,city,featured_image')
            ->where('status', 'approved')
            ->where('payment_status', 'completed')
            ->where(function ($q) use ($today) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', $today);
            })
            ->where(function ($q) use ($today) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', $today);
            })
            ->latest()
            ->get();

        return response()->json($ads);
    }

    // Admin: initiate ad submission + Khalti payment
    public function initiatePayment(Request $request)
    {
        $request->validate([
            'hotel_id'   => 'required|exists:hotels,id',
            'title'      => 'required|string|max:200',
            'package'    => 'required|in:1_week,2_weeks,1_month',
            'banner_image' => 'required|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        $admin = Admin::where('user_id', $request->user()->id)->first();
        if (!$admin) {
            return response()->json(['message' => 'Admin record not found'], 403);
        }

        $hotel = Hotel::where('id', $request->hotel_id)->where('admin_id', $admin->id)->first();
        if (!$hotel) {
            return response()->json(['message' => 'Hotel not found or unauthorized'], 403);
        }

        $pkg = self::PACKAGES[$request->package];
        $startDate = now()->toDateString();
        $endDate   = now()->addDays($pkg['days'])->toDateString();

        $path = $request->file('banner_image')->store('advertisements', 'public');

        // Create ad in unpaid state
        $ad = Advertisement::create([
            'hotel_id'       => $hotel->id,
            'title'          => $request->title,
            'banner_image'   => $path,
            'amount_paid'    => $pkg['price'],
            'payment_status' => 'unpaid',
            'status'         => 'pending',
            'start_date'     => $startDate,
            'end_date'       => $endDate,
        ]);

        // Initiate Khalti payment
        $orderId     = 'AD-' . $ad->id . '-' . time();
        $amountPaisa = $pkg['price'] * 100;
        $returnUrl   = config('services.khalti.ad_return_url',
                            env('KHALTI_AD_RETURN_URL', 'http://localhost:5173/payment/ad/return'));

        $payload = [
            'return_url'          => $returnUrl,
            'website_url'         => config('app.url'),
            'amount'              => $amountPaisa,
            'purchase_order_id'   => $orderId,
            'purchase_order_name' => 'Advertisement: ' . $ad->title,
            'customer_info'       => [
                'name'  => $request->user()->name,
                'email' => $request->user()->email,
                'phone' => $request->user()->phone ?? '9800000000',
            ],
            'amount_breakdown' => [
                ['label' => 'Ad Package (' . $pkg['label'] . ')', 'amount' => $amountPaisa],
            ],
            'product_details' => [[
                'identity'    => (string) $ad->id,
                'name'        => 'Banner Ad - ' . $hotel->name,
                'total_price' => $amountPaisa,
                'quantity'    => 1,
                'unit_price'  => $amountPaisa,
            ]],
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Key ' . config('services.khalti.secret_key'),
            'Content-Type'  => 'application/json',
        ])->post(config('services.khalti.initiate_url'), $payload);

        if ($response->failed()) {
            $ad->delete();
            Log::error('Khalti ad payment initiation failed', ['ad_id' => $ad->id, 'body' => $response->body()]);
            return response()->json(['message' => 'Payment initiation failed', 'error' => $response->body()], 502);
        }

        $data = $response->json();

        $ad->update(['pidx' => $data['pidx'], 'payment_status' => 'pending']);

        return response()->json([
            'message'     => 'Redirect to payment',
            'payment_url' => $data['payment_url'],
            'pidx'        => $data['pidx'],
            'ad_id'       => $ad->id,
        ]);
    }

    // Verify ad payment after Khalti return
    public function verifyPayment(Request $request)
    {
        $pidx = $request->query('pidx') ?? $request->input('pidx');
        if (!$pidx) {
            return response()->json(['message' => 'Missing pidx'], 400);
        }

        $ad = Advertisement::where('pidx', $pidx)->first();
        if (!$ad) {
            return response()->json(['message' => 'Advertisement not found for this pidx'], 404);
        }

        if ($ad->payment_status === 'completed') {
            return response()->json(['message' => 'Already verified', 'status' => 'completed', 'ad_id' => $ad->id]);
        }

        $response = Http::withHeaders([
            'Authorization' => 'Key ' . config('services.khalti.secret_key'),
            'Content-Type'  => 'application/json',
        ])->post(config('services.khalti.lookup_url'), ['pidx' => $pidx]);

        if ($response->failed()) {
            return response()->json(['message' => 'Khalti lookup failed'], 502);
        }

        $data   = $response->json();
        $khaltiStatus = $data['status'] ?? 'Unknown';

        if ($khaltiStatus === 'Completed') {
            $ad->update([
                'payment_status' => 'completed',
                'transaction_id' => $data['transaction_id'] ?? null,
                'status'         => 'pending', // awaiting superadmin approval
            ]);

            return response()->json([
                'message'        => 'Payment successful. Your ad is pending approval.',
                'status'         => 'completed',
                'transaction_id' => $data['transaction_id'] ?? null,
                'ad_id'          => $ad->id,
            ]);
        }

        if (in_array($khaltiStatus, ['Failed', 'Expired', 'Refunded', 'User canceled'])) {
            $ad->update(['payment_status' => 'failed']);
            return response()->json(['message' => 'Payment failed', 'status' => 'failed'], 400);
        }

        return response()->json(['message' => 'Payment still pending', 'status' => 'pending'], 202);
    }

    // Admin: list their own ads
    public function adminIndex(Request $request)
    {
        $admin = Admin::where('user_id', $request->user()->id)->first();
        if (!$admin) {
            return response()->json(['message' => 'Admin record not found'], 403);
        }

        $hotelIds = Hotel::where('admin_id', $admin->id)->pluck('id');

        $ads = Advertisement::with('hotel:id,name,city')
            ->whereIn('hotel_id', $hotelIds)
            ->latest()
            ->get();

        return response()->json($ads);
    }

    // Admin: delete their own ad (only if unpaid or rejected)
    public function destroy(Request $request, $id)
    {
        $admin = Admin::where('user_id', $request->user()->id)->first();
        $ad = Advertisement::findOrFail($id);

        $hotelIds = Hotel::where('admin_id', $admin->id)->pluck('id');
        if (!$hotelIds->contains($ad->hotel_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ad->delete();
        return response()->json(['message' => 'Advertisement deleted']);
    }

    // Super Admin: list all ads
    public function superAdminIndex()
    {
        $ads = Advertisement::with('hotel:id,name,city')
            ->latest()
            ->get();

        return response()->json($ads);
    }

    // Super Admin: approve an ad
    public function approve(Request $request, $id)
    {
        $ad = Advertisement::findOrFail($id);

        if ($ad->payment_status !== 'completed') {
            return response()->json(['message' => 'Cannot approve — payment not completed'], 400);
        }

        $ad->update(['status' => 'approved', 'rejection_reason' => null]);

        return response()->json(['message' => 'Advertisement approved', 'ad' => $ad]);
    }

    // Super Admin: reject an ad
    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $ad = Advertisement::findOrFail($id);
        $ad->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->rejection_reason,
        ]);

        return response()->json(['message' => 'Advertisement rejected', 'ad' => $ad]);
    }
}
