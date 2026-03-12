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

  // Form State
  const [formData, setFormData] = useState({
    check_in: "",
    check_out: "",
    guests: 1,
  });

  useEffect(() => {
    if (!roomTypeId) {
      setError("No room selected for booking.");
      setLoading(false);
      return;
    }

    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const data = await hotelService.showRoomType(roomTypeId);
        setRoomType(data);
      } catch (err) {
        console.error("Failed to fetch room for booking:", err);
        setError("Could not load room details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomTypeId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getNights = () => {
    if (!formData.check_in || !formData.check_out) return 0;
    const start = new Date(formData.check_in);
    const end = new Date(formData.check_out);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const calculateTotal = () => {
    if (!roomType) return 0;
    const nights = getNights();
    return nights * parseFloat(roomType.base_price || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem("token")) {
      alert("Please login to book a room.");
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);
      const bookingData = {
        room_type_id: roomTypeId,
        hotel_id: roomType.hotel_id,
        check_in: formData.check_in,
        check_out: formData.check_out,
        guests: formData.guests,
        total_price: calculateTotal(),
      };

      await bookingService.createBooking(bookingData);
      alert("Booking successful!");
      navigate("/profile");
    } catch (err) {
      console.error("Booking failed:", err);
      setError(err.message || "Something went wrong during booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Preparing your unique stay...</div>;
  if (error) return <div className="error-message">Oops! {error}</div>;

  return (
    <div className="booking-container">
      <div className="booking-content">

        {/* Left Side: Form */}
        <div className="booking-left">
          <div className="booking-header">
            <h1>Confirm Reservation</h1>
            <p>Fill in the details to secure your premium stay.</p>
          </div>

          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="date-inputs">
              <div className="form-group">
                <label>Arrival Date</label>
                <div className="input-wrapper">
                  <input
                    type="date"
                    name="check_in"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.check_in}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Departure Date</label>
                <div className="input-wrapper">
                  <input
                    type="date"
                    name="check_out"
                    required
                    min={formData.check_in || new Date().toISOString().split("T")[0]}
                    value={formData.check_out}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Number of Guests</label>
              <div className="input-wrapper">
                <input
                  type="number"
                  name="guests"
                  min="1"
                  max={roomType.max_occupancy || 4}
                  required
                  value={formData.guests}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="payment-summary">
              <div className="summary-row">
                <span>Price per night</span>
                <span>Rs. {parseFloat(roomType.base_price).toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Nights</span>
                <span>{getNights()} nights</span>
              </div>
              <div className="summary-row">
                <span>Service Fee</span>
                <span>Included</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount</span>
                <span>Rs. {calculateTotal().toLocaleString()}</span>
              </div>
            </div>

            <button type="submit" className="btn-confirm" disabled={submitting || calculateTotal() <= 0}>
              {submitting ? "Processing..." : "Confirm & Pay Now"}
            </button>
          </form>
        </div>

        {/* Right Side: Room Card */}
        <div className="booking-right">
          <div className="room-summary-card">
            <img src={roomType.featured_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} alt={roomType.type_name} />
            <div className="room-details-text">
              <h2>{roomType.type_name}</h2>
              <div className="room-meta">
                <span>📍 {roomType.hotel?.name || "Premium Hotel"}</span>
                <span>👥 Max guests: {roomType.max_occupancy || 4}</span>
                <span>⭐ Highly rated by travelers</span>
              </div>
              <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: '1.6' }}>
                This room offers a premium experience with all modern amenities and a stunning view of the surroundings.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Booking;