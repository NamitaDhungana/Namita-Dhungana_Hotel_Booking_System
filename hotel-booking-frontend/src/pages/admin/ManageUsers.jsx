import { useState, useEffect } from "react";
import { Modal, App } from "antd";
import { FaUserShield, FaUserCircle, FaExternalLinkAlt, FaCheck, FaTimes, FaToggleOn, FaToggleOff } from "react-icons/fa";
import apiClient from "../../services/apiClient";
import "../admin/ManageRooms.css";

const ManageUsers = () => {
    const { message, modal } = App.useApp();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deactivateModal, setDeactivateModal] = useState({ open: false, userId: null, note: "" });

    const fetchUsers = async () => {
        try {
            const res = await apiClient.get("/super-admin/users");
            setUsers(res.data);
        } catch {
            message.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleApprove = async (userId) => {
        try {
            await apiClient.post(`/super-admin/users/${userId}/approve`);
            message.success("User approved successfully");
            fetchUsers();
        } catch { message.error("Failed to approve user"); }
    };

    const handleReject = (userId) => {
        modal.confirm({
            title: "Reject Manager", content: "Are you sure you want to reject this manager?",
            okText: "Yes, Reject", okType: "danger", cancelText: "No",
            onOk: async () => {
                try {
                    await apiClient.post(`/super-admin/users/${userId}/reject`);
                    message.warning("User registration rejected.");
                    fetchUsers();
                } catch { message.error("Failed to reject user"); }
            }
        });
    };

    const handleActivate = (userId) => {
        modal.confirm({
            title: "Activate User",
            content: "Are you sure you want to activate this user? They will be able to log in again.",
            okText: "Activate", okType: "primary", cancelText: "Cancel",
            onOk: async () => {
                try {
                    await apiClient.post(`/super-admin/users/${userId}/activate`);
                    message.success("User activated successfully");
                    fetchUsers();
                } catch { message.error("Failed to activate user"); }
            }
        });
    };

    const handleDeactivateConfirm = async () => {
        if (!deactivateModal.note.trim()) { message.error("Please provide a reason for deactivation"); return; }
        try {
            await apiClient.post(`/super-admin/users/${deactivateModal.userId}/deactivate`, { note: deactivateModal.note });
            message.success("User deactivated");
            setDeactivateModal({ open: false, userId: null, note: "" });
            fetchUsers();
        } catch (err) { message.error(err?.response?.data?.message || "Failed to deactivate user"); }
    };

    const pendingManagers = users.filter(u => u.role === "admin" && u.registration_status === "pending");
    const allOtherUsers = users.filter(u => !(u.role === "admin" && u.registration_status === "pending"));

    const roleBadge = (role) => {
        const map = { admin: { bg: "#ede9fe", color: "#5b21b6" }, customer: { bg: "#e0f2fe", color: "#075985" }, super_admin: { bg: "#fae8ff", color: "#86198f" } };
        const s = map[role] || { bg: "#f1f5f9", color: "#475569" };
        return <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{role.replace("_", " ")}</span>;
    };

    return (
        <div className="manage-rooms-page">
            <div className="rm-header">
                <h2><FaUserShield style={{ marginRight: 10, color: "#6C5CE7" }} />User Management</h2>
            </div>

            {loading ? <p className="rm-loading">Loading users...</p> : (
                <>
                    {pendingManagers.length > 0 && (
                        <div className="rm-table-wrap" style={{ marginBottom: 32 }}>
                            <div style={{ marginBottom: 12 }}>
                                <h3 style={{ margin: 0, color: "#2D1B69", fontSize: 16, fontWeight: 700 }}>
                                    Pending Hotel Manager Approvals
                                    <span style={{ marginLeft: 10, background: "#fef9c3", color: "#854d0e", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{pendingManagers.length}</span>
                                </h3>
                            </div>
                            <table className="rm-table">
                                <thead><tr><th>#</th><th>Name</th><th>Email</th><th>PAN Number</th><th>Verify</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {pendingManagers.map((user, i) => (
                                        <tr key={user.id}>
                                            <td style={{ color: "#aaa", width: 40 }}>{i + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{user.name}</td>
                                            <td style={{ color: "#6C5CE7" }}>{user.email}</td>
                                            <td><code style={{ background: "#f3f0ff", color: "#5b21b6", padding: "2px 8px", borderRadius: 4, fontSize: 13 }}>{user.pan_number}</code></td>
                                            <td>
                                                <a href="https://ird.gov.np/pan-search/" target="_blank" rel="noopener noreferrer"
                                                    style={{ color: "#6C5CE7", textDecoration: "none", fontWeight: 500, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4, background: "#f3f0ff", padding: "4px 10px", borderRadius: 6 }}>
                                                    IRD <FaExternalLinkAlt size={10} />
                                                </a>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: 8 }}>
                                                    <button onClick={() => handleApprove(user.id)} style={{ background: "#dcfce7", color: "#166534", border: "none", padding: "6px 14px", borderRadius: 7, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                                                        <FaCheck size={11} /> Approve
                                                    </button>
                                                    <button onClick={() => handleReject(user.id)} style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "6px 14px", borderRadius: 7, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                                                        <FaTimes size={11} /> Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="rm-table-wrap">
                        <div style={{ marginBottom: 12 }}>
                            <h3 style={{ margin: 0, color: "#2D1B69", fontSize: 16, fontWeight: 700 }}>All System Users</h3>
                        </div>
                        <table className="rm-table">
                            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Email Status</th><th>Account Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {allOtherUsers.length === 0 ? (
                                    <tr><td colSpan={7} className="rm-empty">No users found.</td></tr>
                                ) : allOtherUsers.map((user, i) => (
                                    <tr key={user.id} style={{ opacity: !user.is_active ? 0.65 : 1 }}>
                                        <td style={{ color: "#aaa", width: 40 }}>{i + 1}</td>
                                        <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><FaUserCircle size={18} color="#c4b5fd" /><span style={{ fontWeight: 500 }}>{user.name}</span></div></td>
                                        <td style={{ color: "#6C5CE7", fontSize: 13 }}>{user.email}</td>
                                        <td>{roleBadge(user.role)}</td>
                                        <td><span style={{ background: user.email_verified_at ? "#dcfce7" : "#f1f5f9", color: user.email_verified_at ? "#166534" : "#64748b", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{user.email_verified_at ? "Verified" : "Unverified"}</span></td>
                                        <td>
                                            <span style={{ background: user.is_active ? "#dcfce7" : "#fee2e2", color: user.is_active ? "#166534" : "#991b1b", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                                                {user.is_active ? "Active" : "Deactivated"}
                                            </span>
                                            {!user.is_active && user.deactivation_note && (
                                                <div style={{ fontSize: 11, color: "#991b1b", marginTop: 3, maxWidth: 180 }} title={user.deactivation_note}>
                                                    {user.deactivation_note.length > 40 ? user.deactivation_note.slice(0, 40) + "..." : user.deactivation_note}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {user.role !== "super_admin" && (
                                                user.is_active ? (
                                                    <button onClick={() => setDeactivateModal({ open: true, userId: user.id, note: "" })}
                                                        style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "6px 14px", borderRadius: 7, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                                                        <FaToggleOff size={14} /> Deactivate
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleActivate(user.id)}
                                                        style={{ background: "#dcfce7", color: "#166534", border: "none", padding: "6px 14px", borderRadius: 7, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                                                        <FaToggleOn size={14} /> Activate
                                                    </button>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <Modal
                open={deactivateModal.open}
                title="Deactivate User"
                okText="Deactivate"
                okButtonProps={{ danger: true }}
                cancelText="Cancel"
                onOk={handleDeactivateConfirm}
                onCancel={() => setDeactivateModal({ open: false, userId: null, note: "" })}
            >
                <p style={{ color: "#555", marginBottom: 12 }}>This user will no longer be able to log in. Please provide a reason:</p>
                <textarea
                    value={deactivateModal.note}
                    onChange={e => setDeactivateModal(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="e.g. Violation of terms of service, suspicious activity..."
                    rows={4}
                    maxLength={500}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #ddd", fontSize: 14, resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
                <div style={{ textAlign: "right", fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{deactivateModal.note.length}/500</div>
            </Modal>
        </div>
    );
};

export default ManageUsers;