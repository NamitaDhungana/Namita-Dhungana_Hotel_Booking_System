import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import hotelService from "../services/hotelService";
import authService from "../services/authService";
import apiClient from "../services/apiClient";
import { useBookingCart } from "../context/BookingCartContext";
import "./HotelDetails.css";
import { formatName } from "../utils/formatName";

const HotelMap = lazy(() => import("../components/HotelMap"));

const AMENITY_ICONS = {
    "Air Conditioner": "❄️", "TV": "📺", "Coffee Maker": "☕", "Room Heater": "🔥",
    "Free WiFi": "📶", "Gym": "🏋️", "Swimming Pool": "🏊", "Spa": "💆",
    "Meeting Room": "🤝", "Parking": "🅿️", "Restaurant": "🍽️", "Laundry Service": "🧺",
    "Kitchen": "🍳", "Bedroom": "🛏️", "Balcony": "🌅", "Living Room": "🛋️",
    "Private Bathroom": "🚿", "Sea View": "🌊", "Mountain View": "⛰️",
};

const FALLBACK_HOTEL = {
    name: "Premium Hotel Experience",
    city: "Nepal",
    description: "Welcome to one of our finest locations. Enjoy top-tier luxury, exceptional service, and unforgettable views.",
    featured_image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    property_type: "Hotel",
    amenities: [],
    roomTypes: [],
};

const FALLBACK_ROOM_IMG = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80";

