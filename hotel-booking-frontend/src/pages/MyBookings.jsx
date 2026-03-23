import { useState, useEffect } from "react";
import { Modal } from "antd";
import bookingService from "../services/bookingService";
import authService from "../services/authService";
import "./MyBookings.css";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    bookingService.getUserBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleViewDetails = async (id) => {
    setDetailLoading(true);
    try {
      const data = await bookingService.getBookingDetails(id);
      setSelectedBooking(data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) return <div className="mb-loading">Loading your bookings...</div>;

  return (
    <div className="mb-container">
      <h1 className="mb-title">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="mb-empty">You haven't made any bookings yet.</div>
      ) : (
        <div className="mb-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="mb-card">
              <div className="mb-card-info">
                <h3>{booking.hotel?.name || "Hotel"}</h3>
                <p><span>Room:</span> {booking.room?.roomType?.type_name || "Room"}</p>
                <p><span>Check-in:</span> {booking.check_in_date}</p>
                <p><span>Check-out:</span> {booking.check_out_date}</p>
                <p><span>Guests:</span> {booking.num_guests}</p>
              </div>
              <div className="mb-card-right">
                <span className={`mb-badge mb-badge-${booking.status}`}>{booking.status}</span>
                <div className="mb-amount">Rs. {Number(booking.total_amount).toLocaleString()}</div>
                <button className="mb-view-btn" onClick={() => handleViewDetails(booking.id)}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!selectedBooking}
        onCancel={() => setSelectedBooking(null)}
        footer={null}
        title="Booking Details"
        width={520}
      >
        {detailLoading ? (
          <p>Loading...</p>
        ) : selectedBooking ? (
          <div className="mb-modal-body">
            <section>
              <h4>Booking Info</h4>
              <div className="mb-detail-row"><span>Reference</span><strong>{selectedBooking.booking_reference}</strong></div>
              <div className="mb-detail-row"><span>Hotel</span><strong>{selectedBooking.hotel?.name}</strong></div>
              <div className="mb-detail-row"><span>Room Type</span><strong>{selectedBooking.room?.roomType?.type_name || selectedBooking.room?.room_type?.type_name || "N/A"}</strong></div>
              <div className="mb-detail-row"><span>Check-in</span><strong>{selectedBooking.check_in_date}</strong></div>
              <div className="mb-detail-row"><span>Check-out</span><strong>{selectedBooking.check_out_date}</strong></div>
              <div className="mb-detail-row"><span>Guests</span><strong>{selectedBooking.num_guests}</strong></div>
              <div className="mb-detail-row"><span>Status</span>
                <span className={`mb-badge mb-badge-${selectedBooking.status}`}>{selectedBooking.status}</span>
              </div>
              <div className="mb-detail-row"><span>Total Amount</span><strong>Rs. {Number(selectedBooking.total_amount).toLocaleString()}</strong></div>
            </section>

            {selectedBooking.payment && (
              <section>
                <h4>Payment Info</h4>
                <div className="mb-detail-row"><span>Method</span><strong>{selectedBooking.payment.payment_method || "Khalti"}</strong></div>
                <div className="mb-detail-row"><span>Status</span>
                  <span className={`mb-badge mb-badge-${selectedBooking.payment.payment_status}`}>{selectedBooking.payment.payment_status}</span>
                </div>
                <div className="mb-detail-row"><span>Amount Paid</span><strong>Rs. {Number(selectedBooking.payment.amount).toLocaleString()}</strong></div>
                {selectedBooking.payment.transaction_id && (
                  <div className="mb-detail-row"><span>Transaction ID</span><strong>{selectedBooking.payment.transaction_id}</strong></div>
                )}
                {selectedBooking.payment.payment_date && (
                  <div className="mb-detail-row"><span>Paid On</span><strong>{new Date(selectedBooking.payment.payment_date).toLocaleString()}</strong></div>
                )}
              </section>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default MyBookings;
