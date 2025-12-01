import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface NotificationModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ task, isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('taskflow_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setShowOptions(true);
    }
  }, [isOpen]);

  // ESC Key Handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      localStorage.setItem('taskflow_email', email);
      setShowOptions(true);
    }
  };

  const handleSendEmail = () => {
      // Create mailto link
      const subject = encodeURIComponent(`Herinnering: ${task.title}`);
      const body = encodeURIComponent(`
Hoi!

Hier is een herinnering voor je taak:

Titel: ${task.title}
Status: ${task.status}
Beschrijving: ${task.description || 'Geen beschrijving'}

Succes met je taken!
TaskFlow AI
      `);
      
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      
      setMessage("Email client geopend! Controleer je concepten als het niet direct verstuurd is.");
      setTimeout(() => onClose(), 3000);
  };

  const scheduleBrowserNotification = (delayMs: number) => {
      if (!("Notification" in window)) {
          setMessage("Deze browser ondersteunt geen notificaties.");
          return;
      }

      Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
              setMessage("Notificatie ingepland!");
              setTimeout(() => {
                  new Notification("TaskFlow Herinnering", {
                      body: `Vergeet niet: ${task.title}`,
                      icon: '/favicon.ico' // fallback
                  });
              }, delayMs);
              setTimeout(() => onClose(), 2000);
          } else {
              setMessage("Notificatie permissie geweigerd.");
          }
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden transition-colors duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
               </svg>
             </div>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Herinnering instellen</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Voor: "{task.title}"</p>

          {message ? (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-lg flex items-center gap-3">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
               </svg>
               <span className="text-sm">{message}</span>
            </div>
          ) : !showOptions ? (
             <form onSubmit={handleEmailSubmit}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Wat is je e-mailadres?</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="jouw@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Verder
                </button>
             </form>
          ) : (
            <div>
               <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Kies hoe je een notificatie wilt ontvangen:</p>
               <div className="space-y-3">
                  <button onClick={handleSendEmail} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group">
                     <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                            <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                        </svg>
                     </div>
                     <div className="flex-1">
                         <span className="block font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">Verstuur Email</span>
                         <span className="text-xs text-gray-500 dark:text-gray-400">Naar {email}</span>
                     </div>
                  </button>
                  
                  <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Browser Notificatie</p>
                    <button onClick={() => scheduleBrowserNotification(100)} className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-700 dark:text-gray-300">
                         <span>Nu direct (Test)</span>
                    </button>
                    <button onClick={() => scheduleBrowserNotification(3600000)} className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-700 dark:text-gray-300">
                         <span>Over 1 uur</span>
                    </button>
                  </div>

                  <button onClick={() => setShowOptions(false)} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-2">
                     Wijzig e-mailadres
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;