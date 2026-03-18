import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd";
import authService from "./services/authService";
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
import About from "./pages/About";
import HotelList from "./components/HotelList";
import UserProfile from "./pages/UserProfile";
import AdminLayout from "./components/AdminLayout";
import ManageHotels from "./pages/admin/ManageHotels";
import ManageRooms from "./pages/admin/ManageRooms";
import ManageBookings from "./pages/admin/ManageBookings";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import NotificationCenter from "./components/NotificationCenter";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children ? children : <Outlet />;
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6C5CE7',
          borderRadius: 8,
          fontFamily: "'Outfit', sans-serif",
        },
      }}
    >
      <AntdApp>
        <main style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            {/* Parent layout route */}
            <Route
              element={
                <>
                  <Header />
                  <div style={{ height: "60px" }} />
                  <div style={{ flex: 1 }}>
                    <Outlet />
                  </div>
                  <Footer />
                </>
              }
            >
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
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
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
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
