import { useState, useEffect } from "react";
import "./hotels.css";
import { Link } from "react-router-dom";
import hotelService from "../services/hotelService";

const FALLBACK_HOTELS = [
    { id: 1,  name: "Hotel Grand Pokhara",           city: "Pokhara, Lakeside",      featured_image: "https://images.getaroom-cdn.com/image/upload/s--TmEjyUgK--/c_limit,e_improve,fl_lossy.immutable_cache,h_460,q_auto:good,w_460/v1662863807/b7e3e0d9a34641884759bbf63ea6f4c78f5ea3c3" },
    { id: 2,  name: "Royal Kathmandu Stay",          city: "Kathmandu, Thamel",      featured_image: "https://royal.hotels-in-kathmandu.com/data/Pics/OriginalPhoto/14092/1409248/1409248079/hotel-royal-kathmandu-kathmandu-pic-19.JPEG" },
    { id: 3,  name: "Park Safari Resort",            city: "Chitwan, Sauraha",       featured_image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/13/ab/e9/03/getlstd-property-photo.jpg?w=900&h=500&s=1" },
    { id: 4,  name: "Club Himalayan Nagarkot Resort",city: "Nagarkot",               featured_image: "https://www.opulentroutes.com/wp-content/uploads/2021/01/club-himalaya-nagarkot-resort-nagarkot-nepal.jpg" },
    { id: 5,  name: "Barahi Resort",                 city: "Pokhara",                featured_image: "https://images.trvl-media.com/lodging/4000000/3900000/3891900/3891821/175a70b7.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill" },
    { id: 6,  name: "Hotel Yak & Yeti",              city: "Kathmandu, Durbar Marg", featured_image: "https://media-cdn.tripadvisor.com/media/photo-s/09/34/5c/a0/hotel-yak-yeti.jpg" },
    { id: 7,  name: "Hotel Annapurna",               city: "Kathmandu",              featured_image: "https://BoOqifY.com/wp-content/uploads/2017/08/Hotel-Annapurna-nepal-kathmandu.png" },
    { id: 8,  name: "Hotel Mystic Mountain",         city: "Nagarkot",               featured_image: "https://q-xx.bstatic.com/xdata/images/hotel/max500/109715787.jpg?k=25af542d3a30a5e646ac8947667e473474a9650ab2a830f27d85a6fb13aace40&o=" },
    { id: 9,  name: "Radisson Kathmandu",            city: "Kathmandu, Lazimpat",    featured_image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/a7/7a/e3/radisson-hotel-kathmandu.jpg?w=900&h=500&s=1" },
    { id: 10, name: "Kasara Resort",                 city: "Chitwan",                featured_image: "https://r2imghtlak.mmtcdn.com/r2-mmt-htl-image/room-imgs/202101201518265579-6852130-d36ff5b6c98d11eeb1b30a58a9feac02.jpg" },
    { id: 11, name: "Temple Tree Resort",            city: "Pokhara",                featured_image: "https://cdn.audleytravel.com/1050/748/79/1337652-temple-tree-resort--spa.webp" },
    { id: 12, name: "Fish Tail Lodge",               city: "Pokhara Lakefront",      featured_image: "https://www.ampersandtravel.com/media/61173/Fishtail-Lodge-Pokhara-Nepal-1-.jpg?mode=crop" },
];

function Hotels() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

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

    if (loading) return (
        <div style={{ textAlign: "center", padding: "80px", fontSize: "1.1rem", color: "#888" }}>
            Loading hotels...
        </div>
    );

    return (
        <div className="hotels-page">
            <h1 className="title">Explore Hotels</h1>
            <p className="subtitle">Find and book the perfect stay across Nepal</p>

            {/* Search */}
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
                            <Link to={`/hotels/${hotel.id}`} className="btn">
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
