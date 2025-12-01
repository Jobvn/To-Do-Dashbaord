import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Status } from '../types';

interface StatusCellProps {
  currentStatusId: string;
  availableStatuses: Status[];
  onChange: (newStatusId: string) => void;
  onOpenSettings?: () => void;
}

const StatusCell: React.FC<StatusCellProps> = ({ currentStatusId, availableStatuses, onChange, onOpenSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Create a unique ID for this instance of the dropdown to prevent collisions
  const uniqueDropdownId = useRef(`status-dropdown-${Math.random().toString(36).substr(2, 9)}`).current;

  const currentConfig = availableStatuses.find(s => s.id === currentStatusId) || {
    label: 'Unknown',
    color: 'bg-gray-200',
    textColor: 'text-gray-700'
  };

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: 220, // Fixed width for the dropdown
      });
    }
  };

  const handleOpen = () => {
    updateCoords();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      const handleScroll = (e: Event) => {
          // IMPORTANT: Check if the scroll event comes from inside the dropdown
          // We use the ID to find the dropdown element in the portal
          const dropdown = document.getElementById(uniqueDropdownId);
          if (dropdown && dropdown.contains(e.target as Node)) {
              // This is a scroll inside the dropdown, do NOT close
              return;
          }
          // Otherwise, it's a scroll elsewhere (page scroll), close it
          setIsOpen(false);
      };

      const handleResize = () => setIsOpen(false);
      
      // Use 'true' for capture to detect scrolling on any parent container
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen, uniqueDropdownId]);

  // Click outside handler for the portal content
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (isOpen && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
            // We check if the click target is inside the dropdown in the portal
            const dropdown = document.getElementById(uniqueDropdownId);
            if (dropdown && !dropdown.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, uniqueDropdownId]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className={`w-full h-10 flex items-center justify-center font-medium text-sm transition-all duration-200 ${currentConfig.color} ${currentConfig.textColor} hover:brightness-95 rounded shadow-sm whitespace-nowrap px-2 overflow-hidden text-ellipsis`}
      >
        {currentConfig.label}
      </button>

      {isOpen && createPortal(
        <div 
            id={uniqueDropdownId}
            className="fixed z-[9999] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 flex flex-col"
            style={{ 
                top: coords.top, 
                left: coords.left,
                width: coords.width,
                maxHeight: '300px'
            }}
        >
            <div className="p-1 overflow-y-auto custom-scrollbar flex-1">
                {availableStatuses.map((s) => (
                    <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                        onChange(s.id);
                        setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors ${s.id === currentStatusId ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold' : 'text-gray-700 dark:text-gray-200'}`}
                    >
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${s.color}`}></div>
                        <span className="truncate">{s.label}</span>
                    </button>
                ))}
            </div>
            {onOpenSettings && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
                    <button 
                        type="button"
                        onClick={() => {
                        setIsOpen(false);
                        onOpenSettings();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex items-center gap-2 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.042 7.042 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        Bewerk statussen
                    </button>
                </div>
            )}
        </div>,
        document.body
      )}
    </>
  );
};

export default StatusCell;