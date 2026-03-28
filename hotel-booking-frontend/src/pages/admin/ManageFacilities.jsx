import React, { useState, useEffect } from 'react';
import { App } from 'antd';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import adminService from '../../services/adminService';
import hotelService from '../../services/hotelService';
import '../admin/ManageRooms.css';

const defaultForm = { name: '', type: 'facility' };

const ManageFacilities = () => {
    const { message, modal } = App.useApp();
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(defaultForm);

    useEffect(() => { fetchAmenities(); }, []);

    const fetchAmenities = async () => {
        try {
            const data = await hotelService.getAmenities();
            setAmenities(Array.isArray(data) ? data : []);
        } catch {
            message.error('Failed to load facilities & features');
        } finally {
            setLoading(false);
        }
    };

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await adminService.updateAmenity(editing.amenity_id, form);
                message.success('Updated successfully!');
            } else {
                await adminService.createAmenity(form);
                message.success('Added successfully!');
            }
            setShowModal(false);
            setEditing(null);
            setForm(defaultForm);
            fetchAmenities();
        } catch (err) {
            message.error(err.message || 'Action failed');
        }
    };

    const handleDelete = (item) => {
        modal.confirm({
            title: `Delete "${item.name}"?`,
            okText: 'Delete', okType: 'danger', cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await adminService.deleteAmenity(item.amenity_id);
                    message.success('Deleted!');
                    fetchAmenities();
                } catch { message.error('Delete failed'); }
            }
        });
    };

    const openEdit = (a) => {
        setEditing(a);
        setForm({ name: a.name, type: a.type });
        setShowModal(true);
    };

    const openAdd = (type = 'facility') => {
        setEditing(null);
        setForm({ name: '', type });
        setShowModal(true);
    };

    const facilities = amenities.filter(a => a.type === 'facility');
    const features   = amenities.filter(a => a.type === 'feature');

    const renderTable = (items, type) => (
        <div className="rm-table-wrap" style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: '#2D1B69', fontSize: 16, fontWeight: 700 }}>
                    {type === 'facility' ? '🛎 Facilities' : '🏠 Features'}
                </h3>
                <button className="rm-add-btn" style={{ padding: '7px 14px', fontSize: 13 }} onClick={() => openAdd(type)}>
                    <FaPlus /> Add {type === 'facility' ? 'Facility' : 'Feature'}
                </button>
            </div>
            <table className="rm-table" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                    <col style={{ width: 50 }} />
                    <col />
                    <col style={{ width: 120 }} />
                </colgroup>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr><td colSpan={3} className="rm-empty">No {type}s added yet.</td></tr>
                    ) : items.map((a, i) => (
                        <tr key={a.amenity_id}>
                            <td style={{ color: '#aaa' }}>{i + 1}</td>
                            <td style={{ fontWeight: 500 }}>{a.name}</td>
                            <td>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="rm-edit-btn" onClick={() => openEdit(a)} title="Edit"><FaEdit /></button>
                                    <button className="rm-edit-btn" onClick={() => handleDelete(a)} title="Delete" style={{ color: '#e74c3c' }}><FaTrash /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="manage-rooms-page">
            <div className="rm-header">
                <h2>Features and Facilities</h2>
            </div>

            {loading ? <p className="rm-loading">Loading...</p> : (
                <>
                    {renderTable(facilities, 'facility')}
                    {renderTable(features, 'feature')}
                </>
            )}

            {showModal && (
                <div className="rm-overlay" onClick={() => setShowModal(false)}>
                    <div className="rm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <h3>{editing ? 'Edit' : 'Add'} {form.type === 'facility' ? 'Facility' : 'Feature'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="rm-field">
                                    <label>Name</label>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={e => set('name', e.target.value)}
                                        placeholder={form.type === 'facility' ? 'e.g. Air Conditioner' : 'e.g. Balcony'}
                                    />
                                </div>
                                <div className="rm-field">
                                    <label>Type</label>
                                    <input
                                        type="text"
                                        value={form.type === 'facility' ? 'Facility' : 'Feature'}
                                        disabled
                                        style={{ background: '#f3f0ff', color: '#6C5CE7', fontWeight: 600, cursor: 'not-allowed' }}
                                    />
                                </div>
                            </div>
                            <div className="rm-modal-footer">
                                <button type="button" className="rm-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="rm-save">{editing ? 'Update' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageFacilities;
