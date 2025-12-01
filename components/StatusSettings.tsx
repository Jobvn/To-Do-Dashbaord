import React, { useState, useEffect } from 'react';
import { Status } from '../types';
import { COLOR_THEMES } from '../constants';

interface StatusSettingsProps {
  statuses: Status[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (statuses: Status[]) => void;
}

const StatusSettings: React.FC<StatusSettingsProps> = ({ statuses, isOpen, onClose, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColorTheme, setEditColorTheme] = useState(COLOR_THEMES[0]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (editingId) {
      // Update existing
      const updated = statuses.map(s => 
        s.id === editingId 
        ? { ...s, label: editLabel, color: editColorTheme.bg, textColor: editColorTheme.text } 
        : s
      );
      onUpdate(updated);
      setEditingId(null);
    } else {
      // Add new - ensure ID is valid
      const cleanLabel = editLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      const newId = `${cleanLabel}_${Date.now()}`;
      
      const newStatus: Status = {
        id: newId,
        label: editLabel,
        color: editColorTheme.bg,
        textColor: editColorTheme.text
      };
      onUpdate([...statuses, newStatus]);
    }
    setEditLabel('');
    setEditColorTheme(COLOR_THEMES[0]);
  };

  const handleEdit = (status: Status) => {
    setEditingId(status.id);
    setEditLabel(status.label);
    const theme = COLOR_THEMES.find(t => t.bg === status.color) || COLOR_THEMES[0];
    setEditColorTheme(theme);
  };

  const handleDelete = (id: string) => {
    if (confirm('Weet je zeker dat je deze status wilt verwijderen?')) {
      const newStatuses = statuses.filter(s => s.id !== id);
      onUpdate(newStatuses);
      // If we were editing the deleted one, cancel edit
      if (editingId === id) {
          setEditingId(null);
          setEditLabel('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] transition-colors duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
           <h3 className="text-xl font-bold text-gray-900 dark:text-white">Statussen Beheren</h3>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* List */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Huidige Statussen</h4>
                    <div className="space-y-2">
                        {statuses.map(status => (
                            <div key={status.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                <div className={`px-3 py-1 rounded text-sm font-medium ${status.color} ${status.textColor}`}>
                                    {status.label}
                                </div>
                                <div className="flex gap-1">
                                    <button 
                                        type="button"
                                        onClick={() => handleEdit(status)} 
                                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                        title="Bewerken"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                        </svg>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleDelete(status.id)} 
                                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                        title="Verwijderen"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editor */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-fit">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                        {editingId ? 'Status Bewerken' : 'Nieuwe Status Toevoegen'}
                    </h4>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Naam</label>
                            <input 
                                type="text" 
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                                placeholder="Bijv. Wachten op klant"
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kleur</label>
                            <div className="grid grid-cols-5 gap-2">
                                {COLOR_THEMES.map((theme) => (
                                    <button
                                        type="button"
                                        key={theme.name}
                                        onClick={() => setEditColorTheme(theme)}
                                        className={`w-full h-8 rounded-full border-2 transition-all ${theme.bg} ${editColorTheme.name === theme.name ? 'border-gray-900 dark:border-white scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                        title={theme.name}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-2">
                            <button 
                                type="button"
                                onClick={handleSave} 
                                disabled={!editLabel.trim()}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                {editingId ? 'Opslaan' : 'Toevoegen'}
                            </button>
                            {editingId && (
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setEditingId(null);
                                        setEditLabel('');
                                        setEditColorTheme(COLOR_THEMES[0]);
                                    }}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
                                >
                                    Annuleren
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StatusSettings;