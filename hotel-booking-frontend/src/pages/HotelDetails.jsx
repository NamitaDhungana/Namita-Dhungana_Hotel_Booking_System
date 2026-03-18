import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import hotelService from "../services/hotelService";
import authService from "../services/authService";
import "./HotelDetails.css";

function HotelDetails() {
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = authService.getCurrentUser();

    // Static Fallback in case Backend is down or empty
    const staticFallback = {
        id: id,
        name: "Premium Hotel Experience",
        city: "Nepal",
        description: "Welcome to one of our finest locations. Enjoy top-tier luxury, exceptional service, and unforgettable views from the comfort of our elegantly designed spaces.",
        featured_image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        property_type: "Hotel",
        roomTypes: [
            {
                id: 101,
                type_name: "Deluxe King Room",
                max_occupancy: 2,
                base_price: 5200,
                featured_image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
                amenities: ["King Bed", "City View", "Free WiFi", "Minibar"]
            },
            {
                id: 102,
                type_name: "Family Suite",
                max_occupancy: 4,
                base_price: 8500,
                featured_image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                amenities: ["Two Queen Beds", "Living Area", "Balcony"]
            }
        ]
    };

    useEffect(() => {
        const fetchHotelDetails = async () => {
            try {
                setLoading(true);
                const data = await hotelService.getHotelDetails(id);

                if (data) {
                    setHotel(data);
                } else {
                    setHotel(staticFallback);
                }
            } catch (err) {
                console.error("Failed to fetch hotel details, using fallback:", err);
                setHotel(staticFallback);
            } finally {
                setLoading(false);
            }
        };

        fetchHotelDetails();
    }, [id]);

    if (loading) return <div className="loading-state">Gathering hotel details...</div>;
    if (error) return <div className="error-state">{error}</div>;
    if (!hotel) return <div className="error-state">Hotel not found.</div>;

    return (
        <div className="hotel-details-page">
            {/* Hero Section */}
            <div className="hotel-hero">
                <img
                    src={hotel.featured_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"}
                    alt={hotel.name}
                    className="hero-image"
                />
                <div className="hero-overlay">
                    <div className="hero-content">
                        <h1>{hotel.name}</h1>
                        <p className="location-badge">📍 {hotel.city}</p>
                    </div>
                </div>
            </div>

            <div className="hotel-content-wrapper">
                {/* Info Section */}
                <div className="hotel-info-section">
                    <div className="about-hotel">
                        <h2>About this {hotel.property_type || "Hotel"}</h2>
                        <p>{hotel.description || staticFallback.description}</p>
                    </div>

                    <div className="hotel-amenities">
                        <h3>Popular Amenities</h3>
                        <div className="amenities-grid">
                            <span>📶 Free High-Speed WiFi</span>
                            <span>🏊‍♂️ Swimming Pool</span>
                            <span>🍽️ Restaurant & Bar</span>
                            <span>🚗 Free Parking</span>
                            <span>🛎️ 24/7 Front Desk</span>
                            <span>❄️ Air Conditioning</span>
                        </div>
                    </div>
                </div>

                {/* Rooms Section */}
                <div className="hotel-rooms-section">
                    <h2>Available Rooms</h2>
                    <p className="section-subtitle">Select a room to begin your reservation</p>

                    <div className="rooms-list">
                        {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
                            hotel.roomTypes.map((room) => (
                                <div key={room.id} className="room-item-card">
                                    <div className="room-image-wrap">
                                        <img
                                            src={room.featured_image || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80"}
                                            alt={room.type_name}
                                        />
                                    </div>
                                    <div className="room-item-info">
                                        <div className="room-item-header">
                                            <h3>{room.type_name}</h3>
                                            <div className="room-price-box">
                                                <span className="price-tag">Rs. {parseFloat(room.base_price).toLocaleString()}</span>
                                                <span className="per-night">/ night</span>
                                            </div>
                                        </div>

                                        <div className="room-features">
                                            <span>👥 Fits {room.max_occupancy} Guests</span>
                                            <span>🛏️ Premium Bedding</span>
                                            <span>🚿 En-suite Bathroom</span>
                                        </div>

                                        <div className="room-action">
                                            {(!user || user.role === 'customer') ? (
                                                <Link to={`/booking?roomTypeId=${room.id}`}>
                                                    <button className="btn-reserve">Reserve Now</button>
                                                </Link>
                                            ) : (
                                                <button className="btn-reserve" style={{ opacity: 0.6, cursor: 'not-allowed' }} disabled>
                                                    Managers Restricted
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-rooms">
                                <p>There are currently no rooms listed for this hotel.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HotelDetails;
