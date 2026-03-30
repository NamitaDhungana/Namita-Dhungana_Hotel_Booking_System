import { useState, useEffect } from "react";
import { Modal, App } from "antd";
import bookingService from "../services/bookingService";
import Pagination from "../components/Pagination";
import "./MyBookings.css";

// Only reserved (cash) bookings can be cancelled — confirmed = paid via Khalti = non-refundable
const CANCELLABLE_STATUSES = ['reserved'];

function CancelCountdown({ checkInDate }) {
  const [y, m, d] = checkInDate.split('-').map(Number);
  const checkInMidnight = new Date(y, m - 1, d, 0, 0, 0, 0);
  const deadline = new Date(checkInMidnight.getTime() - 24 * 60 * 60 * 1000);
  const msLeft = deadline - Date.now();

  if (msLeft <= 0) {
    return <span className="mb-countdown mb-countdown-expired">⛔ Cancellation window closed</span>;
  }

  const totalHours = Math.floor(msLeft / (1000 * 60 * 60));
  const mins = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

  if (totalHours >= 48) {
    const days = Math.floor(totalHours / 24);
    const hrs = totalHours % 24;
    return (
      <span className="mb-countdown mb-countdown-ok">
        ⏰ Cancel within: {days}d {hrs}h {mins}m
      </span>
    );
  }

  return (
    <span className={`mb-countdown ${totalHours < 6 ? 'mb-countdown-urgent' : 'mb-countdown-warn'}`}>
      ⏰ Cancel within: {totalHours}h {mins}m
    </span>
  );
}

/**
 * Group flat booking list by group_booking_reference.
 * Solo bookings (no group ref) are kept as single-item groups.
 * Returns array of groups: { groupRef, bookings[], isGroup }
 */
function groupBookings(bookings) {
  const map = new Map();
  const order = [];

  for (const b of bookings) {
    const key = b.group_booking_reference || `solo-${b.id}`;
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key).push(b);
  }

  return order.map((key) => {
    const items = map.get(key);
    return {
      groupRef: key,
      bookings: items,
      isGroup: items.length > 1,
    };
  });
}

