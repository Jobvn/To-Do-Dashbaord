import React, { useState, useEffect } from 'react';
import { Status } from '../types';
import StatusCell from './StatusCell';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: { title: string; description?: string; status: string; deadline?: string }) => void;
  availableStatuses: Status[];
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onSave, availableStatuses }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState(availableStatuses[0]?.id || '');
  const [deadline, setDeadline] = useState('');

  // ESC Key Handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      description: description.trim() || undefined,
      status: statusId,
      deadline: deadline || undefined,
    });
    
    // Reset and close
    setTitle('');
    setDescription('');
    setStatusId(availableStatuses[0]?.id || '');
    setDeadline('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
           <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nieuwe Taak Maken</h3>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto">
           {/* Title */}
           <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Titel</label>
              <input 
                 autoFocus
                 type="text" 
                 required
                 placeholder="Wat moet er gebeuren?"
                 className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base"
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
              />
           </div>

           {/* Status & Deadline Row */}
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                 <StatusCell 
                    currentStatusId={statusId}
                    availableStatuses={availableStatuses}
                    onChange={setStatusId}
                 />
              </div>
              <div>
                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Deadline (Optioneel)</label>
                 <input 
                    type="date"
                    className="w-full px-3 py-2 h-10 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                 />
              </div>
           </div>

           {/* Description */}
           <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Beschrijving</label>
              <textarea 
                 rows={4}
                 placeholder="Voeg details toe..."
                 className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
              />
           </div>

           <div className="pt-2 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
              >
                Annuleren
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md shadow-blue-200 dark:shadow-blue-900/30 transition-all active:scale-95"
              >
                Taak Aanmaken
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;