import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Booking {
  id: string;
  customer_id: string;
  service_id: string;
  provider_id: string;
  booking_date: string;
  booking_time: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  updated_at: string;
  service: {
    id: string;
    title: string;
    price: number;
    location: string;
  };
  customer: {
    id: string;
    full_name: string;
    phone?: string;
  };
  provider: {
    id: string;
    full_name: string;
    phone?: string;
  };
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchBookings = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('participants', 'array-contains', profile.id),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const bookingsData: Booking[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchBookings();
    }
  }, [profile]);

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status });
      await fetchBookings();
      return { error: null };
    } catch (error) {
      console.error('Error updating booking status:', error);
      return { error };
    }
  };

  return { bookings, loading, refetch: fetchBookings, updateBookingStatus };
};