import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STATUS_LABELS = {
    pending: 'Pending', reserved: 'Reserved', confirmed: 'Confirmed',
    checked_in: 'Checked In', checked_out: 'Checked Out', cancelled: 'Cancelled',
};

const POLICY_LABELS = {
    flexible: 'Flexible', '24_hours': 'Cancel up to 24h before check-in', non_refundable: 'Non-Refundable',
};

/**
 * Generate and download a booking receipt PDF.
 * @param {object|object[]} bookings  - single booking or array (multi-room)
 * @param {string} role               - 'customer' | 'admin'
 */
export function downloadBookingPdf(bookings, role = 'customer') {
    const list = Array.isArray(bookings) ? bookings : [bookings];
    const primary = list[0];
    const isMulti = list.length > 1;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 0;

    // ── Header bar ──────────────────────────────────────────────
    doc.setFillColor(108, 92, 231);
    doc.rect(0, 0, pageW, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('StayHub', 14, 12);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Booking Receipt', 14, 20);

    // Date top-right
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - 14, 20, { align: 'right' });

    y = 36;

    // ── Booking reference banner ─────────────────────────────────
    doc.setFillColor(245, 243, 255);
    doc.roundedRect(14, y, pageW - 28, 14, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(108, 92, 231);
    const refLabel = isMulti
        ? `Group Booking: ${primary.group_booking_reference || 'N/A'}`
        : `Booking Reference: ${primary.booking_reference}`;
    doc.text(refLabel, pageW / 2, y + 9, { align: 'center' });

    y += 22;

    // ── Hotel & Stay Info ────────────────────────────────────────
    doc.setTextColor(30, 30, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Hotel & Stay Details', 14, y);
    y += 2;

    autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14 },
        theme: 'grid',
        headStyles: { fillColor: [108, 92, 231], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 9, textColor: [40, 40, 60] },
        alternateRowStyles: { fillColor: [248, 246, 255] },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
        body: [
            ['Hotel', primary.hotel?.name || 'N/A'],
            ['Check-in Date', primary.check_in_date || 'N/A'],
            ['Check-out Date', primary.check_out_date || 'N/A'],
            ['Total Guests', list.reduce((s, b) => s + Number(b.num_guests || 0), 0).toString()],
            ['Booking Status', STATUS_LABELS[primary.status] || primary.status],
        ],
    });

    y = doc.lastAutoTable.finalY + 8;

    // ── Room(s) ──────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 50);
    doc.text(isMulti ? 'Rooms Booked' : 'Room Details', 14, y);
    y += 2;

    const roomRows = list.map((b, i) => [
        isMulti ? `Room ${i + 1}` : 'Room Type',
        b.room?.roomType?.type_name || b.room?.room_type?.type_name || 'N/A',
        b.booking_reference,
        `Rs. ${Number(b.total_amount).toLocaleString()}`,
        POLICY_LABELS[b.cancellation_policy] || b.cancellation_policy || 'N/A',
    ]);

    autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14 },
        theme: 'grid',
        head: [['#', 'Room Type', 'Reference', 'Amount', 'Cancellation Policy']],
        headStyles: { fillColor: [108, 92, 231], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 9, textColor: [40, 40, 60] },
        alternateRowStyles: { fillColor: [248, 246, 255] },
        body: roomRows,
    });

    y = doc.lastAutoTable.finalY + 8;

    // ── Payment Info ─────────────────────────────────────────────
    const payment = primary.payment;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 50);
    doc.text('Payment Details', 14, y);
    y += 2;

    const totalAmount = list.reduce((s, b) => s + Number(b.total_amount || 0), 0);

    const paymentRows = payment ? [
        ['Payment Method', payment.payment_method || primary.payment_method || 'Khalti'],
        ['Payment Status', payment.payment_status || 'N/A'],
        ['Amount Paid', `Rs. ${Number(payment.amount).toLocaleString()}`],
        ['Transaction ID', payment.transaction_id || 'N/A'],
        ['Payment Date', payment.payment_date ? new Date(payment.payment_date).toLocaleString() : 'N/A'],
    ] : [
        ['Payment Method', primary.payment_method === 'cash' ? 'Cash (Pay at Hotel)' : (primary.payment_method || 'N/A')],
        ['Payment Status', primary.status === 'reserved' ? 'Pending (Pay at Hotel)' : 'N/A'],
        ['Total Amount', `Rs. ${totalAmount.toLocaleString()}`],
    ];

    autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14 },
        theme: 'grid',
        headStyles: { fillColor: [108, 92, 231], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 9, textColor: [40, 40, 60] },
        alternateRowStyles: { fillColor: [248, 246, 255] },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
        body: paymentRows,
    });

    y = doc.lastAutoTable.finalY + 8;

    // ── Total summary box ────────────────────────────────────────
    doc.setFillColor(108, 92, 231);
    doc.roundedRect(pageW - 80, y, 66, 16, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`Total: Rs. ${totalAmount.toLocaleString()}`, pageW - 47, y + 10, { align: 'center' });

    y += 24;

    // ── Guest info (admin view shows guest details) ──────────────
    if (role === 'admin' && primary.user) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 50);
        doc.text('Guest Information', 14, y);
        y += 2;

        autoTable(doc, {
            startY: y,
            margin: { left: 14, right: 14 },
            theme: 'grid',
            headStyles: { fillColor: [108, 92, 231], textColor: 255, fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 9, textColor: [40, 40, 60] },
            alternateRowStyles: { fillColor: [248, 246, 255] },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
            body: [
                ['Guest Name', primary.user.name || 'N/A'],
                ['Email', primary.user.email || 'N/A'],
                ['Phone', primary.user.phone || 'N/A'],
            ],
        });

        y = doc.lastAutoTable.finalY + 8;
    }

    // ── Footer ───────────────────────────────────────────────────
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(245, 243, 255);
    doc.rect(0, pageH - 14, pageW, 14, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(108, 92, 231);
    doc.text('Thank you for choosing StayHub. For support: support@stayhub.com', pageW / 2, pageH - 5, { align: 'center' });

    // ── Save ─────────────────────────────────────────────────────
    const filename = isMulti
        ? `StayHub_Group_${primary.group_booking_reference || 'booking'}.pdf`
        : `StayHub_${primary.booking_reference}.pdf`;

    doc.save(filename);
}
