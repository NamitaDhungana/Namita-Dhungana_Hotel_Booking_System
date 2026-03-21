import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import hotelService from "../services/hotelService";
import authService from "../services/authService";
import "./roomDetails.css";

const ROOM_IMAGES = [
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
];

// Map amenity names to emojis
const AMENITY_ICONS = {
    "Air Conditioner": "❄️", "TV": "📺", "Coffee Maker": "☕", "Room Heater": "🔥",
    "Free WiFi": "📶", "Gym": "🏋️", "Swimming Pool": "🏊", "Spa": "💆",
    "Meeting Room": "🤝", "Parking": "🅿️", "Restaurant": "🍽️", "Laundry Service": "🧺",
    "Kitchen": "🍳", "Bedroom": "🛏️", "Balcony": "🌅", "Living Room": "🛋️",
    "Private Bathroom": "🚿", "Sea View": "🌊", "Mountain View": "⛰️",
};

function RoomDetails() {
    const { id } = useParams();
    const user = authService.getCurrentUser();
    const canBook = !user || user.role === 'customer';

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        hotelService.showRoomType(id)
            .then(data => {
                if (data && data.id) {
                    setRoom(data);
                } else {
                    setNotFound(true);
                }
            })
            .catch(err => {
                console.error("Room fetch failed:", err);
                setNotFound(true);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="rd-loading">
            <div className="rd-spinner"></div>
            <p>Loading room details...</p>
        </div>
    );

    if (notFound) return (
        <div className="rd-not-found">
            <div className="rd-nf-icon">🏨</div>
            <h2>Room Not Found</h2>
            <p>This room may no longer be available.</p>
            <Link to="/hotels" className="rd-btn-primary">Browse Hotels</Link>
        </div>
    );

    const amenities = Array.isArray(room.amenities) ? room.amenities : [];
    const heroImg = room.featured_image || ROOM_IMAGES[room.id % ROOM_IMAGES.length];

    return (
        <div className="rd-page">
            {/* Breadcrumb */}
            <div className="rd-breadcrumb">
                <Link to="/hotels">Hotels</Link>
                {room.hotel && (
                    <><span>›</span><Link to={`/hotels/${room.hotel_id}`}>{room.hotel.name}</Link></>
                )}
                <span>›</span>
                <span className="rd-bc-current">{room.type_name}</span>
            </div>

            <div className="rd-layout">
                {/* Left — Image + quick facts */}
                <div className="rd-left">
                    <div className="rd-hero-img">
                        <img src={heroImg} alt={room.type_name} />
                    </div>

                    <div className="rd-quick-facts">
                        <div className="rd-fact">
                            <span className="rd-fact-icon">👥</span>
                            <div>
                                <div className="rd-fact-label">Max Guests</div>
                                <div className="rd-fact-value">{room.max_occupancy}</div>
                            </div>
                        </div>
                        {room.area_sqft && (
                            <div className="rd-fact">
                                <span className="rd-fact-icon">📐</span>
                                <div>
                                    <div className="rd-fact-label">Room Size</div>
                                    <div className="rd-fact-value">{room.area_sqft} sqft</div>
                                </div>
                            </div>
                        )}
                        {room.bed_type && (
                            <div className="rd-fact">
                                <span className="rd-fact-icon">🛏️</span>
                                <div>
                                    <div className="rd-fact-label">Bed Type</div>
                                    <div className="rd-fact-value">{room.bed_type}</div>
                                </div>
                            </div>
                        )}
                        <div className="rd-fact">
                            <span className="rd-fact-icon">💰</span>
                            <div>
                                <div className="rd-fact-label">Price</div>
                                <div className="rd-fact-value rd-price">Rs. {parseFloat(room.base_price || 0).toLocaleString()}<small>/night</small></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Details */}
                <div className="rd-right">
                    {room.hotel && (
                        <p className="rd-hotel-name">🏨 {room.hotel.name} · {room.hotel.city}</p>
                    )}
                    <h1 className="rd-title">{room.type_name}</h1>

                    {room.description && (
                        <p className="rd-desc">{room.description}</p>
                    )}

                    {/* Amenities from DB */}
                    {amenities.length > 0 && (
                        <div className="rd-amenities">
                            <h3>Room Amenities & Features</h3>
                            <div className="rd-amenities-grid">
                                {amenities.map((name, i) => (
                                    <span key={i} className="rd-amenity-tag">
                                        {AMENITY_ICONS[name] || '✓'} {name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pricing */}
                    <div className="rd-pricing-box">
                        <div className="rd-pricing-amount">
                            Rs. {parseFloat(room.base_price || 0).toLocaleString()}
                            <span>/night</span>
                        </div>
                        <p className="rd-pricing-note">Taxes & fees included · Free cancellation</p>
                    </div>

                    {/* Actions */}
                    <div className="rd-actions">
                        {canBook ? (
                            <Link to={`/booking?roomTypeId=${room.id}`} className="rd-btn-book">
                                Book Now
                            </Link>
                        ) : (
                            <button className="rd-btn-book rd-btn-disabled" disabled>
                                Managers Cannot Book
                            </button>
                        )}
                        {room.hotel && (
                            <Link to={`/hotels/${room.hotel_id}`} className="rd-btn-back">
                                ← Back to Hotel
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoomDetails;
