import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import apiClient from "../services/apiClient";
import "./SearchResults.css";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=600&q=80";

function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams();
    const checkIn   = searchParams.get("checkIn")   || "";
    const checkOut  = searchParams.get("checkOut")  || "";
    const adults    = searchParams.get("adults")    || "1";
    const children  = searchParams.get("children")  || "0";
    const totalGuests = (parseInt(adults) || 1) + (parseInt(children) || 0);

    const [rooms, setRooms]     = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError]     = useState("");

    // Local editable filter state
    const [localCheckIn,  setLocalCheckIn]  = useState(checkIn);
    const [localCheckOut, setLocalCheckOut] = useState(checkOut);
    const [localAdults,   setLocalAdults]   = useState(adults);
    const [localChildren, setLocalChildren] = useState(children);

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (checkIn && checkOut) {
            fetchRooms(checkIn, checkOut, totalGuests);
        }
    }, [checkIn, checkOut, adults, children]);

    const fetchRooms = async (ci, co, guests) => {
        setLoading(true);
        setError("");
        try {
            const res = await apiClient.get("/rooms/search", {
                params: { check_in: ci, check_out: co, guests },
            });
            setRooms(res.data || []);
        } catch {
            setError("Failed to search rooms. Please try again.");
            setRooms([]);
        } finally {
            setLoading(false);
            setSearched(true);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!localCheckIn || !localCheckOut) {
            setError("Please select both check-in and check-out dates.");
            return;
        }
        const params = new URLSearchParams();
        params.set("checkIn",   localCheckIn);
        params.set("checkOut",  localCheckOut);
        params.set("adults",    localAdults);
        params.set("children",  localChildren);
        setSearchParams(params);
    };

    const nights = checkIn && checkOut
        ? Math.max(0, (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="sr-page">
            {/* Filter bar */}
            <div className="sr-filter-bar">
                <form className="sr-filter-form" onSubmit={handleSearch}>
                    <div className="sr-field">
                        <label>Check-in</label>
                        <input type="date" min={today} value={localCheckIn} onChange={e => setLocalCheckIn(e.target.value)} required />
                    </div>
                    <div className="sr-divider" />
                    <div className="sr-field">
                        <label>Check-out</label>
                        <input type="date" min={localCheckIn || today} value={localCheckOut} onChange={e => setLocalCheckOut(e.target.value)} required />
                    </div>
                    <div className="sr-divider" />
                    <div className="sr-field">
                        <label>Adults</label>
                        <select value={localAdults} onChange={e => setLocalAdults(e.target.value)}>
                            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div className="sr-divider" />
                    <div className="sr-field">
                        <label>Children</label>
                        <select value={localChildren} onChange={e => setLocalChildren(e.target.value)}>
                            {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="sr-search-btn">Search</button>
                </form>
            </div>

            <div className="sr-content">
                {/* Header */}
                <div className="sr-header">
                    {searched && !loading && (
                        <>
                            <h1>{rooms.length > 0 ? `${rooms.length} room${rooms.length !== 1 ? "s" : ""} available` : "No rooms found"}</h1>
                            {checkIn && checkOut && (
                                <p className="sr-meta">
                                    {checkIn} → {checkOut} &nbsp;·&nbsp; {nights} night{nights !== 1 ? "s" : ""} &nbsp;·&nbsp; {adults} adult{parseInt(adults) !== 1 ? "s" : ""}{parseInt(children) > 0 ? `, ${children} child${parseInt(children) !== 1 ? "ren" : ""}` : ""}
                                </p>
                            )}
                        </>
                    )}
                    {!searched && !loading && (
                        <h1>Search for available rooms</h1>
                    )}
                </div>

                {error && <div className="sr-error">{error}</div>}

                {/* Loading */}
                {loading && (
                    <div className="sr-grid">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="sr-skeleton" />)}
                    </div>
                )}

                {/* Results */}
                {!loading && rooms.length > 0 && (
                    <div className="sr-grid">
                        {rooms.map(room => {
                            const rt = room.room_type || {};
                            const hotel = rt.hotel || room.hotel || {};
                            const price = parseFloat(rt.base_price || 0);
                            const total = nights > 0 ? price * nights : null;

                            return (
                                <div key={room.id} className="sr-card">
                                    <div className="sr-card-img">
                                        <img src={room.image_url || hotel.featured_image || FALLBACK_IMG} alt={rt.type_name} />
                                        <span className="sr-badge">Available</span>
                                    </div>
                                    <div className="sr-card-body">
                                        <div className="sr-card-top">
                                            <div>
                                                <h3>{rt.type_name || "Room"}</h3>
                                                <p className="sr-hotel">🏨 {hotel.name}{hotel.city ? `, ${hotel.city}` : ""}</p>
                                            </div>
                                            <div className="sr-price-box">
                                                <span className="sr-price">NPR {price.toLocaleString()}</span>
                                                <span className="sr-per">/night</span>
                                                {total && <span className="sr-total">NPR {total.toLocaleString()} total</span>}
                                            </div>
                                        </div>

                                        <div className="sr-features">
                                            {rt.max_occupancy && <span>👥 {rt.max_occupancy} guests</span>}
                                            {rt.bed_type && <span>🛏️ {rt.bed_type}</span>}
                                            {rt.area_sqft && <span>📐 {rt.area_sqft} sqft</span>}
                                            {room.floor && <span>🏢 Floor {room.floor}</span>}
                                        </div>

                                        <div className="sr-actions">
                                            <Link to={`/rooms/${room.id}`} className="sr-btn-outline">View Details</Link>
                                            <Link
                                                to={`/booking?roomTypeId=${rt.id}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`}
                                                className="sr-btn-book"
                                            >
                                                Book Now
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty */}
                {!loading && searched && rooms.length === 0 && !error && (
                    <div className="sr-empty">
                        <div className="sr-empty-icon">🔍</div>
                        <h2>No rooms available</h2>
                        <p>No rooms match your dates and guest count. Try different dates or fewer guests.</p>
                        <Link to="/hotels" className="sr-btn-book">Browse All Hotels</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchResults;
