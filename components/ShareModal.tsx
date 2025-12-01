import React, { useState, useEffect } from 'react';
import { Dashboard } from '../types';

interface ShareModalProps {
  dashboard: Dashboard;
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ dashboard, isOpen, onClose, onShare }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://taskflow.ai/share/${dashboard.id}-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    // Simulate the "shared" state becoming active after sharing
    onShare();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden transition-colors duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.75 3c1.995 0 3.529 1.548 4.25 2.505.721-.957 2.255-2.505 4.25-2.505 3.036 0 5.5 2.322 5.5 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
             </div>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Delen</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Nodig anderen uit voor <strong>"{dashboard.title}"</strong>.</p>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
             <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Deelbare Link</label>
             <div className="flex gap-2">
                <input 
                  readOnly
                  type="text" 
                  value={shareUrl}
                  className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 focus:outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                   {copied ? 'Gekopieerd!' : 'Kopieer'}
                </button>
             </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                 <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold">JIJ</div>
                 <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Jij (Eigenaar)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Volledige toegang</p>
                 </div>
             </div>
             {dashboard.shared && (
                 <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors animate-in slide-in-from-bottom-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 text-xs font-bold">G</div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Gast Gebruiker</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Kan bewerken</p>
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">Actief</span>
                 </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;