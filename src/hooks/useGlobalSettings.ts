import { useQuery } from '@tanstack/react-query';
import { fetchSettings } from '../lib/api';
import { FAILSAFE_SETTINGS } from '../constants/failsafe';

export function useGlobalSettings() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings-global'],
    queryFn: () => fetchSettings('global'),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: FAILSAFE_SETTINGS
  });

  return { settings: settings ?? FAILSAFE_SETTINGS, isLoading };
}
