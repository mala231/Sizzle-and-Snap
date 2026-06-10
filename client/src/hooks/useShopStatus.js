import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function useShopStatus() {
  const [status, setStatus] = useState({
    isOpen: false,
    openTime: '10:00',
    closeTime: '16:00',
    loading: true,
    error: null
  });

  const checkStatus = async () => {
    try {
      const response = await api.get('/api/settings');
      const settings = response.data.data;

      if (!settings) {
        setStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      const { isOpenOverride, openTime, closeTime } = settings;

      let isOpen = false;

      // 1. Evaluate override if present
      if (isOpenOverride !== null && isOpenOverride !== undefined) {
        isOpen = isOpenOverride;
      } else {
        // 2. Evaluate scheduled hours against client local time
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;
        
        isOpen = currentTime >= openTime && currentTime <= closeTime;
      }

      setStatus({
        isOpen,
        openTime,
        closeTime,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Failed to fetch shop settings for status:', err);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to verify shop operating status.'
      }));
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Optional: Refresh status evaluation every 60 seconds
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return status;
}
