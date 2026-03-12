import { useEffect, useState } from "react";
import axios from "axios";

function HotelList() {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/hotels")
      .then((res) => {
        setHotels(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Hotels</h1>
      <ul>
        {hotels.map((hotel) => (
          <li key={hotel.id}>{hotel.name} - {hotel.city}</li>
        ))}
      </ul>
    </div>
  );
}

export default HotelList;
