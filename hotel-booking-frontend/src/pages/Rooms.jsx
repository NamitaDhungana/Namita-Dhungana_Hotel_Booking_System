import { useState, useEffect } from "react";
import "./Rooms.css";
import { Link, useSearchParams } from "react-router-dom";
import hotelService from "../services/hotelService";
import authService from "../services/authService";

const ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80",
];

const AMENITY_LIST = [
  { icon: "📶", label: "Free WiFi" },
  { icon: "❄️", label: "Air Conditioning" },
  { icon: "🛏️", label: "King Bed" },
  { icon: "🚿", label: "Private Bathroom" },
  { icon: "📺", label: "Flat Screen TV" },
  { icon: "🏊", label: "Pool Access" },
  { icon: "🍳", label: "Breakfast Included" },
  { icon: "🅿️", label: "Free Parking" },
  { icon: "🛎️", label: "Room Service" },
  { icon: "🧺", label: "Laundry" },
];

function getAmenities(roomId) {
  const count = 4 + (roomId % 3);
  const start = roomId % AMENITY_LIST.length;
  const amenities = [];
  for (let i = 0; i < count; i++) {
    amenities.push(AMENITY_LIST[(start + i) % AMENITY_LIST.length]);
  }
  return amenities;
}

function Rooms() {
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get("hotelId");
  const user = authService.getCurrentUser();

  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [capacityFilter, setCapacityFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [locationFilter, setLocationFilter] = useState("all");

  // Fallback static rooms
  const fallbackRoomTypes = [
    { id: 101, hotel_id: 1, type_name: "Deluxe Single Room", base_price: 3500, max_occupancy: 1, hotel: { name: "Hotel Grand Pokhara", city: "Pokhara" } },
    { id: 102, hotel_id: 1, type_name: "Luxury Double Suite", base_price: 7500, max_occupancy: 2, hotel: { name: "Hotel Grand Pokhara", city: "Pokhara" } },
    { id: 103, hotel_id: 2, type_name: "Standard Twin Room", base_price: 4200, max_occupancy: 2, hotel: { name: "Royal Kathmandu Stay", city: "Kathmandu" } },
    { id: 104, hotel_id: 3, type_name: "Safari View Suite", base_price: 6800, max_occupancy: 3, hotel: { name: "Park Safari Resort", city: "Chitwan" } },
    { id: 105, hotel_id: 4, type_name: "Mountain View Deluxe", base_price: 9500, max_occupancy: 2, hotel: { name: "Club Himalayan Nagarkot Resort", city: "Nagarkot" } },
  ];

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        let data;
        if (hotelId) {
          data = await hotelService.getRoomTypesByHotel(hotelId);
        } else {
          data = await hotelService.getAllRoomTypes();
        }
        
        if (data && Array.isArray(data) && data.length > 0) {
          setRoomTypes(data);
        } else {
          // If a hotelId is present, filter fallback rooms for that hotel
          if (hotelId) {
            const filteredFallback = fallbackRoomTypes.filter(r => r.hotel_id === parseInt(hotelId));
            setRoomTypes(filteredFallback.length > 0 ? filteredFallback : fallbackRoomTypes);
          } else {
            setRoomTypes(fallbackRoomTypes);
          }
        }
      } catch (err) {
        console.error("Failed to fetch rooms, using fallback:", err);
        // Error handling with fallback
        if (hotelId) {
          const filteredFallback = fallbackRoomTypes.filter(r => r.hotel_id === parseInt(hotelId));
          setRoomTypes(filteredFallback.length > 0 ? filteredFallback : fallbackRoomTypes);
        } else {
          setRoomTypes(fallbackRoomTypes);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [hotelId]);

  const toggleAmenity = (label) => {
    setSelectedAmenities((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  };

  const filtered = roomTypes.filter((room) => {
    const price = parseFloat(room.base_price || 0);
    if (price < priceRange[0] || price > priceRange[1]) return false;
    if (capacityFilter !== "all" && room.max_occupancy < parseInt(capacityFilter)) return false;
    if (searchText && !room.type_name?.toLowerCase().includes(searchText.toLowerCase()) &&
        !room.hotel?.name?.toLowerCase().includes(searchText.toLowerCase())) return false;
        
    if (locationFilter && locationFilter !== "all") {
        const cityMatch = room.hotel?.city?.toLowerCase() === locationFilter.toLowerCase();
        if (!cityMatch) return false;
    }

    if (selectedAmenities.length > 0) {
      const roomAmenityLabels = getAmenities(room.id).map((a) => a.label);
      if (!selectedAmenities.every((a) => roomAmenityLabels.includes(a))) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="rm-loading">
        <div className="rm-spinner"></div>
        <p>Loading rooms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rm-error-state">
        <span>⚠️</span>
        <p>{error}</p>
        <Link to="/hotels" className="rm-btn-primary">Browse Hotels</Link>
      </div>
    );
  }

  return (
    <div className="rm-page">
      {/* Header */}
      <div className="rm-header">
        <div>
          <h1>Explore Our Rooms</h1>
          <p>Discover the perfect room for your stay — from cozy singles to luxurious suites.</p>
        </div>
        <div className="rm-search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search rooms or hotels..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className="rm-layout">
        {/* Sidebar Filters */}
        <aside className="rm-filters">
          <h3>🎛️ Filters</h3>

          {/* Location Search */}
          <div className="rm-filter-group" style={{ marginBottom: "20px" }}>
            <label>Location / City</label>
            <div style={{ marginTop: "8px" }}>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ebf0ff', borderRadius: '8px', outline: 'none', background: '#fff' }}
              >
                <option value="all">All Locations in Nepal</option>
                {[...new Set(roomTypes.map(room => room?.hotel?.city).filter(Boolean))].sort().map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div className="rm-filter-group">
            <label>Price Range</label>
            <div className="rm-price-labels">
              <span>Rs. {priceRange[0].toLocaleString()}</span>
              <span>Rs. {priceRange[1].toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="500"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="rm-range"
            />
          </div>

          {/* Capacity */}
          <div className="rm-filter-group">
            <label>Minimum Guests</label>
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="rm-select"
            >
              <option value="all">All</option>
              <option value="1">1+ Guest</option>
              <option value="2">2+ Guests</option>
              <option value="3">3+ Guests</option>
              <option value="4">4+ Guests</option>
              <option value="6">6+ Guests</option>
            </select>
          </div>

          {/* Amenities */}
          <div className="rm-filter-group">
            <label>Amenities</label>
            <div className="rm-amenity-checks">
              {AMENITY_LIST.slice(0, 8).map((a) => (
                <label key={a.label} className={`rm-check-item ${selectedAmenities.includes(a.label) ? "active" : ""}`}>
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(a.label)}
                    onChange={() => toggleAmenity(a.label)}
                  />
                  <span>{a.icon} {a.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reset */}
          <button className="rm-btn-reset" onClick={() => {
            setPriceRange([0, 50000]);
            setCapacityFilter("all");
            setSearchText("");
            setSelectedAmenities([]);
            setLocationFilter("all");
          }}>
            Clear All Filters
          </button>
        </aside>

        {/* Room Cards */}
        <div className="rm-main">
          <div className="rm-results-bar">
            <span>{filtered.length} room{filtered.length !== 1 ? "s" : ""} found</span>
          </div>

          {filtered.length > 0 ? (
            <div className="rm-grid">
              {filtered.map((room, index) => {
                const amenities = getAmenities(room.id);
                const img = room.featured_image || ROOM_IMAGES[index % ROOM_IMAGES.length];
                return (
                  <div key={room.id} className="rm-card">
                    <div className="rm-card-img-wrap">
                      <img src={img} alt={room.type_name} />
                      <div className="rm-card-price-tag">
                        Rs. {parseFloat(room.base_price || 0).toLocaleString()}
                        <small>/night</small>
                      </div>
                    </div>
                    <div className="rm-card-body">
                      <div className="rm-card-hotel">{room.hotel?.name || "Premium Hotel"}</div>
                      <h3 className="rm-card-title">{room.type_name}</h3>

                      <div className="rm-card-meta">
                        <span>👥 {room.max_occupancy} Guests</span>
                        <span>🛏️ Premium Bed</span>
                        <span>📍 {room.hotel?.city || "Nepal"}</span>
                      </div>

                      <div className="rm-card-amenities">
                        {amenities.slice(0, 4).map((a, i) => (
                          <span key={i} className="rm-amenity-tag">{a.icon} {a.label}</span>
                        ))}
                        {amenities.length > 4 && (
                          <span className="rm-amenity-more">+{amenities.length - 4} more</span>
                        )}
                      </div>

                      {room.description && (
                        <p className="rm-card-desc">{room.description.slice(0, 100)}...</p>
                      )}

                      <div className="rm-card-actions">
                        {(!user || user.role === 'customer') ? (
                          <Link to={`/booking?roomTypeId=${room.id}`} className="rm-btn-book">
                            Reserve Now
                          </Link>
                        ) : (
                          <button className="rm-btn-book" style={{ opacity: 0.6, cursor: 'not-allowed' }} disabled title="Managers cannot book rooms">
                            Managers Restricted
                          </button>
                        )}
                        <Link to={`/rooms/${room.id}?roomTypeId=${room.id}`} className="rm-btn-details">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rm-empty">
              <div className="rm-empty-icon">🏨</div>
              <h3>No rooms match your filters</h3>
              <p>Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Rooms;
