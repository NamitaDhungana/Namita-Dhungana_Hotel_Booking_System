import { createContext, useContext, useState, useCallback } from "react";

const BookingCartContext = createContext(null);

// Cart item: { roomTypeId, hotelId, roomTypeName, hotelName, basePrice, maxOccupancy, numGuests, quantity }
// quantity = how many physical rooms of this type to book

export function BookingCartProvider({ children }) {
    const [cart, setCart] = useState([]);

    // Returns { ok: true } or { ok: false, reason: string }
    const addRoom = useCallback((item) => {
        let result = { ok: false, reason: '' };
        setCart(prev => {
            // Different hotel check
            if (prev.length > 0 && prev[0].hotelId !== item.hotelId) {
                result = { ok: false, reason: 'different_hotel', hotelName: prev[0].hotelName };
                return prev;
            }
            const existing = prev.find(r => r.roomTypeId === item.roomTypeId);
            if (existing) {
                // Increment quantity instead of blocking
                result = { ok: true, incremented: true };
                return prev.map(r =>
                    r.roomTypeId === item.roomTypeId
                        ? { ...r, quantity: (r.quantity || 1) + 1 }
                        : r
                );
            }
            result = { ok: true };
            return [...prev, { ...item, numGuests: item.numGuests || 1, quantity: 1 }];
        });
        return result;
    }, []);

    const removeRoom = useCallback((roomTypeId) => {
        setCart(prev => prev.filter(r => r.roomTypeId !== roomTypeId));
    }, []);

    const updateGuests = useCallback((roomTypeId, numGuests) => {
        setCart(prev => prev.map(r => r.roomTypeId === roomTypeId ? { ...r, numGuests } : r));
    }, []);

    const updateQuantity = useCallback((roomTypeId, quantity) => {
        if (quantity < 1) {
            setCart(prev => prev.filter(r => r.roomTypeId !== roomTypeId));
        } else {
            setCart(prev => prev.map(r => r.roomTypeId === roomTypeId ? { ...r, quantity } : r));
        }
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    const isInCart = useCallback((roomTypeId) => cart.some(r => r.roomTypeId === roomTypeId), [cart]);

    // Expand cart into individual room entries for the API (one entry per physical room needed)
    const getExpandedRooms = useCallback(() => {
        return cart.flatMap(room =>
            Array.from({ length: room.quantity || 1 }, () => ({
                hotel_id: room.hotelId,
                room_type_id: room.roomTypeId,
                num_guests: room.numGuests,
                num_adults: room.numGuests,
                total_amount: 0, // filled in at submit time with nights * price
            }))
        );
    }, [cart]);

    return (
        <BookingCartContext.Provider value={{ cart, addRoom, removeRoom, updateGuests, updateQuantity, clearCart, isInCart, getExpandedRooms }}>
            {children}
        </BookingCartContext.Provider>
    );
}

export function useBookingCart() {
    const ctx = useContext(BookingCartContext);
    if (!ctx) throw new Error("useBookingCart must be used inside BookingCartProvider");
    return ctx;
}
