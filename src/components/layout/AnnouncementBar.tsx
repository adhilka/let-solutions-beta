import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  
  // Note: in a real implementation this would fetch from settings/navbar
  const announcementText = "🎉 New Batches for Master Diploma in Chip-Level Engineering Starting Soon!";
  const hashKey = "announcement-new-batches-chip-level";

  useEffect(() => {
    if (localStorage.getItem(hashKey)) {
      setIsVisible(false);
    }
  }, [hashKey]);

  if (!isVisible) return null;

  return (
    <div className="bg-[var(--color-primary-600)] text-white text-xs font-medium py-2 px-4 relative">
      <div className="max-w-[var(--container-xl)] mx-auto flex items-center justify-center">
        <span className="text-center truncate pr-6">{announcementText}</span>
      </div>
      <button 
        onClick={() => {
          localStorage.setItem(hashKey, 'dismissed');
          setIsVisible(false);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-80 hover:opacity-100"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
