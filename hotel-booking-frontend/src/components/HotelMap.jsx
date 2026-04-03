import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons broken by vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

async function geocodeCity(city, country) {
  const query = [city, country].filter(Boolean).join(", ");
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  return null;
}

function HotelMap({ lat, lng, name, address, city, country }) {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lat && lng) {
      setPosition([parseFloat(lat), parseFloat(lng)]);
      setLoading(false);
    } else if (city) {
      geocodeCity(city, country)
        .then((pos) => setPosition(pos))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [lat, lng, city, country]);

  if (loading) {
    return (
      <div className="map-loading">Loading map...</div>
    );
  }

  if (!position) {
    return (
      <div className="map-loading">Map location not available.</div>
    );
  }

  return (
    <div style={{ borderRadius: "12px", overflow: "hidden", height: "360px" }}>
      <MapContainer
        center={position}
        zoom={lat && lng ? 15 : 13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <strong>{name}</strong>
            {address && <><br />{address}</>}
            {city && <><br />{city}</>}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default HotelMap;
