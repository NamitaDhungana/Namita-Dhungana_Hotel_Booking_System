import { useState, useEffect } from "react";
import "./rooms.css";
import { Link, useSearchParams } from "react-router-dom";
import hotelService from "../services/hotelService";

function Rooms() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const hotelId = searchParams.get("hotelId");

  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        let data;
        if (hotelId) {
          data = await hotelService.getRoomTypesByHotel(hotelId);
        } else if (category) {
          // Assuming the backend can filter by property type or we filter on frontend for now
          // If the backend doesn't support it directly, we fetch all and filter
          const allRooms = await hotelService.getAllRoomTypes();
          data = allRooms.filter(room =>
            room.type_name?.toLowerCase().includes(category.toLowerCase()) ||
            room.hotel?.property_type?.name?.toLowerCase().includes(category.toLowerCase())
          );
        } else {
          data = await hotelService.getAllRoomTypes();
        }
        setRoomTypes(data);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
        setError("Could not load rooms. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [hotelId, category]);

  if (loading) return <div className="loading">Loading rooms...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="rooms-page">
      <h1 className="title">Available Rooms</h1>
      <p className="subtitle">
        {hotelId ? "Choose a room from this hotel" : "Choose a room that fits your comfort"}
      </p>

      <div className="rooms-grid">
        {roomTypes.length > 0 ? (
          roomTypes.map((type) => (
            <div key={type.id} className="rooms-card">
              <img
                src={type.featured_image || "https://via.placeholder.com/500x300?text=Room+Image"}
                alt={type.type_name}
              />
              <h3>{type.type_name}</h3>
              <p>{type.max_occupancy} Guests • {type.hotel?.name || "Premium Stay"}</p>
              <p className="price">NPR {parseFloat(type.base_price || 0).toLocaleString()} / night</p>
              <Link to={`/rooms/${type.id}?roomTypeId=${type.id}`} className="btn">View Details</Link>
            </div>
          ))
        ) : (
          <p>No rooms found for this hotel.</p>
        )}
      </div>
    </div>
  );
}

export default Rooms;
