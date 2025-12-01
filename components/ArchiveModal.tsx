import React, { useEffect } from 'react';
import { Task } from '../types';

interface ArchiveModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onConfirm: () => void;
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({ isOpen, task, onClose, onConfirm }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden p-6 transform transition-all scale-100 transition-colors duration-200">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">Taak afronden?</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6 text-sm">
          Wil je <strong>"{task.title}"</strong> archiveren naar de "Klaar" map? Hij verdwijnt dan uit je actieve overzicht.
        </p>

        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Annuleren
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 dark:shadow-green-900/20"
          >
            Archiveren
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveModal;