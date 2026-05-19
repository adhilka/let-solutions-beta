import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useGlobalSettings } from '../../hooks/useGlobalSettings';

export default function AnnouncementBar() {
  const [isDismissed, setIsDismissed] = useState(false);
  const { settings, isLoading } = useGlobalSettings();
  
  const announcementEnabled = settings?.announcement?.enabled ?? true;
  const announcementText = settings?.announcement?.text || "🎉 New Batches for Master Diploma in Chip-Level Engineering Starting Soon!";
  const hashKey = `announcement-${btoa(encodeURIComponent(announcementText)).slice(0, 15)}`;

  useEffect(() => {
    if (localStorage.getItem(hashKey)) {
      setIsDismissed(true);
    }
  }, [hashKey]);

  if (isLoading || !announcementEnabled || isDismissed) return null;

  return (
    <div className="bg-[var(--color-primary-600)] text-white text-xs font-medium py-2 relative flex items-center overflow-hidden h-9">
      <div className="relative w-full overflow-hidden whitespace-nowrap flex">
        <div className="animate-marquee inline-flex whitespace-nowrap">
          <span className="px-10">{announcementText}</span>
          <span className="px-10">{announcementText}</span>
          <span className="px-10">{announcementText}</span>
          <span className="px-10">{announcementText}</span>
        </div>
      </div>
      <button 
        onClick={() => {
          localStorage.setItem(hashKey, 'dismissed');
          setIsDismissed(true);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-[var(--color-primary-600)] text-white opacity-80 hover:opacity-100 z-10 rounded-full"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
