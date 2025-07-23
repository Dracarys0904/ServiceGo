import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking_request' | 'booking_confirmed' | 'booking_completed' | 'new_review';
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('user_id', '==', profile.id),
      orderBy('created_at', 'desc')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsData: Notification[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.is_read).length);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [profile]);

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { is_read: true });
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!profile) return;
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('user_id', '==', profile.id),
        where('is_read', '==', false)
      );
      const querySnapshot = await getDocs(q);
      const batch = [];
      querySnapshot.forEach((docSnap) => {
        batch.push(updateDoc(doc(db, 'notifications', docSnap.id), { is_read: true }));
      });
      await Promise.all(batch);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    refetch: () => {}, // No-op, real-time
    markAsRead,
    markAllAsRead,
  };
};