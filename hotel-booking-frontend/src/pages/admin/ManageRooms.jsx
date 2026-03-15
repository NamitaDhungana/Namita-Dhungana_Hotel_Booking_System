import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaCheckCircle, FaTimesCircle, FaSearch } from 'react-icons/fa';
import adminService from '../../services/adminService';
import hotelService from '../../services/hotelService';
import './ManageHotels.css'; // Reusing table and modal styles

const ManageRooms = () => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        hotel_id: '',
        type_name: '',
        base_price: '',
        max_occupancy: '',
        description: '',
        amenities: '',
        image: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [roomsData, hotelsData] = await Promise.all([
                hotelService.getAllRoomTypes(),
                hotelService.getHotels()
            ]);
            console.log("Hotels loaded:", hotelsData);
            console.log("Rooms loaded:", roomsData);
            setRoomTypes(Array.isArray(roomsData) ? roomsData : []);
            setHotels(Array.isArray(hotelsData) ? hotelsData : []);
        } catch (error) {
            console.error("Failed to fetch room data:", error);
            alert("Failed to load data: " + JSON.stringify(error));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRoom) {
                await adminService.updateRoomType(editingRoom.id, formData);
                alert("Room type updated!");
            } else {
                await adminService.createRoomType(formData);
                alert("Room type created!");
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert("Action failed: " + (error.message || "Unknown error"));
        }
    };

    const openEdit = (room) => {
        setEditingRoom(room);
        setFormData({
            hotel_id: room.hotel_id,
            type_name: room.type_name,
            base_price: room.base_price,
            max_occupancy: room.max_occupancy,
            description: room.description,
            amenities: room.amenities,
            image: room.image
        });
        setShowModal(true);
    };

    return (
        <div className="manage-rooms">
            <div className="page-actions">
                <h2>Manage Room Types</h2>
                <button className="add-btn" onClick={() => { setShowModal(true); setEditingRoom(null); }}>
                    <FaPlus /> Add Room Type
                </button>
            </div>

            <div className="hotels-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Hotel Name</th>
                            <th>Room Type</th>
                            <th>Base Price</th>
                            <th>Max Occupancy</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roomTypes.map(room => (
                            <tr key={room.id}>
                                <td style={{ fontWeight: 600, color: '#6C5CE7' }}>{room.hotel?.name || 'N/A'}</td>
                                <td>{room.type_name}</td>
                                <td style={{ fontWeight: 700, color: '#F5C518' }}>Rs. {room.base_price}</td>
                                <td>
                                    <span style={{ background: '#f8f9fc', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
                                        {room.max_occupancy} Persons
                                    </span>
                                </td>
                                <td className="actions">
                                    <button className="edit-icon" title="Edit" onClick={() => openEdit(room)}><FaEdit /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="admin-modal">
                        <h2>{editingRoom ? 'Edit Room Type' : 'Add Room Type'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Select Hotel</label>
                                <select
                                    required
                                    value={formData.hotel_id}
                                    onChange={(e) => setFormData({ ...formData, hotel_id: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                                >
                                    <option value="">Choose a hotel...</option>
                                    {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Room Type Name</label>
                                <input
                                    type="text" required
                                    value={formData.type_name}
                                    onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div className="form-group">
                                    <label>Price / Night</label>
                                    <input
                                        type="number" required
                                        value={formData.base_price}
                                        onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Capacity</label>
                                    <input
                                        type="number" required
                                        value={formData.max_occupancy}
                                        onChange={(e) => setFormData({ ...formData, max_occupancy: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="save-btn">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                .manage-rooms {
                    background: #fff;
                    padding: 30px;
                    border-radius: 16px;
                    box-shadow: 0 0.15rem 1.75rem 0 rgba(108, 92, 231, 0.1);
                }
                .page-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                }
                .page-actions h2 {
                    color: #2D1B69;
                    margin: 0;
                    font-weight: 700;
                }
                .add-btn {
                    background: linear-gradient(135deg, #6C5CE7, #5A4BD1);
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .save-btn {
                    background: linear-gradient(135deg, #6C5CE7, #5A4BD1);
                    border: none;
                    color: white;
                    padding: 10px 25px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .save-btn:hover {
                    box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
                }
                .cancel-btn {
                    background: #eaecf4;
                    border: none;
                    color: #858796;
                    padding: 10px 25px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .edit-icon {
                    color: #6C5CE7;
                    font-size: 18px;
                    transition: transform 0.2s;
                }
                .edit-icon:hover {
                    transform: scale(1.2);
                }
            `}</style>
        </div>
    );
};

export default ManageRooms;
