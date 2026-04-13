import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd";
import authService from "./services/authService";
import { BookingCartProvider } from "./context/BookingCartContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Hotels from "./pages/Hotels";
import RoomDetails from "./pages/RoomDetails";
import HotelDetails from "./pages/HotelDetails";
import Booking from "./pages/Booking";
import MultiBooking from "./pages/MultiBooking";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import HotelList from "./components/HotelList";
import UserProfile from "./pages/UserProfile";
import MyBookings from "./pages/MyBookings";
import AdminLayout from "./components/AdminLayout";
import ManageHotels from "./pages/admin/ManageHotels";
import ManageRooms from "./pages/admin/ManageRooms";
import ManageRoomTypes from "./pages/admin/ManageRoomTypes";
import ManageBookings from "./pages/admin/ManageBookings";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageFacilities from "./pages/admin/ManageFacilities";
import AdminNotifications from "./pages/admin/AdminNotifications";
import NotificationCenter from "./components/NotificationCenter";
import KhaltiReturn from "./pages/KhaltiReturn";
import VerifyEmail from "./pages/VerifyEmail";
import ReviewPage from "./pages/ReviewPage";
import SearchResults from "./pages/SearchResults";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SystemSettings from "./pages/superadmin/SystemSettings";
import ContactQueries from "./pages/superadmin/ContactQueries";
import ManageAdvertisements from "./pages/admin/ManageAdvertisements";
import ManageAds from "./pages/superadmin/ManageAds";
import AdReturn from "./pages/AdReturn";
import ForgotPassword from "./pages/ForgotPassword";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RegistrationStatus from "./pages/RegistrationStatus";

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
        <BookingCartProvider>
        <main style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            {/* Public layout */}
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
              <Route path="/rooms/:id" element={<RoomDetails />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/hotels/:id" element={<HotelDetails />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/multi-booking" element={<MultiBooking />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/hotel-list" element={<HotelList />} />
              <Route path="/notifications" element={<NotificationCenter />} />
              <Route path="/userProfile" element={<UserProfile />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/payment/khalti/return" element={<KhaltiReturn />} />
              <Route path="/payment/ad/return" element={<AdReturn />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/review/:bookingId" element={<ReviewPage />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy-policies" element={<PrivacyPolicy />} />
              <Route path="/terms-of-services" element={<TermsOfService />} />
            </Route>

            {/* Admin routes — Hotel Manager only */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="hotels" element={<ManageHotels />} />
              <Route path="room-types" element={<ManageRoomTypes />} />
              <Route path="rooms" element={<ManageRooms />} />
              <Route path="facilities" element={<ManageFacilities />} />
              <Route path="bookings" element={<ManageBookings />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="advertisements" element={<ManageAdvertisements />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </Route>

            {/* Super Admin routes */}
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <AdminLayout role="super_admin" />
                </ProtectedRoute>
              }
            >
              <Route index element={<SuperAdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="hotels" element={<ManageHotels />} />
              <Route path="bookings" element={<ManageBookings />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="contact-queries" element={<ContactQueries />} />
              <Route path="advertisements" element={<ManageAds />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/registration-status" element={<RegistrationStatus />} />
          </Routes>
        </main>
        </BookingCartProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
