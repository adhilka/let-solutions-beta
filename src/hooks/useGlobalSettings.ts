import { useState, useEffect } from 'react';
import { fetchSettings } from '../lib/api';

export function useGlobalSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchSettings('global');
      if (data) {
        setSettings(data);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  return { settings, isLoading };
}