function MyBookings() {
  const { message } = App.useApp();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModal, setCancelModal] = useState({ open: false, booking: null, eligibility: null });
  const [cancelReason, setCancelReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchBookings = (page = 1) => {
    setLoading(true);
    bookingService.getUserBookings(page)
      .then(res => {
        setBookings(res.data || res);
        setCurrentPage(res.current_page || 1);
        setLastPage(res.last_page || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(1); }, []);

  const handleViewDetails = async (group) => {
    setDetailLoading(true);
    setSelectedGroup([]); // open modal immediately with loader
    try {
      const details = await Promise.all(
        group.bookings.map((b) => bookingService.getBookingDetails(b.id))
      );
      setSelectedGroup(details);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenCancelModal = async (booking) => {
    setCancellingId(booking.id);
    try {
      const eligibility = await bookingService.checkCancellationEligibility(booking.id);
      setCancelModal({ open: true, booking, eligibility });
      setCancelReason('');
    } catch (e) {
      const msg = (typeof e === 'object' ? e?.message : e) || 'Could not check cancellation eligibility.';
      message.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const handleConfirmCancel = async () => {
    const { booking } = cancelModal;
    setCancellingId(booking.id);
    try {
      const res = await bookingService.cancelBooking(booking.id, cancelReason);
      message.success(res.message || 'Your booking has been successfully canceled.');
      setCancelModal({ open: false, booking: null, eligibility: null });
      fetchBookings();
    } catch (e) {
      const msg = (typeof e === 'object' ? e?.message : e) || 'Cancellation failed.';
      message.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const canStillCancel = (booking) => {
    if (booking.cancellation_policy === 'non_refundable') return false;
    if (booking.cancellation_policy === '24_hours') {
      const [y, m, d] = booking.check_in_date.split('-').map(Number);
      const checkInMidnight = new Date(y, m - 1, d, 0, 0, 0, 0);
      const deadline = new Date(checkInMidnight.getTime() - 24 * 60 * 60 * 1000);
      return Date.now() < deadline.getTime();
    }
    return true;
  };

  if (loading) return <div className="mb-loading">Loading your bookings...</div>;

  const groups = groupBookings(bookings);

  return (
    <div className="mb-container">
      <h1 className="mb-title">My Bookings</h1>

      {groups.length === 0 ? (
        <div className="mb-empty">You haven't made any bookings yet.</div>
      ) : (
        <div className="mb-list">
          {groups.map((group) => {            // For display, use the first booking's shared fields
            const primary = group.bookings[0];
            const isKhaltiPaid = primary.payment_method === 'khalti' || primary.cancellation_policy === 'non_refundable';
            const isCancellableStatus = group.bookings.every((b) => CANCELLABLE_STATUSES.includes(b.status));
            const withinWindow = canStillCancel(primary);
            const totalAmount = group.bookings.reduce((sum, b) => sum + Number(b.total_amount), 0);

            return (
              <div key={group.groupRef} className="mb-card">
                <div className="mb-card-info">
                  <h3>{primary.hotel?.name || "Hotel"}</h3>

                  {group.isGroup ? (
                    <div className="mb-rooms-list">
                      <span className="mb-multi-label">🛏 {group.bookings.length} Rooms:</span>
                      {group.bookings.map((b, i) => (
                        <p key={b.id} className="mb-room-item">
                          Room {i + 1}: {b.room?.roomType?.type_name || "Room"}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p><span>Room:</span> {primary.room?.roomType?.type_name || "Room"}</p>
                  )}

                  <p><span>Check-in:</span> {primary.check_in_date}</p>
                  <p><span>Check-out:</span> {primary.check_out_date}</p>
                  <p><span>Guests:</span> {group.bookings.reduce((s, b) => s + Number(b.num_guests), 0)}</p>
                </div>
                <div className="mb-card-right">
                  <span className={`mb-badge mb-badge-${primary.status}`}>{primary.status}</span>

                  {isKhaltiPaid && primary.status === 'confirmed' && (
                    <div className="mb-nonrefundable-tag">🚫 Non-Refundable</div>
                  )}

                  {primary.status === 'reserved' && (
                    <div className="mb-reserve-note">💵 Pay at hotel on check-in</div>
                  )}
                  {isCancellableStatus && !isKhaltiPaid && (
                    <CancelCountdown checkInDate={primary.check_in_date} />
                  )}

                  <div className="mb-amount">Rs. {totalAmount.toLocaleString()}</div>
                  <button className="mb-view-btn" onClick={() => handleViewDetails(group)}>
                    View Details
                  </button>

                  {/* Cancel — only for single bookings (group cancellation handled per-room) */}
                  {!group.isGroup && isCancellableStatus && !isKhaltiPaid && withinWindow && (
                    <button
                      className="mb-cancel-btn"
                      onClick={() => handleOpenCancelModal(primary)}
                      disabled={cancellingId === primary.id}
                    >
                      {cancellingId === primary.id ? 'Checking...' : 'Cancel Booking'}
                    </button>
                  )}

                  {!group.isGroup && isCancellableStatus && !isKhaltiPaid && !withinWindow && (
                    <button className="mb-cancel-btn mb-cancel-btn-disabled" disabled>
                      Cancellation Closed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={p => fetchBookings(p)} />

      {/* Cancellation Confirmation Modal */}
      <Modal
        open={cancelModal.open}
        onCancel={() => setCancelModal({ open: false, booking: null, eligibility: null })}
        footer={null}
        title="Cancel Booking"
        width={460}
      >
        {cancelModal.eligibility && (
          <div className="mb-cancel-modal">
            {cancelModal.eligibility.eligible ? (
              <>
                <div className="mb-cancel-warning">
                  ⚠️ Are you sure you want to cancel this booking?
                  <p className="mb-policy-note">
                    This reservation follows a 24-hour cancellation policy. Once cancelled, the room will be released.
                  </p>
                </div>
                <textarea
                  className="mb-cancel-reason"
                  placeholder="Reason for cancellation (optional)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                />
                <div className="mb-cancel-actions">
                  <button
                    className="mb-cancel-confirm-btn"
                    onClick={handleConfirmCancel}
                    disabled={cancellingId === cancelModal.booking?.id}
                  >
                    {cancellingId === cancelModal.booking?.id ? 'Cancelling...' : 'Yes, Cancel Booking'}
                  </button>
                  <button
                    className="mb-cancel-back-btn"
                    onClick={() => setCancelModal({ open: false, booking: null, eligibility: null })}
                  >
                    Go Back
                  </button>
                </div>
              </>
            ) : (
              <div className="mb-cancel-blocked">
                <div className="mb-cancel-blocked-icon">🚫</div>
                <p className="mb-cancel-blocked-msg">{cancelModal.eligibility.message}</p>
                <button
                  className="mb-cancel-back-btn"
                  onClick={() => setCancelModal({ open: false, booking: null, eligibility: null })}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Booking Detail Modal */}
      <Modal
        open={selectedGroup !== null}
        onCancel={() => setSelectedGroup(null)}
        footer={null}
        title={selectedGroup?.length > 1 ? `Booking Details (${selectedGroup.length} Rooms)` : "Booking Details"}
        width={560}
      >
        {detailLoading ? (
          <p>Loading...</p>
        ) : selectedGroup && selectedGroup.length > 0 ? (
          <div className="mb-modal-body">
            {selectedGroup.map((booking, idx) => (
              <div key={booking.id} className={selectedGroup.length > 1 ? "mb-room-detail-block" : ""}>
                {selectedGroup.length > 1 && (
                  <div className="mb-room-detail-header">🛏 Room {idx + 1}</div>
                )}
                <section>
                  <h4>Booking Info</h4>
                  <div className="mb-detail-row"><span>Reference</span><strong>{booking.booking_reference}</strong></div>
                  {idx === 0 && <div className="mb-detail-row"><span>Hotel</span><strong>{booking.hotel?.name}</strong></div>}
                  <div className="mb-detail-row"><span>Room Type</span><strong>{booking.room?.roomType?.type_name || booking.room?.room_type?.type_name || "N/A"}</strong></div>
                  {idx === 0 && <div className="mb-detail-row"><span>Check-in</span><strong>{booking.check_in_date}</strong></div>}
                  {idx === 0 && <div className="mb-detail-row"><span>Check-out</span><strong>{booking.check_out_date}</strong></div>}
                  <div className="mb-detail-row"><span>Guests</span><strong>{booking.num_guests}</strong></div>
                  <div className="mb-detail-row"><span>Status</span>
                    <span className={`mb-badge mb-badge-${booking.status}`}>{booking.status}</span>
                  </div>
                  <div className="mb-detail-row"><span>Amount</span><strong>Rs. {Number(booking.total_amount).toLocaleString()}</strong></div>
                  {booking.cancellation_policy && (
                    <div className="mb-detail-row">
                      <span>Cancellation Policy</span>
                      <strong>
                        {booking.cancellation_policy === 'non_refundable' ? '🚫 Non-Refundable' :
                         booking.cancellation_policy === '24_hours' ? '⏰ Cancel up to 24h before check-in' : '✅ Flexible'}
                      </strong>
                    </div>
                  )}
                  {booking.payment_method === 'cash' && (
                    <div className="mb-detail-row">
                      <span>Payment</span>
                      <strong style={{ color: '#2980b9' }}>💵 Pay at Hotel on Check-in</strong>
                    </div>
                  )}
                  {booking.cancelled_at && (
                    <div className="mb-detail-row">
                      <span>Cancelled At</span>
                      <strong>{new Date(booking.cancelled_at).toLocaleString()}</strong>
                    </div>
                  )}
                  {booking.cancellation_reason && (
                    <div className="mb-detail-row">
                      <span>Cancel Reason</span>
                      <strong>{booking.cancellation_reason}</strong>
                    </div>
                  )}
                </section>

                {booking.payment && (
                  <section>
                    <h4>Payment Info</h4>
                    <div className="mb-detail-row"><span>Method</span><strong>{booking.payment.payment_method || "Khalti"}</strong></div>
                    <div className="mb-detail-row"><span>Status</span>
                      <span className={`mb-badge mb-badge-${booking.payment.payment_status}`}>{booking.payment.payment_status}</span>
                    </div>
                    <div className="mb-detail-row"><span>Amount Paid</span><strong>Rs. {Number(booking.payment.amount).toLocaleString()}</strong></div>
                    {booking.payment.transaction_id && (
                      <div className="mb-detail-row"><span>Transaction ID</span><strong>{booking.payment.transaction_id}</strong></div>
                    )}
                    {booking.payment.payment_date && (
                      <div className="mb-detail-row"><span>Paid On</span><strong>{new Date(booking.payment.payment_date).toLocaleString()}</strong></div>
                    )}
                  </section>
                )}
              </div>
            ))}

            {selectedGroup.length > 1 && (
              <div className="mb-detail-row mb-group-total">
                <span>Total (All Rooms)</span>
                <strong>Rs. {selectedGroup.reduce((s, b) => s + Number(b.total_amount), 0).toLocaleString()}</strong>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default MyBookings;
