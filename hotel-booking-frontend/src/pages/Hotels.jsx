import { useState, useEffect } from "react";
import "./hotels.css";
import { Link, useSearchParams } from "react-router-dom";
import hotelService from "../services/hotelService";

const FALLBACK_HOTELS = [
    { id: 1,  name: "Hotel Grand Pokhara",            city: "Pokhara, Lakeside",      featured_image: "https://images.getaroom-cdn.com/image/upload/s--TmEjyUgK--/c_limit,e_improve,fl_lossy.immutable_cache,h_460,q_auto:good,w_460/v1662863807/b7e3e0d9a34641884759bbf63ea6f4c78f5ea3c3" },
    { id: 2,  name: "Royal Kathmandu Stay",           city: "Kathmandu, Thamel",      featured_image: "https://royal.hotels-in-kathmandu.com/data/Pics/OriginalPhoto/14092/1409248/1409248079/hotel-royal-kathmandu-kathmandu-pic-19.JPEG" },
    { id: 3,  name: "Park Safari Resort",             city: "Chitwan, Sauraha",       featured_image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/13/ab/e9/03/getlstd-property-photo.jpg?w=900&h=500&s=1" },
    { id: 4,  name: "Club Himalayan Nagarkot Resort", city: "Nagarkot",               featured_image: "https://www.opulentroutes.com/wp-content/uploads/2021/01/club-himalaya-nagarkot-resort-nagarkot-nepal.jpg" },
    { id: 5,  name: "Barahi Resort",                  city: "Pokhara",                featured_image: "https://images.trvl-media.com/lodging/4000000/3900000/3891900/3891821/175a70b7.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill" },
    { id: 6,  name: "Hotel Yak & Yeti",               city: "Kathmandu, Durbar Marg", featured_image: "https://media-cdn.tripadvisor.com/media/photo-s/09/34/5c/a0/hotel-yak-yeti.jpg" },
];

function Hotels() {
    const [hotels, setHotels]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState("");
    const [searchParams, setSearchParams] = useSearchParams();

    // Read filter params passed from home page
    const checkIn   = searchParams.get("checkIn")   || "";
    const checkOut  = searchParams.get("checkOut")  || "";
    const adults    = searchParams.get("adults")    || "";
    const children  = searchParams.get("children")  || "";
    const hasSearch = checkIn || checkOut || adults || children;

    useEffect(() => {
        hotelService.getHotels()
            .then(data => setHotels(data?.length > 0 ? data : FALLBACK_HOTELS))
            .catch(() => setHotels(FALLBACK_HOTELS))
            .finally(() => setLoading(false));
    }, []);

    const filtered = hotels.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        (h.city && h.city.toLowerCase().includes(search.toLowerCase()))
    );

    // Build query string to forward to hotel detail / booking pages
    const forwardParams = new URLSearchParams();
    if (checkIn)   forwardParams.set("checkIn", checkIn);
    if (checkOut)  forwardParams.set("checkOut", checkOut);
    if (adults)    forwardParams.set("adults", adults);
    if (children)  forwardParams.set("children", children);
    const forwardQuery = forwardParams.toString() ? `?${forwardParams.toString()}` : "";

    const clearSearch = () => {
        setSearchParams({});
    };

    if (loading) return (
        <div style={{ textAlign: "center", padding: "80px", fontSize: "1.1rem", color: "#888" }}>
            Loading hotels...
        </div>
    );

    return (
        <div className="hotels-page">
            <h1 className="title">Explore Hotels</h1>
            <p className="subtitle">Find and book the perfect stay across Nepal</p>

            {/* Search context banner from home filter */}
            {hasSearch && (
                <div className="hotels-search-banner">
                    <div className="hsb-chips">
                        {checkIn  && <span className="hsb-chip">📅 Check-in: <strong>{checkIn}</strong></span>}
                        {checkOut && <span className="hsb-chip">📅 Check-out: <strong>{checkOut}</strong></span>}
                        {adults   && <span className="hsb-chip">👤 Adults: <strong>{adults}</strong></span>}
                        {children && <span className="hsb-chip">👶 Children: <strong>{children}</strong></span>}
                    </div>
                    <button className="hsb-clear" onClick={clearSearch}>✕ Clear</button>
                </div>
            )}

            {/* Name/city search */}
            <div className="hotels-search">
                <span>🔍</span>
                <input
                    type="text"
                    placeholder="Search by name or city..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <p className="hotels-count">{filtered.length} hotel{filtered.length !== 1 ? "s" : ""} found</p>

            <div className="hotels-grid">
                {filtered.map((hotel) => (
                    <div className="hotel-card" key={hotel.id}>
                        <div className="hotel-card-img-wrap">
                            <img
                                src={hotel.featured_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"}
                                alt={hotel.name}
                            />
                            {hotel.is_featured && <span className="hotel-featured-badge">Featured</span>}
                        </div>
                        <div className="hotel-card-body">
                            <h3>{hotel.name}</h3>
                            <p className="hotel-card-city">📍 {hotel.city}</p>
                            {hotel.rating > 0 && (
                                <p className="hotel-card-rating">⭐ {parseFloat(hotel.rating).toFixed(1)}</p>
                            )}
                            <Link to={`/hotels/${hotel.id}${forwardQuery}`} className="btn">
                                View Rooms
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px", color: "#aaa" }}>
                    <p style={{ fontSize: "1.1rem" }}>No hotels match your search.</p>
                </div>
            )}
        </div>
    );
}

export default Hotels;
