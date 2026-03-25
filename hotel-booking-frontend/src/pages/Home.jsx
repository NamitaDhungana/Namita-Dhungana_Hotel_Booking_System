import { useState, useEffect } from "react";
import "./Home.css";
import Rating from "./Rating";
import { Link } from "react-router-dom";
import hotelService from "../services/hotelService";

function Home() {
  const [trendingRooms, setTrendingRooms] = useState([]);
  const [popularHotels, setPopularHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Static Fallbacks if backend is empty
  const staticHotels = [
    { id: 1, name: "Pokhara", city: "Lakeside", featured_image: "https://api.ecoholidaysnepal.com/media/attachments/Pokhara-Davis-Falls-0.jpg" },
    { id: 2, name: "Lumbini", city: "Mayadevi Temple", featured_image: "https://upload.wikimedia.org/wikipedia/commons/1/18/BRP_Lumbini_Mayadevi_temple.jpg" },
    { id: 3, name: "Kathmandu", city: "Boudhha", featured_image: "https://www.footprintadventure.com/uploads/media/Monuments%20and%20Culture%20in%20Nepal/boudhanath-stupa-nepal.jpg" },
    { id: 4, name: "Chitwan", city: "Sauraha", featured_image: "https://www.chitwantourism.com/wp-content/uploads/2023/08/elephant-safari-chitwan.jpg" },
  ];

  const staticRooms = [
    {
      id: "royal-orchid",
      type_name: "Royal Orchid Suite",
      hotel: { name: "Pokhara", city: "Lakeside" },
      base_price: 4200,
      featured_image: "https://www.royalorchidhotels.com/images/Rooms/07_58_2020_02_58_06Stay_Club%20Room.jpg"
    },
    {
      id: "lake-view",
      type_name: "Lake View Premium",
      hotel: { name: "Chitwan", city: "Sauraha" },
      base_price: 3900,
      featured_image: "https://justallinclusive.com/wp-content/uploads/2018/07/ja-lake-view-hotel-deluxe-resort-course-view-room.jpg"
    },
    {
      id: "modern-paradise",
      type_name: "Modern Paradise",
      hotel: { name: "Kathmandu", city: "Boudhha" },
      base_price: 3500,
      featured_image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/528089496.jpg?k=aeb80e18992018606ffce5856bceb9c1f4bb2254dbff5c226b94a32eb6274a72&o"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roomsData, hotelsData] = await Promise.all([
          hotelService.getAllRoomTypes(),
          hotelService.getHotels()
        ]);

        setTrendingRooms(roomsData && roomsData.length > 0 ? roomsData.slice(0, 3) : staticRooms);
        setPopularHotels(hotelsData && hotelsData.length > 0 ? hotelsData.slice(0, 4) : staticHotels);
      } catch (error) {
        console.error("Home page data fetch failed, using static fallbacks:", error);
        setTrendingRooms(staticRooms);
        setPopularHotels(staticHotels);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home">

      {/* ------------------ HERO SECTION ------------------ */}
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Perfect Stay</h1>
          <p>Discover top-rated rooms, premium hotels, and luxury stays worldwide.</p>

          <div className="hero-buttons">
            <Link to="/booking">
              <button className="btn-primary">Book Now</button>
            </Link>

            <Link to="/rooms">
              <button className="btn-outline">Explore Rooms</button>
            </Link>
          </div>

        </div>
      </section>

      {/* ------------------ POPULAR DESTINATIONS ------------------ */}
      <section className="section">
        <h2 className="section-title">Popular Destinations</h2>
        <p className="section-subtitle">Top places travelers love</p>

        <div className="destination-grid">
          {loading ? (
            <div className="loading" style={{ gridColumn: 'span 4', textAlign: 'center', padding: '40px' }}>Discovering places...</div>
          ) : (
            popularHotels.map((hotel) => (
              <Link to={hotel.id && typeof hotel.id === 'number' ? `/rooms?hotelId=${hotel.id}` : "/rooms"} key={hotel.id} className="destination-card">
                <img src={hotel.featured_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=220"} alt={hotel.name} />
                <h3>{hotel.city || hotel.name}</h3>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ------------------ TRENDING ROOMS ------------------ */}
      <section className="section">
        <h2 className="section-title">Trending Rooms</h2>
        <p className="section-subtitle">Most booked rooms this week</p>

        <div className="card-grid">
          {loading ? (
            <div className="loading" style={{ width: '100%', textAlign: 'center', padding: '40px' }}>Fetching best rooms...</div>
          ) : (
            trendingRooms.map((room) => (
              <div className="room-card" key={room.id}>
                <img src={room.room_image_url || room.hotel?.featured_image || "https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=600&q=390"} alt={room.type_name} />
                <div className="room-info">
                  <h3>{room.type_name}</h3>
                  <p>{room.hotel?.name}, {room.hotel?.city}</p>
                  <Rating value={4.5} />
                  <p className="price">NPR {parseFloat(room.base_price).toLocaleString()} / night</p>
                  <Link to={`/booking?roomTypeId=${room.id}`}>
                    <button className="btn-book">Book Now</button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ------------------ EXPLORE CATEGORIES ------------------ */}
      <section className="section">
        <h2 className="section-title">Explore by Category</h2>
        <p className="section-subtitle">Find exactly what you're looking for</p>

        <div className="category-grid">

          <Link to="/rooms?category=Luxury" className="category-card luxury">
            <h3>Luxury Hotels</h3>
            <p>Experience comfort & premium stays</p>
          </Link>

          <Link to="/rooms?category=Budget" className="category-card budget">
            <h3>Budget Rooms</h3>
            <p>Affordable stays for everyone</p>
          </Link>

          <Link to="/rooms?category=Family" className="category-card family">
            <h3>Family Suites</h3>
            <p>Spacious and comfortable rooms</p>
          </Link>

          <Link to="/rooms?category=Resort" className="category-card resort">
            <h3>Resorts & Spa</h3>
            <p>Relax and enjoy peaceful retreat</p>
          </Link>
        </div>
      </section>

      {/* ------------------ EXCLUSIVE OFFER ------------------ */}
      <section className="offer">
        <h2 className="offer-title">Ready to Book Your Dream Vacation?</h2>
        <p>Join thousands of happy travelers booking comfort & luxury.</p>

        <div className="offer-btns">
          <button className="btn-primary">Get Started</button>
          <Link to="/contact">
            <button className="btn-outline">Email Us</button>
          </Link>

        </div>
      </section>

    </div>
  );
}

export default Home;
