import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { DatePicker, message, App } from "antd";
import dayjs from "dayjs";
import hotelService from "../services/hotelService";
import bookingService from "../services/bookingService";
import settingsService from "../services/settingsService";
import authService from "../services/authService";
import "./Booking.css";

function Booking() {
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomTypeId = searchParams.get("roomTypeId");

  const [roomType, setRoomType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [isShutdown, setIsShutdown] = useState(false);

  const [formData, setFormData] = useState({
    check_in_date:  searchParams.get("checkIn")  || "",
    check_out_date: searchParams.get("checkOut") || "",
    num_guests:     Number(searchParams.get("adults") || 1),
  });

  // Khalti modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [khaltiLoading, setKhaltiLoading] = useState(false);
  const [reserveLoading, setReserveLoading] = useState(false);

  // Fallback static rooms matching Rooms.jsx
  const fallbackRoomTypes = [
    { id: 101, hotel_id: 1, type_name: "Deluxe Single Room", base_price: 3500, max_occupancy: 1, hotel: { name: "Hotel Grand Pokhara", city: "Pokhara" } },
    { id: 102, hotel_id: 1, type_name: "Luxury Double Suite", base_price: 7500, max_occupancy: 2, hotel: { name: "Hotel Grand Pokhara", city: "Pokhara" } },
    { id: 103, hotel_id: 2, type_name: "Standard Twin Room", base_price: 4200, max_occupancy: 2, hotel: { name: "Royal Kathmandu Stay", city: "Kathmandu" } },
    { id: 104, hotel_id: 3, type_name: "Safari View Suite", base_price: 6800, max_occupancy: 3, hotel: { name: "Park Safari Resort", city: "Chitwan" } },
    { id: 105, hotel_id: 4, type_name: "Mountain View Deluxe", base_price: 9500, max_occupancy: 2, hotel: { name: "Club Himalayan Nagarkot Resort", city: "Nagarkot" } },
  ];

  useEffect(() => {
    settingsService.get().then(s => {
      if (s.shutdown_website === '1') setIsShutdown(true);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!roomTypeId) {
      setError("no_room");
      setLoading(false);
      return;
    }
    const fetchRoom = async () => {
      try {
        const data = await hotelService.showRoomType(roomTypeId);
        if (data) {
          setRoomType(data);
          const dates = await hotelService.getUnavailableDates(roomTypeId);
          setUnavailableDates(dates || []);
        } else {
          // Try fallback
          const fallback = fallbackRoomTypes.find(r => r.id === parseInt(roomTypeId));
          if (fallback) {
            setRoomType(fallback);
          } else {
            setError("load_fail");
          }
        }
      } catch (err) {
        console.error("Failed to fetch room, checking fallbacks:", err);
        const fallback = fallbackRoomTypes.find(r => r.id === parseInt(roomTypeId));
        if (fallback) {
          setRoomType(fallback);
        } else {
          setError("load_fail");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomTypeId]);

  const getNights = () => {
    if (!formData.check_in_date || !formData.check_out_date) return 0;
    const diff = (new Date(formData.check_out_date) - new Date(formData.check_in_date)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  };

  const getTotal = () => {
    if (!roomType) return 0;
    return getNights() * parseFloat(roomType.base_price || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authService.isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (getNights() <= 0) {
      message.warning("Please select valid check-in and check-out dates.");
      return;
    }
    // Open payment modal — booking is created only after user picks payment
    setShowPayModal(true);
  };

  const handleKhaltiPay = async () => {
    try {
      setKhaltiLoading(true);
      // Step 1: create booking with payment_method=khalti
      // non_refundable policy for Khalti payments (paid = confirmed = no cancel)
      const result = await bookingService.createBooking({
        hotel_id: roomType.hotel_id,
        room_type_id: parseInt(roomTypeId),
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        num_guests: parseInt(formData.num_guests),
        total_amount: getTotal(),
        payment_method: "khalti",
        cancellation_policy: "non_refundable",
      });

      if (result.payment_url) {
        // Step 2: redirect to Khalti
        window.location.href = result.payment_url;
      } else {
        setShowPayModal(false);
        setError("book_fail:Khalti payment URL not received. Please try again.");
      }
    } catch (err) {
      setShowPayModal(false);
      const msg = err?.message || "Booking failed. Please try again.";
      if (msg.toLowerCase().includes("unauthenticated") || err?.status === 401) {
        setError("auth_fail");
      } else {
        setError("book_fail:" + msg);
      }
    } finally {
      setKhaltiLoading(false);
    }
  };

  const handleReserve = async () => {
    try {
      setReserveLoading(true);
      const result = await bookingService.createBooking({
        hotel_id: roomType.hotel_id,
        room_type_id: parseInt(roomTypeId),
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        num_guests: parseInt(formData.num_guests),
        total_amount: getTotal(),
        payment_method: "cash",
        is_reservation: true,
        cancellation_policy: "24_hours",
      });
      setShowPayModal(false);
      setBookingSuccess(result.booking);
    } catch (err) {
      setShowPayModal(false);
      const msg = err?.message || "Reservation failed. Please try again.";
      if (msg.toLowerCase().includes("unauthenticated") || err?.status === 401) {
        setError("auth_fail");
      } else {
        setError("book_fail:" + msg);
      }
    } finally {
      setReserveLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  // ── Shutdown ─────────────────────────────────────────────
  if (isShutdown) {
    return (
      <div style={{
        minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div style={{
          textAlign: 'center', maxWidth: 520,
          background: '#fff', borderRadius: 16,
          padding: '52px 40px',
          boxShadow: '0 8px 40px rgba(108,92,231,0.10)',
          border: '1px solid #f0eeff',
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🔧</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#2D1B69', margin: '0 0 12px' }}>
            Bookings Temporarily Unavailable
          </h2>
          <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, margin: '0 0 28px' }}>
            We're currently performing scheduled maintenance to improve your experience.
            New bookings are paused during this time. Please check back soon — we'll be up shortly.
          </p>
          <div style={{
            background: '#fdf6ff', border: '1px solid #e8d5ff',
            borderRadius: 10, padding: '14px 20px',
            fontSize: 13, color: '#6C5CE7', marginBottom: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            🕐 We apologize for the inconvenience. Thank you for your patience.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/hotels" style={{
              background: '#6C5CE7', color: '#fff', padding: '11px 24px',
              borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14,
            }}>
              Browse Hotels
            </Link>
            <Link to="/contact" style={{
              background: '#fff', color: '#6C5CE7', padding: '11px 24px',
              borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14,
              border: '1.5px solid #6C5CE7',
            }}>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bk-loading">
        <div className="bk-spinner"></div>
        <p>Preparing your stay...</p>
      </div>
    );
  }

  // ── No room selected ─────────────────────────────────────
  if (error === "no_room") {
    return (
      <div className="bk-empty">
        <div className="bk-empty-icon">🏨</div>
        <h2>No Room Selected</h2>
        <p>Please browse our hotels and click <strong>"Reserve Now"</strong> on a room to start your booking.</p>
        <Link to="/hotels" className="bk-btn-primary">Browse Hotels</Link>
      </div>
    );
  }

  // ── Load fail ────────────────────────────────────────────
  if (error === "load_fail") {
    return (
      <div className="bk-empty">
        <div className="bk-empty-icon">⚠️</div>
        <h2>Could Not Load Room</h2>
        <p>There was a problem fetching room details. Please go back and try again.</p>
        <Link to="/hotels" className="bk-btn-primary">Back to Hotels</Link>
      </div>
    );
  }

  // ── Booking error ─────────────────────────────────────────
  if (error === "auth_fail") {
    return (
      <div className="bk-empty">
        <div className="bk-empty-icon">🔐</div>
        <h2>Session Expired</h2>
        <p>You need to be logged in to complete your booking. Your current session may have expired.</p>
        <button 
          className="bk-btn-primary" 
          onClick={() => navigate(`/login?redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
        >
          Login and Continue
        </button>
      </div>
    );
  }

  if (error && error.startsWith("book_fail:")) {
    const msg = error.replace("book_fail:", "");
    return (
      <div className="bk-empty">
        <div className="bk-empty-icon">❌</div>
        <h2>Booking Failed</h2>
        <p>{msg}</p>
        <button className="bk-btn-primary" onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }

  // ── Booking Success ───────────────────────────────────────
  if (bookingSuccess) {
    const isReservation = bookingSuccess.status === 'reserved' || bookingSuccess.payment_method === 'cash';
    const policy = bookingSuccess.cancellation_policy;
    const isNonRefundable = policy === 'non_refundable';
    const is24Hours = policy === '24_hours';
    return (
      <div className="bk-success-page">
        <div className="bk-success-card">
          <div className="bk-success-icon">{isReservation ? '🏨' : '✅'}</div>
          <h2>{isReservation ? 'Room Reserved!' : 'Booking Confirmed!'}</h2>
          <p>{isReservation
            ? 'Your room is reserved. Please pay at the hotel on check-in.'
            : 'Your reservation has been placed successfully.'}</p>
          {isReservation && (
            <div className="bk-reserve-notice">
              💡 Bring this reference to the front desk. Payment is due on arrival.
            </div>
          )}
          {isNonRefundable && (
            <div className="bk-nonrefundable-notice">
              🚫 This booking is 100% non-refundable and cannot be canceled after confirmation/payment.
            </div>
          )}
          {is24Hours && !isNonRefundable && (
            <div className="bk-policy-notice">
              ⏰ This booking can only be canceled at least 24 hours before check-in.
            </div>
          )}
          <div className="bk-success-ref">
            Booking Reference: <strong>{bookingSuccess.booking_reference}</strong>
          </div>
          <div className="bk-success-details">
            <div><span>Hotel</span><strong>{roomType?.hotel?.name || "—"}</strong></div>
            <div><span>Room</span><strong>{roomType?.type_name}</strong></div>
            <div><span>Check-in</span><strong>{formData.check_in_date}</strong></div>
            <div><span>Check-out</span><strong>{formData.check_out_date}</strong></div>
            <div><span>Guests</span><strong>{formData.num_guests}</strong></div>
            <div><span>Total</span><strong>Rs. {getTotal().toLocaleString()}</strong></div>
            {isReservation && <div><span>Payment</span><strong>Pay at Hotel</strong></div>}
          </div>
          <div className="bk-success-actions">
            <Link to="/my-bookings" className="bk-btn-primary">View My Bookings</Link>
            <Link to="/hotels" className="bk-btn-outline">Browse More Hotels</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Booking Page ─────────────────────────────────────
  return (
    <div className="bk-page">
      <div className="bk-breadcrumb">
        <Link to="/hotels">Hotels</Link> &rsaquo;
        <Link to={`/hotels/${roomType?.hotel_id}`}>{roomType?.hotel?.name || "Hotel"}</Link> &rsaquo;
        <span>Book</span>
      </div>

      <div className="bk-layout">
        {/* ── LEFT: Form ── */}
        <div className="bk-form-col">
          <div className="bk-section-card">
            <h1 className="bk-title">Confirm Your Reservation</h1>
            <p className="bk-subtitle">Fill in the details below to secure your stay.</p>

            <form onSubmit={handleSubmit} className="bk-form">
              {/* Dates */}
              <div className="bk-field-group">
                <div className="bk-field">
                  <label>📅 Check-in Date</label>
                  <DatePicker
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ebf0ff" }}
                    disabledDate={(current) => {
                      if (!current) return false;
                      if (current.isBefore(dayjs(), 'day')) return true;
                      return unavailableDates.includes(current.format('YYYY-MM-DD'));
                    }}
                    value={formData.check_in_date ? dayjs(formData.check_in_date) : null}
                    onChange={(date, dateString) => setFormData({ ...formData, check_in_date: dateString, check_out_date: "" })}
                  />
                </div>
                <div className="bk-field">
                  <label>📅 Check-out Date</label>
                  <DatePicker
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ebf0ff" }}
                    disabledDate={(current) => {
                      if (!current) return false;
                      if (formData.check_in_date && current.isBefore(dayjs(formData.check_in_date).add(1, 'day'), 'day')) return true;
                      if (!formData.check_in_date && current.isBefore(dayjs(), 'day')) return true;
                      return unavailableDates.includes(current.format('YYYY-MM-DD'));
                    }}
                    value={formData.check_out_date ? dayjs(formData.check_out_date) : null}
                    onChange={(date, dateString) => setFormData({ ...formData, check_out_date: dateString })}
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="bk-field">
                <label>👥 Number of Guests</label>
                <input
                  type="number"
                  min="1"
                  max={roomType?.max_occupancy || 4}
                  required
                  value={formData.num_guests}
                  onChange={(e) => setFormData({ ...formData, num_guests: e.target.value })}
                />
                <span className="bk-hint">Max capacity: {roomType?.max_occupancy || 4} guests</span>
              </div>

              {/* Price Summary */}
              {getNights() > 0 && (
                <div className="bk-summary">
                  <h3>Price Summary</h3>
                  <div className="bk-summary-row">
                    <span>Rs. {parseFloat(roomType?.base_price).toLocaleString()} × {getNights()} night{getNights() > 1 ? "s" : ""}</span>
                    <span>Rs. {getTotal().toLocaleString()}</span>
                  </div>
                  <div className="bk-summary-row">
                    <span>Service Fee</span>
                    <span>Included</span>
                  </div>
                  <div className="bk-summary-total">
                    <span>Total</span>
                    <span>Rs. {getTotal().toLocaleString()}</span>
                  </div>
                </div>
              )}

              {!authService.isAuthenticated() && (
                <div className="bk-login-notice">
                  ⚠️ You must <Link to="/login">log in</Link> to complete your booking.
                </div>
              )}

              <button
                type="submit"
                className="bk-btn-confirm"
                disabled={submitting || getNights() <= 0}
              >
                {submitting ? (
                  <><span className="bk-btn-spinner"></span> Processing...</>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── RIGHT: Room Card ── */}
        <div className="bk-room-col">
          <div className="bk-room-card">
            <img
              src={
                roomType?.room_image_url ||
                roomType?.hotel?.featured_image ||
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
              }
              alt={roomType?.type_name}
              className="bk-room-img"
            />
            <div className="bk-room-body">
              <div className="bk-room-badge">Selected Room</div>
              <h2 className="bk-room-name">{roomType?.type_name}</h2>
              <p className="bk-room-hotel">📍 {roomType?.hotel?.name || "Premium Hotel"}</p>

              <div className="bk-room-features">
                <span>👥 Up to {roomType?.max_occupancy} guests</span>
                <span>🛏️ Premium bedding</span>
                <span>🚿 En-suite bathroom</span>
                <span>📶 Free WiFi</span>
              </div>

              <div className="bk-room-price">
                <span className="bk-price-amount">Rs. {parseFloat(roomType?.base_price || 0).toLocaleString()}</span>
                <span className="bk-price-night">/ night</span>
              </div>

              {roomType?.description && (
                <p className="bk-room-desc">{roomType.description}</p>
              )}
            </div>
          </div>

          <div className="bk-policy-card">
            <h4>📋 Booking Policies</h4>
            <ul>
              <li>⏰ Cash reservations: free cancellation up to 24hrs before check-in</li>
              <li>🚫 Khalti payments: 100% non-refundable after payment</li>
              <li>✅ Breakfast included on request</li>
              <li>✅ Instant confirmation</li>
              <li>✅ No hidden charges</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Khalti Payment Modal ── */}
      {showPayModal && (
        <div className="bk-modal-overlay" onClick={() => !khaltiLoading && setShowPayModal(false)}>
          <div className="bk-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="bk-modal-close"
              onClick={() => setShowPayModal(false)}
              disabled={khaltiLoading}
            >
              ✕
            </button>

            <div className="bk-modal-header">
              <div className="bk-modal-icon">💳</div>
              <h2>Complete Your Payment</h2>
              <p>Review your booking and pay securely via Khalti</p>
            </div>

            <div className="bk-modal-summary">
              <div className="bk-modal-row">
                <span>Room</span>
                <strong>{roomType?.type_name}</strong>
              </div>
              <div className="bk-modal-row">
                <span>Hotel</span>
                <strong>{roomType?.hotel?.name}</strong>
              </div>
              <div className="bk-modal-row">
                <span>Check-in</span>
                <strong>{formData.check_in_date}</strong>
              </div>
              <div className="bk-modal-row">
                <span>Check-out</span>
                <strong>{formData.check_out_date}</strong>
              </div>
              <div className="bk-modal-row">
                <span>Guests</span>
                <strong>{formData.num_guests}</strong>
              </div>
              <div className="bk-modal-row bk-modal-total">
                <span>Total Amount</span>
                <strong>Rs. {getTotal().toLocaleString()}</strong>
              </div>
            </div>

            <div className="bk-nonrefundable-warning">
              🚫 Khalti payments are 100% non-refundable and cannot be canceled after payment.
            </div>

            <button
              className="bk-btn-khalti"
              onClick={handleKhaltiPay}
              disabled={khaltiLoading || reserveLoading}
            >
              {khaltiLoading ? (
                <><span className="bk-btn-spinner"></span> Redirecting to Khalti...</>
              ) : (
                <>
                  <img
                    src="https://khalti.com/static/khalti-logo.png"
                    alt="Khalti"
                    className="bk-khalti-logo"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  Pay Rs. {getTotal().toLocaleString()} via Khalti
                </>
              )}
            </button>

            <div className="bk-modal-divider">
              <span>or</span>
            </div>

            <div className="bk-24hr-warning">
              ⏰ Cash reservations can be canceled up to 24 hours before check-in.
            </div>

            <button
              className="bk-btn-reserve"
              onClick={handleReserve}
              disabled={khaltiLoading || reserveLoading}
            >
              {reserveLoading ? (
                <><span className="bk-btn-spinner"></span> Reserving...</>
              ) : (
                <>🏨 Reserve Now — Pay at Hotel</>
              )}
            </button>

            <p className="bk-modal-note">
              🔒 You will be redirected to Khalti's secure payment page
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;