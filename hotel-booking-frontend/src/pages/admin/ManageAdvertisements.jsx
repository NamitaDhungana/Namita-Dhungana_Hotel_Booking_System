import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";

const STATUS_COLORS = {
  pending: "#f59e0b",
  approved: "#10b981",
  rejected: "#ef4444",
};

const PAYMENT_COLORS = {
  unpaid: "#9ca3af",
  pending: "#f59e0b",
  completed: "#10b981",
  failed: "#ef4444",
};

export default function ManageAdvertisements() {
  const [ads, setAds] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [packages, setPackages] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    hotel_id: "",
    title: "",
    package: "",
    banner_image: null,
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const fetchAds = async () => {
    try {
      const res = await apiClient.get("/admin/advertisements");
      setAds(res.data);
    } catch {
      setError("Failed to load advertisements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
    apiClient.get("/admin/my-hotels").then((res) => {
      const list = res.data.data || res.data;
      setHotels(Array.isArray(list) ? list : []);
    }).catch(() => setHotels([]));

    apiClient.get("/advertisements/packages").then((res) => {
      setPackages(res.data || {});
    }).catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm((f) => ({ ...f, banner_image: file }));
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.hotel_id) { setError("Please select a hotel."); return; }
    if (!form.package)  { setError("Please select a package."); return; }
    if (!form.banner_image) { setError("Please select a banner image."); return; }
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("hotel_id", form.hotel_id);
      data.append("title", form.title);
      data.append("package", form.package);
      data.append("banner_image", form.banner_image);

      const res = await apiClient.post("/admin/advertisements/initiate-payment", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Redirect to Khalti
      window.location.href = res.data.payment_url;
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this advertisement?")) return;
    try {
      await apiClient.delete(`/admin/advertisements/${id}`);
      setAds((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError("Failed to delete.");
    }
  };

  const selectedPkg = packages[form.package];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Banner Advertisements</h2>
        <button
          onClick={() => { setShowForm((v) => !v); setError(""); }}
          style={{ background: "#6C5CE7", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}
        >
          {showForm ? "Cancel" : "+ New Advertisement"}
        </button>
      </div>

      {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 16px", borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#f8f7ff", border: "1px solid #e0e0e0", borderRadius: 12, padding: 24, marginBottom: 28 }}>
          <h3 style={{ marginTop: 0 }}>Submit Advertisement</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Select Hotel *</label>
              <select
                required value={form.hotel_id}
                onChange={(e) => setForm((f) => ({ ...f, hotel_id: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", boxSizing: "border-box", background: "#fff" }}
              >
                <option value="">-- Choose a hotel --</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Ad Title *</label>
              <input
                required value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", boxSizing: "border-box" }}
                placeholder="e.g. Summer Special Offer"
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Select Package *</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {Object.entries(packages).map(([key, pkg]) => (
                  <label
                    key={key}
                    style={{
                      border: `2px solid ${form.package === key ? "#6C5CE7" : "#e5e7eb"}`,
                      borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                      background: form.package === key ? "#f0eeff" : "#fff",
                      transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="radio" name="package" value={key}
                      checked={form.package === key}
                      onChange={(e) => setForm((f) => ({ ...f, package: e.target.value }))}
                      style={{ display: "none" }}
                    />
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#1f2937" }}>{pkg.label}</div>
                    <div style={{ color: "#6C5CE7", fontWeight: 700, fontSize: 18, margin: "4px 0" }}>
                      NPR {pkg.price.toLocaleString()}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: 13 }}>{pkg.days} days display</div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Banner Image * (JPEG/PNG/WebP, max 4MB)</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} required />
            {preview && (
              <img src={preview} alt="preview" style={{ marginTop: 12, maxHeight: 160, borderRadius: 8, border: "1px solid #ddd", display: "block" }} />
            )}
          </div>

          {selectedPkg && (
            <div style={{ marginTop: 20, background: "#f0eeff", border: "1px solid #c4b5fd", borderRadius: 10, padding: "14px 18px" }}>
              <p style={{ margin: 0, fontWeight: 600, color: "#4c1d95" }}>
                You will be charged <strong>NPR {selectedPkg.price.toLocaleString()}</strong> via Khalti for a {selectedPkg.label} banner display.
              </p>
            </div>
          )}

          <button
            type="submit" disabled={submitting || !form.package}
            style={{ marginTop: 20, background: "#6C5CE7", color: "#fff", border: "none", borderRadius: 8, padding: "12px 32px", cursor: "pointer", fontWeight: 600, fontSize: 15, opacity: (submitting || !form.package) ? 0.6 : 1 }}
          >
            {submitting ? "Redirecting to Khalti..." : "Pay and Submit"}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : ads.length === 0 ? (
        <p style={{ color: "#888" }}>No advertisements yet. Submit one above.</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {ads.map((ad) => (
            <div key={ad.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, display: "flex", gap: 16, alignItems: "flex-start" }}>
              <img
                src={`http://localhost:8000/storage/${ad.banner_image}`}
                alt={ad.title}
                style={{ width: 180, height: 90, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <h4 style={{ margin: 0 }}>{ad.title}</h4>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ background: (PAYMENT_COLORS[ad.payment_status] || "#9ca3af") + "22", color: PAYMENT_COLORS[ad.payment_status] || "#9ca3af", padding: "3px 10px", borderRadius: 20, fontWeight: 600, fontSize: 12 }}>
                      Payment: {ad.payment_status}
                    </span>
                    <span style={{ background: STATUS_COLORS[ad.status] + "22", color: STATUS_COLORS[ad.status], padding: "3px 10px", borderRadius: 20, fontWeight: 600, fontSize: 12 }}>
                      {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                    </span>
                  </div>
                </div>
                <p style={{ margin: "6px 0 0", color: "#555", fontSize: 14 }}>
                  Hotel: <strong>{ad.hotel?.name}</strong> — {ad.hotel?.city}
                </p>
                <p style={{ margin: "4px 0 0", color: "#555", fontSize: 14 }}>
                  Amount: <strong>NPR {Number(ad.amount_paid).toLocaleString()}</strong>
                  {ad.start_date && <> &nbsp;|&nbsp; {ad.start_date} → {ad.end_date || "—"}</>}
                </p>
                {ad.rejection_reason && (
                  <p style={{ margin: "6px 0 0", color: "#b91c1c", fontSize: 13 }}>Reason: {ad.rejection_reason}</p>
                )}
              </div>
              {(ad.payment_status === 'unpaid' || ad.status === 'rejected') && (
                <button
                  onClick={() => handleDelete(ad.id)}
                  style={{ background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
