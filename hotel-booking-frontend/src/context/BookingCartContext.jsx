import { createContext, useContext, useState, useCallback } from "react";

const BookingCartContext = createContext(null);

export function BookingCartProvider({ children }) {
    const [cart, setCart] = useState([]); // [{ roomTypeId, hotelId, roomTypeName, hotelName, basePrice, maxOccupancy, numGuests }]

    // Returns { ok: true } or { ok: false, reason: string }
    const addRoom = useCallback((item) => {
        let result = { ok: false, reason: '' };
        setCart(prev => {
            if (prev.find(r => r.roomTypeId === item.roomTypeId)) {
                result = { ok: false, reason: 'already_added' };
                return prev;
            }
            if (prev.length > 0 && prev[0].hotelId !== item.hotelId) {
                result = { ok: false, reason: 'different_hotel', hotelName: prev[0].hotelName };
                return prev;
            }
            result = { ok: true };
            return [...prev, { ...item, numGuests: item.numGuests || 1 }];
        });
        return result;
    }, []);

    const removeRoom = useCallback((roomTypeId) => {
        setCart(prev => prev.filter(r => r.roomTypeId !== roomTypeId));
    }, []);

    const updateGuests = useCallback((roomTypeId, numGuests) => {
        setCart(prev => prev.map(r => r.roomTypeId === roomTypeId ? { ...r, numGuests } : r));
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    const isInCart = useCallback((roomTypeId) => cart.some(r => r.roomTypeId === roomTypeId), [cart]);

    return (
        <BookingCartContext.Provider value={{ cart, addRoom, removeRoom, updateGuests, clearCart, isInCart }}>
            {children}
        </BookingCartContext.Provider>
    );
}

export function useBookingCart() {
    const ctx = useContext(BookingCartContext);
    if (!ctx) throw new Error("useBookingCart must be used inside BookingCartProvider");
    return ctx;
}
