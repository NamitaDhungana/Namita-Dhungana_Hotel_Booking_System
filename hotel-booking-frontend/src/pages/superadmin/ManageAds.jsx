import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";

const STATUS_COLORS = {
  pending: "#f59e0b",
  approved: "#10b981",
  rejected: "#ef4444",
};

export default function ManageAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // ad id
  const [rejectReason, setRejectReason] = useState("");
  const [msg, setMsg] = useState("");

  const fetchAds = async () => {
    try {
      const res = await apiClient.get("/super-admin/advertisements");
      setAds(res.data);
    } catch {
      setMsg("Failed to load advertisements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(id + "_approve");
    try {
      await apiClient.post(`/super-admin/advertisements/${id}/approve`);
      setMsg("Advertisement approved.");
      fetchAds();
    } catch {
      setMsg("Failed to approve.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading(rejectModal + "_reject");
    try {
      await apiClient.post(`/super-admin/advertisements/${rejectModal}/reject`, {
        rejection_reason: rejectReason,
      });
      setMsg("Advertisement rejected.");
      setRejectModal(null);
      setRejectReason("");
      fetchAds();
    } catch {
      setMsg("Failed to reject.");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === "all" ? ads : ads.filter((a) => a.status === filter);

  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ marginTop: 0 }}>Advertisement Management</h2>

      {msg && (
        <div style={{ background: "#f0fdf4", color: "#065f46", padding: "10px 16px", borderRadius: 8, marginBottom: 16 }}>
          {msg}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "6px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 600,
              background: filter === s ? "#6C5CE7" : "#f3f4f6",
              color: filter === s ? "#fff" : "#374151",
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "#888" }}>No advertisements found.</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {filtered.map((ad) => (
            <div key={ad.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, display: "flex", gap: 16, alignItems: "flex-start" }}>
              <img
                src={`http://localhost:8000/storage/${ad.banner_image}`}
                alt={ad.title}
                style={{ width: 200, height: 100, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0 }}>{ad.title}</h4>
                  <span style={{ background: STATUS_COLORS[ad.status] + "22", color: STATUS_COLORS[ad.status], padding: "3px 12px", borderRadius: 20, fontWeight: 600, fontSize: 13 }}>
                    {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", color: "#555", fontSize: 14 }}>
                  Hotel: <strong>{ad.hotel?.name}</strong> — {ad.hotel?.city}
                </p>
                <p style={{ margin: "4px 0 0", color: "#555", fontSize: 14 }}>
                  Amount Paid: <strong>NPR {Number(ad.amount_paid).toLocaleString()}</strong>
                  {ad.start_date && <> &nbsp;|&nbsp; {ad.start_date} → {ad.end_date || "—"}</>}
                </p>
                {ad.rejection_reason && (
                  <p style={{ margin: "4px 0 0", color: "#b91c1c", fontSize: 13 }}>Reason: {ad.rejection_reason}</p>
                )}
                {ad.status === "pending" && ad.payment_status === "completed" && (
                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <button
                      onClick={() => handleApprove(ad.id)}
                      disabled={actionLoading === ad.id + "_approve"}
                      style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "7px 20px", cursor: "pointer", fontWeight: 600 }}
                    >
                      {actionLoading === ad.id + "_approve" ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => { setRejectModal(ad.id); setRejectReason(""); }}
                      style={{ background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 8, padding: "7px 20px", cursor: "pointer", fontWeight: 600 }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 420, maxWidth: "90vw" }}>
            <h3 style={{ marginTop: 0 }}>Reject Advertisement</h3>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", boxSizing: "border-box", resize: "vertical" }}
              placeholder="e.g. Image quality too low"
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <button onClick={() => setRejectModal(null)} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #ccc", background: "#f3f4f6", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal + "_reject"}
                style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 600 }}
              >
                {actionLoading === rejectModal + "_reject" ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
