import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import hotelService from "../services/hotelService";
import bookingService from "../services/bookingService";
import "./Booking.css";

function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomTypeId = searchParams.get("roomTypeId");

  const [roomType, setRoomType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const [formData, setFormData] = useState({
    check_in_date: "",
    check_out_date: "",
    num_guests: 1,
  });

  useEffect(() => {
    if (!roomTypeId) {
      setError("no_room");
      setLoading(false);
      return;
    }
    const fetchRoom = async () => {
      try {
        const data = await hotelService.showRoomType(roomTypeId);
        setRoomType(data);
      } catch (err) {
        setError("load_fail");
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
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    if (getNights() <= 0) {
      alert("Please select valid check-in and check-out dates.");
      return;
    }
    try {
      setSubmitting(true);
      const result = await bookingService.createBooking({
        hotel_id: roomType.hotel_id,
        room_type_id: parseInt(roomTypeId),
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        num_guests: parseInt(formData.num_guests),
        total_amount: getTotal(),
      });
      setBookingSuccess(result);
    } catch (err) {
      console.error("Booking submission error:", err);
      const msg = err?.message || "Booking failed. Please try again.";
      if (msg.toLowerCase().includes("unauthenticated") || err?.status === 401) {
        setError("auth_fail");
      } else {
        setError("book_fail:" + msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

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
          Login & Continue
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
    return (
      <div className="bk-success-page">
        <div className="bk-success-card">
          <div className="bk-success-icon">✅</div>
          <h2>Booking Confirmed!</h2>
          <p>Your reservation has been placed successfully.</p>
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
          </div>
          <div className="bk-success-actions">
            <Link to="/userProfile" className="bk-btn-primary">View My Bookings</Link>
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
                  <input
                    type="date"
                    required
                    min={today}
                    value={formData.check_in_date}
                    onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value, check_out_date: "" })}
                  />
                </div>
                <div className="bk-field">
                  <label>📅 Check-out Date</label>
                  <input
                    type="date"
                    required
                    min={formData.check_in_date || today}
                    value={formData.check_out_date}
                    onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
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

              {!localStorage.getItem("token") && (
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
                roomType?.featured_image ||
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
              <li>✅ Free cancellation up to 24hrs before check-in</li>
              <li>✅ Breakfast included on request</li>
              <li>✅ Instant confirmation</li>
              <li>✅ No hidden charges</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booking;