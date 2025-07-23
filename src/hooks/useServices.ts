import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  is_available: boolean;
  images?: string[];
  provider_id: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  provider?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
  };
  category?: {
    id: string;
    name: string;
    icon?: string;
  };
  reviews?: Array<{
    id: string;
    rating: number;
    comment?: string;
    customer: {
      full_name: string;
    };
  }>;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const servicesData: Service[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: any) => {
    try {
      await addDoc(collection(db, 'services'), serviceData);
      await fetchServices();
      return { error: null };
    } catch (error) {
      console.error('Error creating service:', error);
      return { error };
    }
  };

  const updateService = async (serviceId: string, updates: any) => {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      await updateDoc(serviceRef, updates);
      await fetchServices();
      return { error: null };
    } catch (error) {
      console.error('Error updating service:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return { services, loading, refetch: fetchServices, createService, updateService };
};

export const useServiceCategories = () => {
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    description?: string;
    icon?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const categoriesRef = collection(db, 'service_categories');
        const q = query(categoriesRef, orderBy('name'));
        const querySnapshot = await getDocs(q);
        setCategories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return { categories, loading };
};