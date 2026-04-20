import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import hotelService from "../services/hotelService";
import apiClient from "../services/apiClient";

const FALLBACK_HOTELS = [
  { id: 1, name: "Pokhara Hotel", city: "Pokhara", featured_image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/f4/24/e2/hotel-pokhara-grande.jpg?w=700" },
  { id: 2, name: "Lumbini Resort", city: "Lumbini", featured_image: "https://upload.wikimedia.org/wikipedia/commons/1/18/BRP_Lumbini_Mayadevi_temple.jpg" },
  { id: 3, name: "Kathmandu Inn", city: "Kathmandu", featured_image: "https://www.footprintadventure.com/uploads/media/Monuments%20and%20Culture%20in%20Nepal/boudhanath-stupa-nepal.jpg" },
  { id: 4, name: "Chitwan Safari", city: "Chitwan", featured_image: "https://www.chitwantourism.com/wp-content/uploads/2023/08/elephant-safari-chitwan.jpg" },
];

const FALLBACK_ROOMS = [
  { id: 1, image_url: "https://www.royalorchidhotels.com/images/Rooms/07_58_2020_02_58_06Stay_Club%20Room.jpg", room_type: { type_name: "Royal Orchid Suite", base_price: 4200, max_occupancy: 2, hotel: { name: "Pokhara Hotel", city: "Pokhara" } } },
  { id: 2, image_url: "https://justallinclusive.com/wp-content/uploads/2018/07/ja-lake-view-hotel-deluxe-resort-course-view-room.jpg", room_type: { type_name: "Lake View Premium", base_price: 3900, max_occupancy: 3, hotel: { name: "Chitwan Safari", city: "Chitwan" } } },
  { id: 3, image_url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/528089496.jpg?k=aeb80e18992018606ffce5856bceb9c1f4bb2254dbff5c226b94a32eb6274a72&o", room_type: { type_name: "Modern Paradise", base_price: 3500, max_occupancy: 4, hotel: { name: "Kathmandu Inn", city: "Kathmandu" } } },
];

const CATEGORY_COLORS = ["luxury", "budget", "family", "resort", "suite", "deluxe"];
const CATEGORY_ICONS  = ["🏨", "🛏️", "👨‍👩‍👧", "🌿", "✨", "🌟"];

function Home() {
  const navigate = useNavigate();

  const [trendingRooms, setTrendingRooms]   = useState([]);
  const [popularHotels, setPopularHotels]   = useState([]);
  const [roomTypes, setRoomTypes]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [bannerAds, setBannerAds]           = useState([]);
  const [bannerIndex, setBannerIndex]       = useState(0);
  const bannerTimer                         = useRef(null);

  // Filter bar state
  const [checkIn, setCheckIn]   = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults]     = useState(1);
  const [children, setChildren] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hotelsData = await hotelService.getHotels();
        setPopularHotels(hotelsData?.length > 0 ? hotelsData.slice(0, 4) : FALLBACK_HOTELS);

        // Fetch room types for categories
        try {
          const rtRes = await apiClient.get("/room-types");
          const rts = rtRes.data.data || rtRes.data;
          setRoomTypes(Array.isArray(rts) ? rts : []);
        } catch { setRoomTypes([]); }

        // Collect available rooms from hotels
        const allRooms = [];
        for (const hotel of (hotelsData || []).slice(0, 4)) {
          try {
            const detail = await apiClient.get(`/hotels/${hotel.id}`);
            const roomTypesData = detail.data.room_types || detail.data.roomTypes || [];
            for (const rt of roomTypesData) {
              for (const room of (rt.rooms || [])) {
                if (room.status === "available") {
                  allRooms.push({ ...room, room_type: { ...rt, hotel: { name: hotel.name, city: hotel.city } } });
                }
              }
            }
          } catch {}
        }
        setTrendingRooms(allRooms.slice(0, 3).length > 0 ? allRooms.slice(0, 3) : FALLBACK_ROOMS);
      } catch {
        setPopularHotels(FALLBACK_HOTELS);
        setTrendingRooms(FALLBACK_ROOMS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch approved banner ads
  useEffect(() => {
    apiClient.get("/advertisements")
      .then((res) => {
        const ads = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        console.log("Fetched ads:", ads);
        setBannerAds(ads);
      })
      .catch((err) => { console.error("Ads fetch failed:", err); });
  }, []);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (bannerAds.length <= 1) return;
    bannerTimer.current = setInterval(() => {
      setBannerIndex((i) => (i + 1) % bannerAds.length);
    }, 5000);
    return () => clearInterval(bannerTimer.current);
  }, [bannerAds]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn)   params.set("checkIn", checkIn);
    if (checkOut)  params.set("checkOut", checkOut);
    if (adults)    params.set("adults", adults);
    if (children)  params.set("children", children);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="home">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Welcome to StayHub</p>
          <h1>Find Your Perfect Stay</h1>
          <p className="hero-sub">Discover top-rated rooms, premium hotels, and luxury stays across Nepal.</p>
          <div className="hero-buttons">
            <Link to="/hotels"><button className="btn-primary">Explore Hotels</button></Link>
            <Link to="/contact"><button className="btn-outline">Contact Us</button></Link>
          </div>
        </div>

        {/* ── FILTER BAR ── */}
        <form className="hero-filter" onSubmit={handleSearch}>
          <div className="hf-field">
            <label>Check-in</label>
            <input type="date" min={today} value={checkIn} onChange={e => setCheckIn(e.target.value)} />
          </div>
          <div className="hf-divider" />
          <div className="hf-field">
            <label>Check-out</label>
            <input type="date" min={checkIn || today} value={checkOut} onChange={e => setCheckOut(e.target.value)} />
          </div>
          <div className="hf-divider" />
          <div className="hf-field">
            <label>Adults</label>
            <select value={adults} onChange={e => setAdults(Number(e.target.value))}>
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="hf-divider" />
          <div className="hf-field">
            <label>Children</label>
            <select value={children} onChange={e => setChildren(Number(e.target.value))}>
              {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button type="submit" className="hf-submit">Search</button>
        </form>
      </section>

      {/* ── BANNER ADS CAROUSEL ── */}
      {bannerAds.length > 0 && (
        <section className="banner-ads-section">
          <div className="banner-carousel">
            {bannerAds.map((ad, i) => {
              const isActive = i === bannerIndex;
              const isPrev = bannerAds.length > 1 && i === ((bannerIndex - 1 + bannerAds.length) % bannerAds.length);
              const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
              return (
              <div
                key={ad.id}
                className={`banner-slide${isActive ? " active" : ""}${isPrev ? " prev" : ""}`}
              >
                <Link to={`/hotels/${ad.hotel?.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <img
                    src={`${baseUrl}/storage/${ad.banner_image}`}
                    alt={ad.title}
                    className="banner-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                  <div className="banner-overlay">
                    <span className="banner-sponsored">Sponsored</span>
                    <h3 className="banner-title">{ad.title}</h3>
                    <p className="banner-hotel">{ad.hotel?.name} — {ad.hotel?.city}</p>
                  </div>
                </Link>
              </div>
              );
            })}
            {bannerAds.length > 1 && (
              <>
                <button
                  className="banner-nav banner-nav--prev"
                  onClick={() => { clearInterval(bannerTimer.current); setBannerIndex((i) => (i - 1 + bannerAds.length) % bannerAds.length); }}
                  aria-label="Previous"
                >&#8249;</button>
                <button
                  className="banner-nav banner-nav--next"
                  onClick={() => { clearInterval(bannerTimer.current); setBannerIndex((i) => (i + 1) % bannerAds.length); }}
                  aria-label="Next"
                >&#8250;</button>
                <div className="banner-dots">
                  {bannerAds.map((_, i) => (
                    <button
                      key={i}
                      className={`banner-dot${i === bannerIndex ? " active" : ""}`}
                      onClick={() => { clearInterval(bannerTimer.current); setBannerIndex(i); }}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── POPULAR DESTINATIONS ── */}
      <section className="section">
        <h2 className="section-title">Popular Destinations</h2>
        <p className="section-subtitle">Top places travellers love</p>
        <div className="destination-grid">
          {loading
            ? [1,2,3,4].map(i => <div key={i} className="destination-card destination-skeleton" />)
            : popularHotels.map(hotel => (
              <Link to={`/hotels/${hotel.id}`} key={hotel.id} className="destination-card">
                <img src={hotel.featured_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80"} alt={hotel.name} />
                <div className="destination-overlay">
                  <h3>{hotel.name}</h3>
                  <span>📍 {hotel.city}</span>
                </div>
              </Link>
            ))
          }
        </div>
      </section>

      {/* ── TRENDING ROOMS ── */}
      <section className="section section--alt">
        <h2 className="section-title">Trending Rooms</h2>
        <p className="section-subtitle">Most booked rooms this week</p>
        <div className="card-grid">
          {loading
            ? [1,2,3].map(i => <div key={i} className="room-card room-skeleton" />)
            : trendingRooms.map(room => {
              const rt = room.room_type || {};
              const hotel = rt.hotel || {};
              return (
                <Link to={`/rooms/${room.id}`} key={room.id} className="room-card">
                  <div className="room-card-img-wrap">
                    <img src={room.image_url || "https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=600&q=80"} alt={rt.type_name} />
                    <span className="room-card-badge">Available</span>
                  </div>
                  <div className="room-info">
                    <h3>{rt.type_name || "Deluxe Room"}</h3>
                    <p className="room-hotel-name">🏨 {hotel.name}{hotel.city ? `, ${hotel.city}` : ""}</p>
                    <div className="room-card-meta">
                      {rt.max_occupancy && <span>👥 {rt.max_occupancy} guests</span>}
                      {rt.bed_type && <span>🛏️ {rt.bed_type}</span>}
                    </div>
                    <p className="price">NPR {parseFloat(rt.base_price || 0).toLocaleString()} <span>/ night</span></p>
                    <span className="btn-book">View Room →</span>
                  </div>
                </Link>
              );
            })
          }
        </div>
      </section>

      {/* ── EXPLORE ROOM TYPES (dynamic from DB) ── */}
      <section className="section">
        <h2 className="section-title">Explore Room Types</h2>
        <p className="section-subtitle">Find exactly what you're looking for</p>
        <div className="category-grid">
          {loading
            ? [1,2,3,4].map(i => <div key={i} className="category-card luxury" style={{ opacity: 0.4 }} />)
            : roomTypes.length > 0
              ? roomTypes.slice(0, 4).map((rt, i) => (
                <Link
                  to={`/hotels/${rt.hotel_id}`}
                  key={rt.id}
                  className={`category-card ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`}
                >
                  <div className="category-icon">{CATEGORY_ICONS[i % CATEGORY_ICONS.length]}</div>
                  <h3>{rt.type_name}</h3>
                  <p>From NPR {parseFloat(rt.base_price).toLocaleString()} / night</p>
                  {rt.hotel && <span className="category-hotel">🏨 {rt.hotel.name}, {rt.hotel.city}</span>}
                </Link>
              ))
              : (
                <>
                  <Link to="/hotels?type=hotel" className="category-card luxury"><div className="category-icon">🏨</div><h3>Luxury Hotels</h3><p>Premium comfort stays</p></Link>
                  <Link to="/hotels?type=hostel" className="category-card budget"><div className="category-icon">🛏️</div><h3>Budget Rooms</h3><p>Affordable for everyone</p></Link>
                  <Link to="/hotels?type=resort" className="category-card family"><div className="category-icon">👨‍👩‍👧</div><h3>Family Suites</h3><p>Spacious and comfortable</p></Link>
                  <Link to="/hotels?type=resort" className="category-card resort"><div className="category-icon">🌿</div><h3>Resorts and Spa</h3><p>Relax and unwind</p></Link>
                </>
              )
          }
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="offer">
        <div className="offer-inner">
          <p className="offer-eyebrow">Start Your Journey</p>
          <h2 className="offer-title">Ready to Book Your Dream Vacation?</h2>
          <p>Join thousands of happy travellers booking comfort and luxury across Nepal.</p>
          <div className="offer-btns">
            <Link to="/hotels"><button className="btn-primary">Browse Hotels</button></Link>
            <Link to="/contact"><button className="btn-outline btn-outline--dark">Contact Us</button></Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
