import { useState, useEffect } from "react";
import "./roomDetails.css";
import { useParams, Link } from "react-router-dom";
import hotelService from "../services/hotelService";

function RoomDetails() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const data = await hotelService.showRoomType(id);
        setRoom(data);
      } catch (err) {
        console.error("Failed to fetch room details:", err);
        setError("Could not load room details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id]);

  if (loading) return <div className="loading">Loading room details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!room) return <div className="error">Room not found.</div>;

  return (
    <div className="room-details-page">

      <div className="image-box">
        <img src={room.featured_image || "https://via.placeholder.com/800x500?text=Room+Image"} alt={room.type_name} />
      </div>

      <div className="details-box">

        <h1>{room.type_name}</h1>
        <p className="location">
          {room.hotel ? (
            <>🏨 {room.hotel.name} - {room.hotel.city}</>
          ) : (
            <>🏨 StayHub Partner Hotel - Nepal</>
          )}
        </p>

        <h3>Room Features</h3>
        <ul>
          <li>Max Occupancy: {room.max_occupancy} Guests</li>
          {room.amenities && Array.isArray(room.amenities) ? (
            room.amenities.map((amenity, index) => (
              <li key={index}>{amenity}</li>
            ))
          ) : (
            <>
              <li>Air Conditioning</li>
              <li>Premium Bedding</li>
              <li>Private Bathroom</li>
              <li>Flat Screen TV</li>
            </>
          )}
        </ul>

        <p className="desc">{room.description || "Indulge in comfort and luxury. This elegantly designed room offers everything you need for a perfect stay, including premium amenities and beautiful views."}</p>

        <p className="price">Price: <strong>Rs. {parseFloat(room.base_price || 0).toLocaleString()} / night</strong></p>

        <Link to={`/booking?roomTypeId=${room.id}`}>
          <button className="book-btn">Book Now</button>
        </Link>
      </div>

    </div>
  );
}

export default RoomDetails;
