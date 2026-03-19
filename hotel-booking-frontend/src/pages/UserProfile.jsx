import { useState, useEffect } from "react";
import authService from "../services/authService";
import bookingService from "../services/bookingService";
import "./UserProfile.css";

function UserProfile() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Ensure we have the latest user info
        const profile = await authService.getProfile();
        setUser(profile);

        // Fetch bookings
        const bookingsData = await bookingService.getUserBookings();
        setBookings(bookingsData);
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
        setError("Could not load profile information.");
      } finally {
        setLoading(false);
      }
    };

    if (authService.isAuthenticated()) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="loading">Loading your profile...</div>;
  if (!user) return <div className="error">Please login to view your profile.</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p>📧 {user.email}</p>
          <p>📞 {user.phone || 'N/A'}</p>
        </div>
      </div>

      <div className="bookings-section">
        <h2>Your Bookings</h2>
        {error && <p className="error-message">{error}</p>}

        <div className="bookings-list">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-meta">
                  <h3>{booking.hotel?.name || 'Hotel'}</h3>
                  <p><strong>Room:</strong> {booking.room?.roomType?.type_name || 'Room'}</p>
                  <p>📅 {booking.check_in_date} TO {booking.check_out_date}</p>
                  <p>👥 {booking.num_guests} Guests</p>
                </div>
                <div className="booking-status">
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status}
                  </span>
                  <div className="price-box">
                    Total: Rs. {booking.total_amount?.toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-bookings">
              <p>You haven't made any bookings yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;