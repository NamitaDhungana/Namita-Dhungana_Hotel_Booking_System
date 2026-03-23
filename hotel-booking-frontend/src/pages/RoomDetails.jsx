import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import hotelService from "../services/hotelService";
import authService from "../services/authService";
import "./roomDetails.css";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80";

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
        hotelService.showRoom(id)
            .then(data => {
                if (data && data.id) {
                    setRoom(data);
                } else {
                    setNotFound(true);
                }
            })
            .catch(() => setNotFound(true))
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

    // room.room_type holds the RoomType data (price, amenities, etc.)
    const rt = room.room_type || {};
    const amenities = Array.isArray(rt.amenities) ? rt.amenities : [];
    const hotel = room.hotel || rt.hotel || {};
    const heroImg = room.image_url || rt.featured_image || FALLBACK_IMG;

    return (
        <div className="rd-page">
            {/* Breadcrumb */}
            <div className="rd-breadcrumb">
                <Link to="/hotels">Hotels</Link>
                {hotel.id && (
                    <><span>›</span><Link to={`/hotels/${hotel.id}`}>{hotel.name}</Link></>
                )}
                <span>›</span>
                <span className="rd-bc-current">Room {room.room_number}</span>
            </div>

            <div className="rd-layout">
                {/* Left — Image + quick facts */}
                <div className="rd-left">
                    <div className="rd-hero-img">
                        <img src={heroImg} alt={`Room ${room.room_number}`} />
                    </div>

                    <div className="rd-quick-facts">
                        <div className="rd-fact">
                            <span className="rd-fact-icon">🚪</span>
                            <div>
                                <div className="rd-fact-label">Room Number</div>
                                <div className="rd-fact-value">{room.room_number}</div>
                            </div>
                        </div>
                        {room.floor && (
                            <div className="rd-fact">
                                <span className="rd-fact-icon">🏢</span>
                                <div>
                                    <div className="rd-fact-label">Floor</div>
                                    <div className="rd-fact-value">{room.floor}</div>
                                </div>
                            </div>
                        )}
                        <div className="rd-fact">
                            <span className="rd-fact-icon">👥</span>
                            <div>
                                <div className="rd-fact-label">Max Guests</div>
                                <div className="rd-fact-value">{rt.max_occupancy ?? '—'}</div>
                            </div>
                        </div>
                        {rt.area_sqft && (
                            <div className="rd-fact">
                                <span className="rd-fact-icon">📐</span>
                                <div>
                                    <div className="rd-fact-label">Room Size</div>
                                    <div className="rd-fact-value">{rt.area_sqft} sqft</div>
                                </div>
                            </div>
                        )}
                        {rt.bed_type && (
                            <div className="rd-fact">
                                <span className="rd-fact-icon">🛏️</span>
                                <div>
                                    <div className="rd-fact-label">Bed Type</div>
                                    <div className="rd-fact-value">{rt.bed_type}</div>
                                </div>
                            </div>
                        )}
                        <div className="rd-fact">
                            <span className="rd-fact-icon">💰</span>
                            <div>
                                <div className="rd-fact-label">Price</div>
                                <div className="rd-fact-value rd-price">
                                    Rs. {parseFloat(rt.base_price || 0).toLocaleString()}
                                    <small>/night</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Details */}
                <div className="rd-right">
                    {hotel.name && (
                        <p className="rd-hotel-name">🏨 {hotel.name}{hotel.city ? ` · ${hotel.city}` : ''}</p>
                    )}
                    <h1 className="rd-title">{rt.type_name} — Room {room.room_number}</h1>

                    {room.notes && <p className="rd-desc">{room.notes}</p>}
                    {!room.notes && rt.description && <p className="rd-desc">{rt.description}</p>}

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

                    <div className="rd-pricing-box">
                        <div className="rd-pricing-amount">
                            Rs. {parseFloat(rt.base_price || 0).toLocaleString()}
                            <span>/night</span>
                        </div>
                        <p className="rd-pricing-note">Taxes & fees included · Free cancellation</p>
                    </div>

                    <div className="rd-actions">
                        {canBook ? (
                            <Link to={`/booking?roomTypeId=${rt.id}`} className="rd-btn-book">
                                Book Now
                            </Link>
                        ) : (
                            <button className="rd-btn-book rd-btn-disabled" disabled>
                                Managers Cannot Book
                            </button>
                        )}
                        {hotel.id && (
                            <Link to={`/hotels/${hotel.id}`} className="rd-btn-back">
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
