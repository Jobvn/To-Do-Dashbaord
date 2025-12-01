import React, { useState, useRef } from 'react';
import { Task, Status } from '../types';
import StatusCell from './StatusCell';
import { suggestSubtasks } from '../services/geminiService';

interface TaskRowProps {
  task: Task;
  availableStatuses: Status[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onNotifyClick: (task: Task) => void;
  onOpenStatusSettings: () => void;
  
  // Drag props
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ 
  task, 
  availableStatuses,
  onUpdate, 
  onDelete, 
  onNotifyClick,
  onOpenStatusSettings,
  draggable,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  
  const handleBlur = () => {
    // Small timeout to allow interactions with other inputs in the same row
    setTimeout(() => {
        // Only save if we are not focused on either input anymore
        const active = document.activeElement;
        const rowInputs = document.getElementById(`task-row-inputs-${task.id}`);
        if (rowInputs && !rowInputs.contains(active)) {
             setIsEditing(false);
             if (title.trim() !== task.title || description.trim() !== (task.description || '')) {
                onUpdate(task.id, { title, description });
             }
        }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Manually trigger blur logic
      setIsEditing(false);
      onUpdate(task.id, { title, description });
    }
  };

  const handleExpand = async () => {
      if (showSubtasks) {
          setShowSubtasks(false);
          return;
      }
      setIsProcessing(true);
      const suggestions = await suggestSubtasks(task.title);
      setSubtasks(suggestions);
      setShowSubtasks(true);
      setIsProcessing(false);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(task.id, { deadline: e.target.value });
  };

  // Date Logic
  const todayStr = new Date().toISOString().split('T')[0];
  const isDeadlineToday = task.deadline === todayStr;
  const isDeadlinePast = task.deadline && task.deadline < todayStr;
  const isDeadlineUrgent = (isDeadlineToday || isDeadlinePast) && task.status !== 'Klaar';

  const completedDate = task.completedAt ? new Date(task.completedAt) : null;

  return (
    <div 
      className={`group border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
          isDeadlineUrgent 
          ? '!bg-red-100 dark:!bg-red-900/20 border-l-4 border-l-red-500' 
          : 'bg-white dark:bg-gray-900'
      }`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex items-center py-3 pr-4 min-h-[4rem]">
        {/* Animated Drag Handle Container - Reveals on Hover */}
        <div className="w-0 group-hover:w-8 overflow-hidden transition-all duration-300 ease-out flex-shrink-0 flex items-center justify-center text-gray-300 dark:text-gray-600 cursor-move">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM10 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM11.5 15.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
            </svg>
        </div>

        {/* Status Cell - Added padding left so it doesn't touch the box edge */}
        <div className="w-40 flex-shrink-0 flex items-center pl-4 transition-all duration-300">
          <StatusCell 
             currentStatusId={task.status} 
             availableStatuses={availableStatuses}
             onChange={(sId) => onUpdate(task.id, { status: sId })} 
             onOpenSettings={onOpenStatusSettings}
          />
        </div>

        {/* Title & Description Section */}
        <div className="flex-1 min-w-0 flex flex-col justify-center pl-4" id={`task-row-inputs-${task.id}`}>
          {isEditing ? (
            <div className="flex flex-col gap-1">
                <input
                    autoFocus
                    type="text"
                    className="w-full px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-medium"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                />
                <textarea
                    rows={2}
                    placeholder="Voeg een beschrijving toe..."
                    className="w-full px-2 py-1 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-xs resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleBlur}
                />
            </div>
          ) : (
            <div className="flex flex-col cursor-text h-full justify-center" onClick={() => setIsEditing(true)}>
              {/* Title size is consistent now (text-base or text-lg), regardless of description */}
              <div className="flex items-center gap-2">
                <span className={`truncate font-medium transition-all text-base py-0.5 ${
                    task.status === 'Klaar' 
                      ? 'text-gray-400 dark:text-gray-500 line-through' 
                      : (isDeadlineUrgent ? 'text-red-900 dark:text-red-300 font-bold' : 'text-gray-800 dark:text-gray-200')
                }`}>
                    {task.title}
                </span>
                
                {/* Deadline Display Inline */}
                {task.deadline && task.status !== 'Klaar' && (
                    <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border ${
                        isDeadlineUrgent 
                        ? 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800 font-bold' 
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4h.25V2.75A.75.75 0 015.75 2zm-3.5 4.5a1.25 1.25 0 011.25-1.25h13a1.25 1.25 0 011.25 1.25V8h-15.5V6.5zm0 3.75V15.25c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V10.25H2.25z" clipRule="evenodd" />
                        </svg>
                        <span>
                            {new Date(task.deadline).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                            {isDeadlineUrgent && isDeadlineToday && " (Vandaag!)"}
                            {isDeadlineUrgent && isDeadlinePast && !isDeadlineToday && " (Te laat!)"}
                        </span>
                    </div>
                )}
              </div>

              {/* Description and Completion Date */}
              <div className="flex items-center gap-2 mt-0.5">
                  {task.status === 'Klaar' && completedDate && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                          Afgerond: {completedDate.toLocaleDateString('nl-NL')} {completedDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                  )}
                  
                  {task.description ? (
                      <span className={`text-xs line-clamp-1 ${task.status === 'Klaar' ? 'text-gray-300 dark:text-gray-600' : (isDeadlineUrgent ? 'text-red-700 dark:text-red-300' : 'text-gray-500 dark:text-gray-400')}`}>
                          {task.description}
                      </span>
                  ) : (
                      task.status !== 'Klaar' && (
                          <span className="text-xs text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              Klik om beschrijving toe te voegen
                          </span>
                      )
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           {/* Date Picker Button */}
           <div className="relative w-9 h-9">
                <button 
                    type="button"
                    title="Deadline instellen"
                    className={`absolute inset-0 w-full h-full flex items-center justify-center rounded-full transition-colors ${task.deadline ? (isDeadlineUrgent ? 'text-red-600 bg-red-200 dark:bg-red-900/50' : 'text-blue-500 bg-blue-50 dark:bg-blue-900/30') : 'text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                    </svg>
                </button>
                <input 
                    type="date" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleDateChange}
                    onClick={(e) => e.stopPropagation()}
                    value={task.deadline || ''}
                />
           </div>

           <button 
              type="button"
              onClick={handleExpand}
              disabled={isProcessing}
              title="Get AI Help"
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
          >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
          </button>
          <button 
              type="button"
              onClick={() => onNotifyClick(task)}
              title="Herinnering instellen"
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
          </button>
          <button 
              type="button"
              onClick={() => onDelete(task.id)}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
          </button>
        </div>
      </div>
      
      {/* Subtasks drawer */}
      {showSubtasks && (
          <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 pl-16 pr-4 py-4 animate-in slide-in-from-top-2">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="text-purple-600 dark:text-purple-400">AI Suggesties</span>
                  voor "{task.title}"
              </h4>
              <div className="space-y-2">
                  {subtasks.length > 0 ? subtasks.map((st, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                          {st}
                      </div>
                  )) : (
                      <div className="text-sm text-gray-400 italic">Bezig met genereren...</div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default TaskRow;