function HotelDetails() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const canBook = !user || user.role === 'customer';
    const { cart, addRoom, removeRoom, isInCart } = useBookingCart();

    // Carry forward search params from home filter
    const checkIn  = searchParams.get("checkIn")  || "";
    const checkOut = searchParams.get("checkOut") || "";
    const adults   = searchParams.get("adults")   || "";
    const children = searchParams.get("children") || "";

    const bookingQuery = new URLSearchParams();
    if (checkIn)  bookingQuery.set("checkIn", checkIn);
    if (checkOut) bookingQuery.set("checkOut", checkOut);
    if (adults)   bookingQuery.set("adults", adults);
    if (children) bookingQuery.set("children", children);
    const bookingQueryStr = bookingQuery.toString();

    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);

    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewPage, setReviewPage] = useState(1);
    const [reviewMeta, setReviewMeta] = useState(null);

    const [maxPrice, setMaxPrice] = useState(null);
    const [minGuests, setMinGuests] = useState(null);
    const [selectedAmenity, setSelectedAmenity] = useState("");
    const [cartError, setCartError] = useState(null); // { roomTypeId, message }

    useEffect(() => {
        hotelService.getHotelDetails(id)
            .then(data => {
                if (data) {
                    if (data.room_types && !data.roomTypes) data.roomTypes = data.room_types;
                    setHotel(data);
                } else {
                    setHotel({ ...FALLBACK_HOTEL, id });
                }
            })
            .catch(() => setHotel({ ...FALLBACK_HOTEL, id }))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        setReviewsLoading(true);
        apiClient.get(`/hotels/${id}/reviews?page=${reviewPage}`)
            .then(res => {
                setReviews(res.data.data || []);
                setReviewMeta(res.data);
            })
            .catch(() => {})
            .finally(() => setReviewsLoading(false));
    }, [id, reviewPage]);

    const allRooms = useMemo(() => {
        if (!hotel?.roomTypes) return [];
        const rooms = [];
        hotel.roomTypes.forEach(rt => {
            if (Array.isArray(rt.rooms) && rt.rooms.length > 0) {
                rt.rooms.forEach(room => {
                    if (room.status === 'available') {
                        rooms.push({ ...room, roomType: rt });
                    }
                });
            }
        });
        return rooms;
    }, [hotel]);

    const allRoomAmenities = useMemo(() => {
        if (!hotel?.roomTypes) return [];
        const set = new Set();
        hotel.roomTypes.forEach(rt => {
            if (Array.isArray(rt.amenities)) rt.amenities.forEach(a => set.add(a));
        });
        return [...set].sort();
    }, [hotel]);

    const priceCeiling = useMemo(() => {
        if (!hotel?.roomTypes?.length) return 50000;
        return Math.max(...hotel.roomTypes.map(r => parseFloat(r.base_price || 0)), 50000);
    }, [hotel]);

    const filteredRooms = useMemo(() => {
        return allRooms.filter(room => {
            const rt = room.roomType;
            if (maxPrice !== null && parseFloat(rt.base_price) > maxPrice) return false;
            if (minGuests !== null && rt.max_occupancy < minGuests) return false;
            if (selectedAmenity && !(Array.isArray(rt.amenities) && rt.amenities.includes(selectedAmenity))) return false;
            return true;
        });
    }, [allRooms, maxPrice, minGuests, selectedAmenity]);

    const hotelAmenities = useMemo(() => {
        if (!hotel) return [];
        if (Array.isArray(hotel.amenities)) return hotel.amenities;
        if (typeof hotel.amenities === 'string') {
            try { return JSON.parse(hotel.amenities); } catch { return []; }
        }
        return [];
    }, [hotel]);

    if (loading) return <div className="loading-state">Gathering hotel details...</div>;
    if (!hotel) return <div className="error-state">Hotel not found.</div>;

    return (
        <>
        <div className="hotel-details-page">
            {/* Hero */}
            <div className="hotel-hero">
                <img src={hotel.featured_image || FALLBACK_HOTEL.featured_image} alt={hotel.name} className="hero-image" />
                <div className="hero-overlay">
                    <div className="hero-content">
                        <div className="hero-breadcrumb">
                            <Link to="/hotels">Hotels</Link> › <span>{formatName(hotel.name)}</span>
                        </div>
                        <h1>{formatName(hotel.name)}</h1>
                        <p className="location-badge">📍 {hotel.city}</p>
                        {hotel.rating > 0 && (
                            <p className="rating-badge">⭐ {parseFloat(hotel.rating).toFixed(1)} rating</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="hotel-content-wrapper">
                {/* Hotel Info */}
                <div className="hotel-info-section">
                    <div className="about-hotel">
                        <h2>About this {hotel.property_type || "Hotel"}</h2>
                        <p>{hotel.description || FALLBACK_HOTEL.description}</p>
                    </div>
                    <div className="hotel-amenities">
                        <h3>Hotel Facilities</h3>
                        {hotelAmenities.length > 0 ? (
                            <div className="amenities-grid">
                                {hotelAmenities.map((name, i) => (
                                    <span key={i}>{AMENITY_ICONS[name] || '✓'} {name}</span>
                                ))}
                            </div>
                        ) : (
                            <div className="amenities-grid">
                                <span>📶 Free WiFi</span>
                                <span>🅿️ Parking</span>
                                <span>🍽️ Restaurant</span>
                                <span>🛎️ 24/7 Front Desk</span>
                            </div>
                        )}
                    </div>

                </div>

                {/* Rooms Section */}
                <div className="hotel-rooms-wrapper">
                    <aside className="rooms-filter-sidebar">
                        <h3>Filter Rooms</h3>
                        <div className="filter-group">
                            <label>Max Price / Night</label>
                            {maxPrice === null ? (
                                <div className="filter-unset">
                                    <span>Any price</span>
                                    <button className="filter-activate" onClick={() => setMaxPrice(priceCeiling)}>Set</button>
                                </div>
                            ) : (
                                <>
                                    <div className="price-labels">
                                        <span>Rs. 0</span>
                                        <span className="price-active">Rs. {maxPrice.toLocaleString()}</span>
                                    </div>
                                    <input
                                        type="range" min="0" max={priceCeiling} step="500"
                                        value={maxPrice}
                                        onChange={e => setMaxPrice(parseInt(e.target.value))}
                                        className="filter-range"
                                    />
                                </>
                            )}
                        </div>
                        <div className="filter-group">
                            <label>Minimum Guests</label>
                            <select
                                value={minGuests ?? ""}
                                onChange={e => setMinGuests(e.target.value === "" ? null : parseInt(e.target.value))}
                                className="filter-select"
                            >
                                <option value="">Any</option>
                                <option value={2}>2+ Guests</option>
                                <option value={3}>3+ Guests</option>
                                <option value={4}>4+ Guests</option>
                            </select>
                        </div>
                        {allRoomAmenities.length > 0 && (
                            <div className="filter-group">
                                <label>Amenity</label>
                                <select
                                    value={selectedAmenity}
                                    onChange={e => setSelectedAmenity(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="">Any</option>
                                    {allRoomAmenities.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {(maxPrice !== null || minGuests !== null || selectedAmenity) && (
                            <button
                                className="filter-reset"
                                onClick={() => { setMaxPrice(null); setMinGuests(null); setSelectedAmenity(""); }}
                            >
                                Clear All Filters
                            </button>
                        )}
                        <p className="filter-count">
                            {filteredRooms.length} of {allRooms.length} room{allRooms.length !== 1 ? "s" : ""}
                        </p>
                    </aside>

                    <div className="hotel-rooms-section">
                        <h2>Available Rooms</h2>
                        <p className="section-subtitle">Select a room to begin your reservation</p>
                        <div className="rooms-list">
                            {filteredRooms.length > 0 ? (
                                filteredRooms.map(room => {
                                    const rt = room.roomType;
                                    const amenities = Array.isArray(rt.amenities) ? rt.amenities : [];
                                    return (
                                        <div key={room.id} className="room-item-card">
                                            <div className="room-image-wrap">
                                                <img
                                                    src={room.image_url || rt.featured_image || FALLBACK_ROOM_IMG}
                                                    alt={`Room ${room.room_number}`}
                                                />
                                            </div>
                                            <div className="room-item-info">
                                                <div className="room-item-header">
                                                    <div>
                                                        <h3>{rt.type_name}</h3>
                                                        <span className="room-number-badge">🚪 Room {room.room_number}</span>
                                                    </div>
                                                    <div className="room-price-box">
                                                        <span className="price-tag">Rs. {parseFloat(rt.base_price).toLocaleString()}</span>
                                                        <span className="per-night">/ night</span>
                                                    </div>
                                                </div>
                                                <div className="room-features">
                                                    <span>👥 {rt.max_occupancy} Guests</span>
                                                    {rt.area_sqft && <span>📐 {rt.area_sqft} sqft</span>}
                                                    {rt.bed_type && <span>🛏️ {rt.bed_type}</span>}
                                                    {room.floor && <span>🏢 Floor {room.floor}</span>}
                                                </div>
                                                {room.notes && <p className="room-notes">{room.notes}</p>}
                                                {amenities.length > 0 && (
                                                    <div className="room-amenity-tags">
                                                        {amenities.slice(0, 4).map((a, i) => (
                                                            <span key={i} className="room-amenity-chip">
                                                                {AMENITY_ICONS[a] || '✓'} {a}
                                                            </span>
                                                        ))}
                                                        {amenities.length > 4 && (
                                                            <span className="room-amenity-chip room-amenity-more">
                                                                +{amenities.length - 4} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="room-action">
                                                    <Link to={`/rooms/${room.id}`} className="btn-details">View Details</Link>
                                                    {canBook ? (
                                                        <>
                                                            <Link to={`/booking?roomTypeId=${rt.id}${bookingQueryStr ? `&${bookingQueryStr}` : ''}`}>
                                                                <button className="btn-reserve">Book Now</button>
                                                            </Link>
                                                            <button
                                                                className={`btn-cart ${isInCart(rt.id) ? 'btn-cart--added' : ''}`}
                                                                onClick={() => {
                                                                    if (isInCart(rt.id)) {
                                                                        removeRoom(rt.id);
                                                                        setCartError(null);
                                                                        return;
                                                                    }
                                                                    const result = addRoom({
                                                                        roomTypeId: rt.id,
                                                                        hotelId: hotel.id,
                                                                        roomTypeName: rt.type_name,
                                                                        hotelName: formatName(hotel.name),
                                                                        basePrice: rt.base_price,
                                                                        maxOccupancy: rt.max_occupancy,
                                                                    });
                                                                    if (!result.ok) {
                                                                        if (result.reason === 'different_hotel') {
                                                                            setCartError({ roomTypeId: rt.id, message: `Your cart already has rooms from "${result.hotelName}". You can only book rooms from one hotel at a time. Clear your cart first.` });
                                                                        }
                                                                    } else {
                                                                        setCartError(null);
                                                                    }
                                                                }}
                                                            >
                                                                {isInCart(rt.id) ? '✓ In Cart' : '+ Add to Cart'}
                                                            </button>
                                                            {cartError?.roomTypeId === rt.id && (
                                                                <div className="cart-error-msg">
                                                                    ⚠️ {cartError.message}
                                                                    <button className="cart-error-dismiss" onClick={() => setCartError(null)}>✕</button>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <button className="btn-reserve btn-reserve--disabled" disabled>
                                                            Managers Restricted
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="no-rooms">
                                    <p>
                                        No rooms match your filters.{" "}
                                        <button
                                            onClick={() => { setMaxPrice(null); setMinGuests(null); setSelectedAmenity(""); }}
                                            style={{ background: 'none', border: 'none', color: '#6C5CE7', cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            Clear filters
                                        </button>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Guest Reviews */}
                <div className="hd-reviews-section">
                    <div className="hd-reviews-header">
                        <h2>Guest Reviews</h2>
                        {reviewMeta && reviewMeta.total > 0 && (
                            <span className="hd-reviews-count">{reviewMeta.total} review{reviewMeta.total !== 1 ? 's' : ''}</span>
                        )}
                    </div>

                    {reviewsLoading ? (
                        <p className="hd-reviews-loading">Loading reviews...</p>
                    ) : reviews.length === 0 ? (
                        <div className="hd-reviews-empty">
                            <span>⭐</span>
                            <p>No reviews yet. Be the first to share your experience!</p>
                        </div>
                    ) : (
                        <>
                            <div className="hd-reviews-list">
                                {reviews.map(review => (
                                    <div key={review.review_id} className="hd-review-card">
                                        <div className="hd-review-top">
                                            <div className="hd-reviewer-avatar">
                                                {review.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="hd-reviewer-info">
                                                <span className="hd-reviewer-name">{review.user?.name}</span>
                                                <span className="hd-review-date">
                                                    {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="hd-review-stars">
                                                {[1,2,3,4,5].map(s => (
                                                    <span key={s} className={s <= review.rating ? 'hd-star hd-star--on' : 'hd-star'}>★</span>
                                                ))}
                                            </div>
                                        </div>
                                        {review.title && <p className="hd-review-title">{review.title}</p>}
                                        {review.comment && <p className="hd-review-comment">{review.comment}</p>}
                                    </div>
                                ))}
                            </div>
                            {reviewMeta && reviewMeta.last_page > 1 && (
                                <div className="hd-reviews-pagination">
                                    <button className="hd-page-btn" disabled={reviewPage === 1} onClick={() => setReviewPage(p => p - 1)}>← Prev</button>
                                    <span>{reviewPage} / {reviewMeta.last_page}</span>
                                    <button className="hd-page-btn" disabled={reviewPage === reviewMeta.last_page} onClick={() => setReviewPage(p => p + 1)}>Next →</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
                {/* Location Map */}
                {(hotel.latitude && hotel.longitude) || hotel.city ? (
                    <div className="hotel-map-section">
                        <h2>Location</h2>
                        <Suspense fallback={<div className="map-loading">Loading map...</div>}>
                            <HotelMap
                                lat={hotel.latitude}
                                lng={hotel.longitude}
                                name={hotel.name}
                                address={hotel.address}
                                city={hotel.city}
                                country={hotel.country}
                            />
                        </Suspense>
                    </div>
                ) : null}
            </div>
        </div>

        {/* Floating cart bar */}
        {canBook && cart.length > 0 && (
            <div className="hd-cart-bar">
                <span className="hd-cart-count">🛒 {cart.length} room{cart.length > 1 ? 's' : ''} in cart</span>
                <button className="hd-cart-btn" onClick={() => navigate('/multi-booking')}>
                    Book All Rooms →
                </button>
            </div>
        )}
        </>
    );
}

export default HotelDetails;
