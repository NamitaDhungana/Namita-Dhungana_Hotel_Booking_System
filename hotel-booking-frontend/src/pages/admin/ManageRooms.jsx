import { useState, useEffect } from 'react';
import { App } from 'antd';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import adminService from '../../services/adminService';
import hotelService from '../../services/hotelService';
import './ManageRooms.css';

const STATUS_OPTIONS = ['available', 'occupied', 'maintenance'];

const STATUS_COLORS = {
    available:   { bg: '#d4edda', color: '#155724' },
    occupied:    { bg: '#fff3cd', color: '#856404' },
    maintenance: { bg: '#f8d7da', color: '#721c24' },
};

const defaultAddForm  = { hotel_id: '', room_type_id: '', room_number: '', floor: '', status: 'available', image_url: '', notes: '' };
const defaultEditForm = { room_type_id: '', room_number: '', floor: '', status: 'available', image_url: '', notes: '' };

const ManageRooms = () => {
    const { message, modal } = App.useApp();
    const [rooms, setRooms] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [allRoomTypes, setAllRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState(defaultAddForm);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [editForm, setEditForm] = useState(defaultEditForm);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [roomsData, hotelsData, roomTypesData] = await Promise.all([
                adminService.getRooms(),
                adminService.getMyHotels(),
                hotelService.getAllRoomTypes(),
            ]);
            setRooms(Array.isArray(roomsData) ? roomsData : []);
            setHotels(Array.isArray(hotelsData) ? hotelsData : []);
            setAllRoomTypes(Array.isArray(roomTypesData) ? roomTypesData : []);
        } catch {
            message.error('Failed to load rooms');
        } finally {
            setLoading(false);
        }
    };

    const setAdd = (field, value) => setAddForm(prev => ({ ...prev, [field]: value }));
    const setEdit = (field, value) => setEditForm(prev => ({ ...prev, [field]: value }));

    const handleHotelChange = (hotelId) => {
        setAddForm(prev => ({ ...prev, hotel_id: hotelId, room_type_id: '' }));
    };

    const filteredRoomTypes = allRoomTypes.filter(
        rt => String(rt.hotel_id) === String(addForm.hotel_id)
    );

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await adminService.createRoom(addForm);
            message.success('Room added!');
            setShowAddModal(false);
            setAddForm(defaultAddForm);
            fetchData();
        } catch (error) {
            message.error('Failed to add room: ' + (error.message || 'Unknown error'));
        }
    };

    const openEdit = (room) => {
        setEditingRoom(room);
        setEditForm({
            room_type_id: room.room_type_id || '',
            room_number:  room.room_number || '',
            floor:        room.floor ?? '',
            status:       room.status || 'available',
            image_url:    room.image_url || '',
            notes:        room.notes || '',
        });
        setShowEditModal(true);
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            await adminService.updateRoom(editingRoom.id, editForm);
            message.success('Room updated!');
            setShowEditModal(false);
            setEditingRoom(null);
            fetchData();
        } catch {
            message.error('Failed to update room');
        }
    };

    const handleDelete = (room) => {
        modal.confirm({
            title: `Delete room "${room.room_number}"?`,
            content: 'This cannot be undone. Rooms with active bookings cannot be deleted.',
            okText: 'Delete', okType: 'danger', cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await adminService.deleteRoom(room.id);
                    message.success('Room deleted!');
                    fetchData();
                } catch (err) {
                    message.error(err.message || 'Delete failed');
                }
            },
        });
    };

    return (
        <div className="manage-rooms-page">
            <div className="rm-header">
                <h2>Manage Rooms</h2>
                <button className="rm-add-btn" onClick={() => { setAddForm(defaultAddForm); setShowAddModal(true); }}>
                    <FaPlus /> Add Room
                </button>
            </div>

            {loading ? <p className="rm-loading">Loading...</p> : (
                <div className="rm-table-wrap">
                    <table className="rm-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Room No.</th>
                                <th>Hotel</th>
                                <th>Room Type</th>
                                <th>Floor</th>
                                <th>Image</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.length === 0 ? (
                                <tr><td colSpan={8} className="rm-empty">No rooms found.</td></tr>
                            ) : rooms.map((room, i) => (
                                <tr key={room.id}>
                                    <td style={{ color: '#aaa', width: 40 }}>{i + 1}</td>
                                    <td className="rm-type-name">{room.room_number}</td>
                                    <td className="rm-hotel-name">{room.hotel?.name || '—'}</td>
                                    <td>{room.room_type?.type_name || '—'}</td>
                                    <td>{room.floor ?? '—'}</td>
                                    <td>
                                        {room.image_url
                                            ? <img src={room.image_url} alt="" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                                            : <span style={{ color: '#bbb', fontSize: 12 }}>None</span>
                                        }
                                    </td>
                                    <td>
                                        <span className="rm-badge" style={{
                                            background: STATUS_COLORS[room.status]?.bg,
                                            color: STATUS_COLORS[room.status]?.color,
                                        }}>
                                            {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <button className="rm-edit-btn" onClick={() => openEdit(room)} title="Edit"><FaEdit /></button>
                                            <button className="rm-edit-btn" onClick={() => handleDelete(room)} title="Delete" style={{ color: '#e74c3c' }}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Room Modal */}
            {showAddModal && (
                <div className="rm-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="rm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
                        <h3>Add Room</h3>
                        <form onSubmit={handleAdd}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="rm-field">
                                    <label>Hotel</label>
                                    <select required value={addForm.hotel_id} onChange={e => handleHotelChange(e.target.value)}>
                                        <option value="">Select hotel...</option>
                                        {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                    </select>
                                </div>
                                <div className="rm-field">
                                    <label>Room Type</label>
                                    <select required value={addForm.room_type_id} onChange={e => setAdd('room_type_id', e.target.value)} disabled={!addForm.hotel_id}>
                                        <option value="">Select room type...</option>
                                        {filteredRoomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.type_name}</option>)}
                                    </select>
                                </div>
                                <div className="rm-field">
                                    <label>Room Number</label>
                                    <input required placeholder="e.g. 101" value={addForm.room_number} onChange={e => setAdd('room_number', e.target.value)} />
                                </div>
                                <div className="rm-field">
                                    <label>Floor (optional)</label>
                                    <input type="number" min="0" placeholder="e.g. 2" value={addForm.floor} onChange={e => setAdd('floor', e.target.value)} />
                                </div>
                                <div className="rm-field">
                                    <label>Status</label>
                                    <select value={addForm.status} onChange={e => setAdd('status', e.target.value)}>
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div className="rm-field">
                                    <label>Room Image URL (optional)</label>
                                    <input placeholder="https://..." value={addForm.image_url} onChange={e => setAdd('image_url', e.target.value)} />
                                    {addForm.image_url && (
                                        <img src={addForm.image_url} alt="preview" style={{ marginTop: 8, width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }} onError={e => e.target.style.display = 'none'} />
                                    )}
                                </div>
                                <div className="rm-field">
                                    <label>Room Notes (optional)</label>
                                    <textarea rows={3} placeholder="e.g. Corner room with mountain view..." value={addForm.notes} onChange={e => setAdd('notes', e.target.value)} />
                                </div>
                            </div>
                            <div className="rm-modal-footer">
                                <button type="button" className="rm-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="rm-save">Add Room</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Room Modal */}
            {showEditModal && editingRoom && (
                <div className="rm-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="rm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                        <h3>Edit Room {editingRoom.room_number}</h3>
                        <form onSubmit={handleEdit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="rm-field">
                                    <label>Room Type</label>
                                    <select required value={editForm.room_type_id} onChange={e => setEdit('room_type_id', e.target.value)}>
                                        <option value="">Select room type...</option>
                                        {allRoomTypes.filter(rt => String(rt.hotel_id) === String(editingRoom.hotel_id)).map(rt => (
                                            <option key={rt.id} value={rt.id}>{rt.type_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="rm-field">
                                    <label>Room Number</label>
                                    <input required placeholder="e.g. 101" value={editForm.room_number} onChange={e => setEdit('room_number', e.target.value)} />
                                </div>
                                <div className="rm-field">
                                    <label>Floor (optional)</label>
                                    <input type="number" min="0" placeholder="e.g. 2" value={editForm.floor} onChange={e => setEdit('floor', e.target.value)} />
                                </div>
                                <div className="rm-field">
                                    <label>Status</label>
                                    <select value={editForm.status} onChange={e => setEdit('status', e.target.value)}>
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div className="rm-field">
                                    <label>Room Image URL (optional)</label>
                                    <input placeholder="https://..." value={editForm.image_url} onChange={e => setEdit('image_url', e.target.value)} />
                                    {editForm.image_url && (
                                        <img src={editForm.image_url} alt="preview" style={{ marginTop: 8, width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }} onError={e => e.target.style.display = 'none'} />
                                    )}
                                </div>
                                <div className="rm-field">
                                    <label>Room Notes (optional)</label>
                                    <textarea rows={3} placeholder="e.g. Corner room with mountain view..." value={editForm.notes} onChange={e => setEdit('notes', e.target.value)} />
                                </div>
                            </div>
                            <div className="rm-modal-footer">
                                <button type="button" className="rm-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" className="rm-save">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRooms;
