import React from 'react';
import AdminDashboard from '../admin/AdminDashboard';

// Super admin dashboard reuses the same component — it detects role internally
const SuperAdminDashboard = () => <AdminDashboard />;

export default SuperAdminDashboard;
