import { Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Hotels from "./pages/Hotels";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import HotelDetails from "./pages/HotelDetails";
import Booking from "./pages/Booking";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Rating from "./pages/Rating";
import About from "./pages/About";
import HotelList from "./components/HotelList";

import UserProfile from "./pages/UserProfile";
import AdminLayout from "./components/AdminLayout";
import ManageHotels from "./pages/admin/ManageHotels";
import ManageRooms from "./pages/admin/ManageRooms";
import ManageBookings from "./pages/admin/ManageBookings";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotificationCenter from "./components/NotificationCenter";

function App() {
  return (
    <main style={{ flex: 1 }}>
      <Routes>

        {/* Parent layout route */}
        <Route
          element={
            <>
              <Header />
              <div style={{
                height: "60px"
              }} />
              <Outlet />
              <Footer />
            </>
          }
        >
          {/* Child routes */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/hotel-list" element={<HotelList />} />
          <Route path="/notifications" element={<NotificationCenter />} />

          <Route path="/userProfile" element={<UserProfile />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="hotels" element={<ManageHotels />} />
          <Route path="rooms" element={<ManageRooms />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Routes>
    </main>

  );
}

export default App;



