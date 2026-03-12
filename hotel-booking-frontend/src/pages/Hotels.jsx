import { useState, useEffect } from "react";
import "./hotels.css";
import { Link } from "react-router-dom";
import hotelService from "../services/hotelService";

function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback static hotels
  const staticHotels = [
    { id: 1, name: "Hotel Grand Pokhara", city: "Pokhara, Lakeside", featured_image: "https://images.getaroom-cdn.com/image/upload/s--TmEjyUgK--/c_limit,e_improve,fl_lossy.immutable_cache,h_460,q_auto:good,w_460/v1662863807/b7e3e0d9a34641884759bbf63ea6f4c78f5ea3c3?_a=BACAEuDL&atc=e7cd1cfa" },
    { id: 2, name: "Royal Kathmandu Stay", city: "Kathmandu, Thamel", featured_image: "https://royal.hotels-in-kathmandu.com/data/Pics/OriginalPhoto/14092/1409248/1409248079/hotel-royal-kathmandu-kathmandu-pic-19.JPEG" },
    { id: 3, name: "Park Safari Resort", city: "Chitwan, Sauraha", featured_image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/13/ab/e9/03/getlstd-property-photo.jpg?w=900&h=500&s=1" },
    { id: 4, name: "Club Himalayan Nagarkot Resort", city: "Nagarkot", featured_image: "https://www.opulentroutes.com/wp-content/uploads/2021/01/club-himalaya-nagarkot-resort-nagarkot-nepal.jpg" },
    { id: 5, name: "Barahi Resort", city: "Pokhara", featured_image: "https://images.trvl-media.com/lodging/4000000/3900000/3891900/3891821/175a70b7.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill" },
    { id: 6, name: "Hotel Yak & Yeti", city: "Kathmandu, Durbar Marg", featured_image: "https://media-cdn.tripadvisor.com/media/photo-s/09/34/5c/a0/hotel-yak-yeti.jpg" },
    { id: 7, name: "Hotel Annapurna", city: "Kathmandu", featured_image: "https://BoOqifY.com/wp-content/uploads/2017/08/Hotel-Annapurna-nepal-kathmandu.png" },
    { id: 8, name: "Hotel Mystic Mountain", city: "Nagarkot", featured_image: "https://q-xx.bstatic.com/xdata/images/hotel/max500/109715787.jpg?k=25af542d3a30a5e646ac8947667e473474a9650ab2a830f27d85a6fb13aace40&o=" },
    { id: 9, name: "Radisson Kathmandu", city: "Kathmandu, Lazimpat", featured_image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/a7/7a/e3/radisson-hotel-kathmandu.jpg?w=900&h=500&s=1" },
    { id: 10, name: "Kasara Resort", city: "Chitwan", featured_image: "https://r2imghtlak.mmtcdn.com/r2-mmt-htl-image/room-imgs/202101201518265579-6852130-d36ff5b6c98d11eeb1b30a58a9feac02.jpg" },
    { id: 11, name: "Temple Tree Resort", city: "Pokhara", featured_image: "https://cdn.audleytravel.com/1050/748/79/1337652-temple-tree-resort--spa.webp" },
    { id: 12, name: "Fish Tail Lodge", city: "Pokhara Lakefront", featured_image: "https://www.ampersandtravel.com/media/61173/Fishtail-Lodge-Pokhara-Nepal-1-.jpg?mode=crop" },
    { id: 13, name: "Hotel Soaltee Kathmandu", city: "Kathmandu", featured_image: "https://soalteehotel.com/uploads/images/20250115105121_67879329ecc905.93783695.jpg" },
    { id: 14, name: "Hotel Himalaya", city: "Lalitpur", featured_image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/701748744.jpg?k=1ca513b579d5f7b50bc29dfe442196b1108e40bc29a1fe5a4f847cf384977ff2&o=" },
    { id: 15, name: "Baber Mahal Vilas", city: "Kathmandu", featured_image: "https://www.babermahalvilas.com/images/gallery/galleryimages/1kFUw-babermahal.webp" },
    { id: 16, name: "Green Park Resort", city: "Chitwan", featured_image: "https://media-cdn.tripadvisor.com/media/photo-s/2b/44/4f/50/caption.jpg" },
  ];

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const data = await hotelService.getHotels();
        // If backend returns data, use it; otherwise, use fallback
        if (data && data.length > 0) {
          setHotels(data);
        } else {
          setHotels(staticHotels);
        }
      } catch (err) {
        console.error("Failed to fetch hotels from backend, using fallbacks:", err);
        setHotels(staticHotels);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  if (loading) return <div className="loading" style={{ textAlign: "center", padding: "50px", fontSize: "1.2rem" }}>Loading hotels...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="hotels-page">
      <h1 className="title">Popular Hotels</h1>
      <p className="subtitle">Choose from top-rated hotels across Nepal</p>

      <div className="hotels-grid">
        {hotels.map((hotel, index) => (
          <div className="hotel-card" key={hotel.id || index}>
            <img
              src={hotel.featured_image || "https://via.placeholder.com/400x300?text=Hotel+Image"}
              alt={hotel.name}
            />
            <h3>{hotel.name}</h3>
            <p>{hotel.city}</p>
            <Link to={`/rooms${hotel.id && typeof hotel.id === 'number' ? `?hotelId=${hotel.id}` : ''}`} className="btn">
              View Rooms
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Hotels;
