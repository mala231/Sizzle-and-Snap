import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const fetchOrders = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    }
    try {
      const res = await api.get('/api/orders');
      if (isMounted.current) {
        setOrders(res.data.data || []);
        setError(null);
      }
    } catch (err) {
      console.error('Error in useOrders:', err);
      if (isMounted.current) {
        setError(err.response?.data?.message || 'Failed to fetch orders.');
      }
    } finally {
      if (isInitial && isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    
    // Initial fetch
    fetchOrders(true);

    // Setup 5s polling interval
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 5000);

    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchOrders]);

  const refetch = useCallback(() => {
    return fetchOrders(false);
  }, [fetchOrders]);

  return { orders, loading, error, refetch };
}
