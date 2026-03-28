import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DatePicker, App } from "antd";
import dayjs from "dayjs";
import { useBookingCart } from "../context/BookingCartContext";
import bookingService from "../services/bookingService";
import settingsService from "../services/settingsService";
import "./MultiBooking.css";

function MultiBooking() {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const { cart, removeRoom, updateGuests, updateQuantity, clearCart } = useBookingCart();

    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [submitting, setSubmitting] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(null);
    const [isShutdown, setIsShutdown] = useState(false);

    useEffect(() => {
        settingsService.get().then(s => {
            if (s.shutdown_website === '1') setIsShutdown(true);
        }).catch(() => {});
    }, []);

    const getNights = () => {
        if (!checkIn || !checkOut) return 0;
        const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
        return diff > 0 ? diff : 0;
    };

    const getRoomTotal = (room) => getNights() * parseFloat(room.basePrice || 0) * (room.quantity || 1);

    const getGrandTotal = () => cart.reduce((sum, room) => sum + getRoomTotal(room), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!localStorage.getItem("token")) { navigate("/login"); return; }
        if (cart.length === 0) { message.warning("Your cart is empty."); return; }
        if (getNights() <= 0) { message.warning("Please select valid check-in and check-out dates."); return; }

        try {
            setSubmitting(true);
            const payload = {
                check_in_date: checkIn,
                check_out_date: checkOut,
                payment_method: paymentMethod,
                is_reservation: paymentMethod === "cash",
                cancellation_policy: paymentMethod === "khalti" ? "non_refundable" : "24_hours",
                // Expand quantities: 2x room type A → two separate entries
                rooms: cart.flatMap(room =>
                    Array.from({ length: room.quantity || 1 }, () => ({
                        hotel_id: room.hotelId,
                        room_type_id: room.roomTypeId,
                        num_guests: room.numGuests,
                        num_adults: room.numGuests,
                        total_amount: getNights() * parseFloat(room.basePrice || 0),
                    }))
                ),
            };

            const result = await bookingService.createMultiBooking(payload);

            if (paymentMethod === "khalti" && result.payment_url) {
                window.location.href = result.payment_url;
                return;
            }

            clearCart();
            setBookingSuccess(result);
        } catch (err) {
            const msg = err?.message || "Booking failed. Please try again.";
            message.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (isShutdown) {
        return (
            <div className="mb-empty">
                <div className="mb-empty-icon">🔧</div>
                <h2>Bookings Temporarily Unavailable</h2>
                <p>We're under maintenance. Please check back soon.</p>
                <Link to="/hotels" className="mb-btn-primary">Browse Hotels</Link>
            </div>
        );
    }

    if (bookingSuccess) {
        return (
            <div className="mb-success-page">
                <div className="mb-success-card">
                    <div className="mb-success-icon">🏨</div>
                    <h2>{bookingSuccess.bookings?.length} Room{bookingSuccess.bookings?.length > 1 ? 's' : ''} Reserved!</h2>
                    <p>Your rooms are reserved. Pay at the hotel on check-in.</p>
                    <div className="mb-success-ref">
                        Group Reference: <strong>{bookingSuccess.group_booking_reference}</strong>
                    </div>
                    <div className="mb-success-bookings">
                        {bookingSuccess.bookings?.map((b, i) => (
                            <div key={i} className="mb-success-booking-row">
                                <span>Room {i + 1}</span>
                                <strong>{b.booking_reference}</strong>
                                <span>Rs. {parseFloat(b.total_amount).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mb-success-total">
                        Total: <strong>Rs. {bookingSuccess.bookings?.reduce((s, b) => s + parseFloat(b.total_amount), 0).toLocaleString()}</strong>
                    </div>
                    <div className="mb-success-actions">
                        <Link to="/my-bookings" className="mb-btn-primary">View My Bookings</Link>
                        <Link to="/hotels" className="mb-btn-outline">Browse More Hotels</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="mb-empty">
                <div className="mb-empty-icon">🛒</div>
                <h2>Your Booking Cart is Empty</h2>
                <p>Browse hotels and add rooms to your cart to book multiple rooms at once.</p>
                <Link to="/hotels" className="mb-btn-primary">Browse Hotels</Link>
            </div>
        );
    }

    return (
        <div className="mb-page">
            <div className="mb-breadcrumb">
                <Link to="/hotels">Hotels</Link> › <span>Multi-Room Booking</span>
            </div>

            <div className="mb-layout">
                {/* Left — Cart + Form */}
                <div className="mb-form-col">
                    <div className="mb-section-card">
                        <h1 className="mb-title">Book Multiple Rooms</h1>
                        <p className="mb-subtitle">{cart.reduce((s, r) => s + (r.quantity || 1), 0)} room{cart.reduce((s, r) => s + (r.quantity || 1), 0) > 1 ? 's' : ''} selected · All rooms share the same dates</p>

                        {/* Room list */}
                        <div className="mb-room-list">
                            {cart.map((room) => (
                                <div key={room.roomTypeId} className="mb-room-row">
                                    <div className="mb-room-info">
                                        <span className="mb-room-name">{room.roomTypeName}</span>
                                        <span className="mb-room-hotel">📍 {room.hotelName}</span>
                                        <span className="mb-room-price">Rs. {parseFloat(room.basePrice).toLocaleString()} / night</span>
                                    </div>
                                    <div className="mb-room-controls">
                                        <label>Guests</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={room.maxOccupancy || 4}
                                            value={room.numGuests}
                                            onChange={e => updateGuests(room.roomTypeId, parseInt(e.target.value) || 1)}
                                            className="mb-guests-input"
                                        />
                                        <label style={{ marginLeft: 8 }}>Qty</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={room.quantity || 1}
                                            onChange={e => updateQuantity(room.roomTypeId, parseInt(e.target.value) || 1)}
                                            className="mb-guests-input"
                                            style={{ width: 52 }}
                                        />
                                        {getNights() > 0 && (
                                            <span className="mb-room-subtotal">
                                                Rs. {getRoomTotal(room).toLocaleString()}
                                            </span>
                                        )}
                                        <button className="mb-remove-btn" onClick={() => removeRoom(room.roomTypeId)} title="Remove">✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="mb-form">
                            {/* Dates */}
                            <div className="mb-field-group">
                                <div className="mb-field">
                                    <label>📅 Check-in Date</label>
                                    <DatePicker
                                        required
                                        style={{ width: "100%" }}
                                        disabledDate={c => c && c.isBefore(dayjs(), 'day')}
                                        value={checkIn ? dayjs(checkIn) : null}
                                        onChange={(_, ds) => { setCheckIn(ds); setCheckOut(""); }}
                                    />
                                </div>
                                <div className="mb-field">
                                    <label>📅 Check-out Date</label>
                                    <DatePicker
                                        required
                                        style={{ width: "100%" }}
                                        disabledDate={c => {
                                            if (!c) return false;
                                            if (checkIn && c.isBefore(dayjs(checkIn).add(1, 'day'), 'day')) return true;
                                            if (!checkIn && c.isBefore(dayjs(), 'day')) return true;
                                            return false;
                                        }}
                                        value={checkOut ? dayjs(checkOut) : null}
                                        onChange={(_, ds) => setCheckOut(ds)}
                                    />
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="mb-field">
                                <label>💳 Payment Method</label>
                                <div className="mb-payment-options">
                                    <label className={`mb-pay-opt ${paymentMethod === 'cash' ? 'mb-pay-opt--active' : ''}`}>
                                        <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                                        🏨 Pay at Hotel
                                    </label>
                                    <label className={`mb-pay-opt ${paymentMethod === 'khalti' ? 'mb-pay-opt--active' : ''}`}>
                                        <input type="radio" name="payment" value="khalti" checked={paymentMethod === 'khalti'} onChange={() => setPaymentMethod('khalti')} />
                                        💜 Pay via Khalti
                                    </label>
                                </div>
                            </div>

                            {/* Summary */}
                            {getNights() > 0 && (
                                <div className="mb-summary">
                                    <h3>Price Summary</h3>
                                    {cart.map(room => (
                                        <div key={room.roomTypeId} className="mb-summary-row">
                                            <span>{room.roomTypeName} × {getNights()} night{getNights() > 1 ? 's' : ''}</span>
                                            <span>Rs. {getRoomTotal(room).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="mb-summary-total">
                                        <span>Grand Total</span>
                                        <span>Rs. {getGrandTotal().toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            {!localStorage.getItem("token") && (
                                <div className="mb-login-notice">
                                    ⚠️ You must <Link to="/login">log in</Link> to complete your booking.
                                </div>
                            )}

                            <button type="submit" className="mb-btn-confirm" disabled={submitting || getNights() <= 0}>
                                {submitting ? "Processing..." : `Confirm ${cart.reduce((s, r) => s + (r.quantity || 1), 0)} Room${cart.reduce((s, r) => s + (r.quantity || 1), 0) > 1 ? 's' : ''}`}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right — Info */}
                <div className="mb-info-col">
                    <div className="mb-info-card">
                        <h3>🛒 Multi-Room Booking</h3>
                        <p>All rooms are booked for the same dates in a single transaction. If any room becomes unavailable, the entire booking is cancelled automatically.</p>
                        <ul>
                            <li>✅ Single group reference for all rooms</li>
                            <li>✅ Atomic booking — all or nothing</li>
                            <li>✅ Manage all rooms from My Bookings</li>
                        </ul>
                    </div>
                    <div className="mb-info-card">
                        <h4>📋 Policies</h4>
                        <ul>
                            <li>✅ Free cancellation up to 24hrs before check-in</li>
                            <li>✅ Instant confirmation</li>
                            <li>✅ No hidden charges</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MultiBooking;
