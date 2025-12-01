import React, { useState, useEffect, useRef } from 'react';
import { Task, FilterType, Status, Dashboard } from './types';
import { DEFAULT_STATUSES, INITIAL_TASKS } from './constants';
import TaskRow from './components/TaskRow';
import StatusCell from './components/StatusCell';
import NotificationModal from './components/NotificationModal';
import StatusSettings from './components/StatusSettings';
import ShareModal from './components/ShareModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import NewTaskModal from './components/NewTaskModal';
import ArchiveModal from './components/ArchiveModal';
import SettingsMenu from './components/SettingsMenu';

const DEFAULT_DASHBOARD: Dashboard = { id: 'default', title: 'Mijn Dashboard' };

const App: React.FC = () => {
  // --- STATE ---
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('taskflow_theme');
        if (saved) return saved === 'dark';
        // Default to light mode (false) even if system prefers dark
        return false; 
      }
      return false;
    } catch {
      return false;
    }
  });

  const [dashboards, setDashboards] = useState<Dashboard[]>(() => {
    try {
      const saved = localStorage.getItem('taskflow_dashboards');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.length > 0 ? parsed : [DEFAULT_DASHBOARD];
    } catch (e) {
      return [DEFAULT_DASHBOARD];
    }
  });

  const [activeDashboardId, setActiveDashboardId] = useState<string>(() => {
    return localStorage.getItem('taskflow_active_dashboard') || DEFAULT_DASHBOARD.id;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('taskflow_tasks');
      let loadedTasks = saved ? JSON.parse(saved) : INITIAL_TASKS;
      
      // Migration: Assign dashboardId if missing
      if (loadedTasks.length > 0 && !loadedTasks[0].dashboardId) {
         loadedTasks = loadedTasks.map((t: any) => ({ ...t, dashboardId: 'default' }));
      }
      return loadedTasks;
    } catch (e) {
      return INITIAL_TASKS;
    }
  });

  const [statuses, setStatuses] = useState<Status[]>(() => {
    try {
        const saved = localStorage.getItem('taskflow_statuses');
        return saved ? JSON.parse(saved) : DEFAULT_STATUSES;
    } catch (e) {
        return DEFAULT_STATUSES;
    }
  });

  const [filter, setFilter] = useState<FilterType>('ALL');
  
  // Quick Add State (Bottom/Main Area)
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskStatusId, setQuickTaskStatusId] = useState<string>(statuses[0]?.id || '');
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modal states
  const [notificationTask, setNotificationTask] = useState<Task | null>(null);
  const [isStatusSettingsOpen, setIsStatusSettingsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [deleteDashboardId, setDeleteDashboardId] = useState<string | null>(null);
  const [archiveTask, setArchiveTask] = useState<{task: Task, newStatusId: string} | null>(null);
  
  // UI states for interactions
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Drag and drop state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // --- EFFECTS ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('taskflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taskflow_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskflow_statuses', JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem('taskflow_dashboards', JSON.stringify(dashboards));
  }, [dashboards]);

  useEffect(() => {
    localStorage.setItem('taskflow_active_dashboard', activeDashboardId);
  }, [activeDashboardId]);

  // Ensure new task status is valid if statuses change
  useEffect(() => {
      if (statuses.length > 0 && !statuses.find(s => s.id === quickTaskStatusId)) {
          setQuickTaskStatusId(statuses[0].id);
      }
  }, [statuses, quickTaskStatusId]);

  // Close mobile menu when dashboard changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeDashboardId]);

  // --- ACTIONS ---
  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  // Full Add (from Modal)
  const handleSaveNewTask = (taskData: { title: string; description?: string; status: string; deadline?: string }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      dashboardId: activeDashboardId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      deadline: taskData.deadline,
      lastUpdated: Date.now()
    };
    
    // If status is 'Klaar' immediately, handle archive logic conceptually, or just set it. 
    // For simplicity, if created as 'Klaar', we treat it as done.
    if (taskData.status === 'Klaar') {
        newTask.completedAt = Date.now();
    }

    setTasks([newTask, ...tasks]);
  };

  // Quick Add (from bar)
  const quickAddTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const titleToUse = quickTaskTitle.trim() || "Nieuwe Taak";
    const statusToUse = quickTaskStatusId || statuses[0]?.id || 'unknown';

    const newTask: Task = {
      id: Date.now().toString(),
      dashboardId: activeDashboardId,
      title: titleToUse,
      status: statusToUse,
      lastUpdated: Date.now()
    };
    
    if (statusToUse === 'Klaar') {
        newTask.completedAt = Date.now();
    }

    setTasks([newTask, ...tasks]);
    setQuickTaskTitle('');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    // Intercept status change to 'Klaar'
    if (updates.status === 'Klaar') {
        const task = tasks.find(t => t.id === id);
        if (task && task.status !== 'Klaar') {
            setArchiveTask({ task, newStatusId: 'Klaar' });
            return;
        }
    }
    
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates, lastUpdated: Date.now() } : t));
  };

  const confirmArchive = () => {
      if (archiveTask) {
          setTasks(tasks.map(t => t.id === archiveTask.task.id ? { 
              ...t, 
              status: 'Klaar', 
              completedAt: Date.now(),
              lastUpdated: Date.now() 
          } : t));
          setArchiveTask(null);
      }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const createDashboard = () => {
    const newId = Date.now().toString();
    const newDashboard = { id: newId, title: 'Nieuw Dashboard' };
    setDashboards([...dashboards, newDashboard]);
    setActiveDashboardId(newId);
  };

  const updateDashboardTitle = (newTitle: string) => {
    setDashboards(dashboards.map(d => d.id === activeDashboardId ? { ...d, title: newTitle } : d));
  };

  const toggleDashboardShare = () => {
    setDashboards(dashboards.map(d => 
        d.id === activeDashboardId ? { ...d, shared: true } : d
    ));
  };

  const initiateDeleteDashboard = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (dashboards.length <= 1) {
        alert("Je kunt het laatste dashboard niet verwijderen.");
        return;
    }
    setDeleteDashboardId(id);
  };

  const confirmDeleteDashboard = () => {
    if (!deleteDashboardId) return;

    const newDashboards = dashboards.filter(d => d.id !== deleteDashboardId);
    const newTasks = tasks.filter(t => t.dashboardId !== deleteDashboardId);
    
    if (deleteDashboardId === activeDashboardId) {
        setActiveDashboardId(newDashboards[0].id);
    }
    
    setDashboards(newDashboards);
    setTasks(newTasks);
    setDeleteDashboardId(null);
  };

  // --- DRAG AND DROP ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
      dragItem.current = index;
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
      dragOverItem.current = index;
  };

  const handleDrop = (e: React.DragEvent) => {
      if (dragItem.current === null || dragOverItem.current === null) return;
      if (dragItem.current === dragOverItem.current) return;
      
      const visibleTasks = filteredTasks;
      
      const copyVisible = [...visibleTasks];
      const draggedItemContent = copyVisible[dragItem.current];
      copyVisible.splice(dragItem.current, 1);
      copyVisible.splice(dragOverItem.current, 0, draggedItemContent);
      
      const otherDashboardTasks = tasks.filter(t => t.dashboardId !== activeDashboardId);
      const currentDashTasks = tasks.filter(t => t.dashboardId === activeDashboardId);
      const hiddenTasks = currentDashTasks.filter(t => !visibleTasks.find(vt => vt.id === t.id));
      
      setTasks([...copyVisible, ...hiddenTasks, ...otherDashboardTasks]);
      
      dragItem.current = null;
      dragOverItem.current = null;
  };

  // --- COMPUTED ---
  const activeDashboard = dashboards.find(d => d.id === activeDashboardId) || dashboards[0] || DEFAULT_DASHBOARD;
  
  const dashboardTasks = tasks.filter(t => t.dashboardId === activeDashboardId);
  const filteredTasks = dashboardTasks.filter(t => {
    // Search Filter
    if (searchQuery) {
        const matches = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (!matches) return false;
    }

    if (filter === 'ALL') {
        // Show everything EXCEPT 'Klaar'
        return t.status !== 'Klaar';
    }
    if (filter === 'Klaar') {
        return t.status === 'Klaar';
    }
    return t.status === filter;
  });

  // Sort if viewing 'Klaar'
  if (filter === 'Klaar') {
      filteredTasks.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  }

  const counts = dashboardTasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Exclude 'Klaar' from ALL count
  const allCount = dashboardTasks.filter(t => t.status !== 'Klaar').length;

  const activeStatusLabel = filter === 'ALL' ? activeDashboard.title : (statuses.find(s => s.id === filter)?.label || 'Onbekende Status');

  const todayStr = new Date().toISOString().split('T')[0];
  const urgentDashboardIds = new Set(
      tasks
        .filter(t => t.status !== 'Klaar' && t.deadline && t.deadline <= todayStr)
        .map(t => t.dashboardId)
  );
  
  // Separation of Statuses for Sidebar
  const activeStatuses = statuses.filter(s => s.id !== 'Klaar');
  const doneStatus = statuses.find(s => s.id === 'Klaar');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      
      <NotificationModal 
        isOpen={!!notificationTask}
        task={notificationTask}
        onClose={() => setNotificationTask(null)}
      />

      <NewTaskModal 
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSave={handleSaveNewTask}
        availableStatuses={statuses}
      />

      <StatusSettings
        isOpen={isStatusSettingsOpen}
        statuses={statuses}
        onClose={() => setIsStatusSettingsOpen(false)}
        onUpdate={setStatuses}
      />

      <ShareModal 
        isOpen={isShareModalOpen}
        dashboard={activeDashboard}
        onClose={() => setIsShareModalOpen(false)}
        onShare={toggleDashboardShare}
      />

      <DeleteConfirmationModal 
        isOpen={!!deleteDashboardId}
        dashboardTitle={dashboards.find(d => d.id === deleteDashboardId)?.title || ''}
        onClose={() => setDeleteDashboardId(null)}
        onConfirm={confirmDeleteDashboard}
      />
      
      <ArchiveModal 
        isOpen={!!archiveTask}
        task={archiveTask?.task || null}
        onClose={() => setArchiveTask(null)}
        onConfirm={confirmArchive}
      />

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
           <button 
             onClick={() => {
                 setIsNewTaskModalOpen(true);
                 setIsMobileMenuOpen(false);
             }} 
             className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-900/20 transition-all active:scale-95 font-medium"
           >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Nieuwe Taak
           </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar pb-6 flex flex-col">
           <button
             onClick={() => setFilter('ALL')}
             className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${filter === 'ALL' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
           >
             <span>Alle Taken</span>
             <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs font-medium">{allCount}</span>
           </button>
           
           <div className="pt-4 pb-2 px-4">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</span>
           </div>
           
           {/* Active Statuses */}
           {activeStatuses.map(status => (
             <button
                key={status.id}
                onClick={() => setFilter(status.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center justify-between transition-colors ${filter === status.id ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
             >
               <div className="flex items-center gap-3">
                 <div className={`w-2.5 h-2.5 rounded-full ${status.color}`}></div>
                 <span className="truncate max-w-[120px]">{status.label}</span>
               </div>
               {counts[status.id] > 0 && (
                   <span className="text-gray-400 dark:text-gray-500 text-xs">{counts[status.id]}</span>
               )}
             </button>
           ))}

           <div className="flex-1"></div>
           
           {/* Done/Klaar Status at bottom */}
           {doneStatus && (
               <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setFilter(doneStatus.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center justify-between transition-colors ${filter === doneStatus.id ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                    >
                    <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${doneStatus.color}`}></div>
                        <span className="truncate max-w-[120px]">{doneStatus.label}</span>
                    </div>
                    {counts[doneStatus.id] > 0 && (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">{counts[doneStatus.id]}</span>
                    )}
                    </button>
               </div>
           )}
        </nav>

        {/* Sidebar Footer with Dashboards */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
             <div className="flex items-center gap-2 mb-4">
                <button 
                    onClick={() => setIsStatusSettingsOpen(true)}
                    className="flex-1 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-800 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                    </svg>
                    Bewerk Statussen
                </button>
             </div>

             <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Dashboards</span>
                    <button onClick={createDashboard} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" title="Nieuw Dashboard">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                    {dashboards.map(d => (
                        <div 
                            key={d.id} 
                            onClick={() => {
                                setActiveDashboardId(d.id);
                                setFilter('ALL');
                            }}
                            className={`group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors ${activeDashboardId === d.id ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                                {urgentDashboardIds.has(d.id) && (
                                     <div title="Deadline vandaag!" className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0"></div>
                                )}
                                <span className="truncate">{d.title}</span>
                                {d.shared && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-blue-500 dark:text-blue-400 flex-shrink-0">
                                        <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
                                    </svg>
                                )}
                            </div>
                            {dashboards.length > 1 && (
                                <button 
                                    type="button"
                                    onClick={(e) => initiateDeleteDashboard(e, d.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-500 rounded z-20 transition-all flex-shrink-0 ml-1"
                                    title="Verwijder dashboard"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
             </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-950 transition-colors duration-200">
        
        {/* Header */}
        <header className="h-16 md:h-20 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 md:px-8 bg-white dark:bg-gray-900 shrink-0 transition-colors duration-200 gap-4">
            
            {/* Mobile Menu Button */}
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </button>

            {/* Dashboard Title & Search */}
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-8 min-w-0">
               <div className="flex flex-col">
                    {filter === 'ALL' && isEditingTitle ? (
                        <input 
                            autoFocus
                            type="text" 
                            value={activeDashboard.title}
                            onChange={(e) => updateDashboardTitle(e.target.value)}
                            onBlur={() => setIsEditingTitle(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                            className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white border-b-2 border-blue-500 outline-none w-full max-w-xs bg-white dark:bg-gray-900"
                        />
                    ) : (
                        <h1 
                            onClick={() => filter === 'ALL' && setIsEditingTitle(true)}
                            className={`text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate ${filter === 'ALL' ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group' : ''}`}
                        >
                            {activeStatusLabel}
                            {filter === 'ALL' && (
                                <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="hidden md:block w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                </svg>
                                {activeDashboard.shared && (
                                        <div className="ml-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1 hidden md:flex">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
                                            </svg>
                                            <span className="text-xs font-semibold">Gedeeld</span>
                                        </div>
                                )}
                                </>
                            )}
                        </h1>
                    )}
               </div>

               {/* Search Input */}
               <div className="relative max-w-md w-full md:w-64 hidden md:block">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                     </svg>
                  </div>
                  <input
                     type="text"
                     placeholder="Zoek taken..."
                     className="pl-9 pr-4 py-1.5 w-full bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-1 md:gap-3">
               <button 
                 onClick={() => setIsShareModalOpen(true)}
                 className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                 </svg>
                 Delen
               </button>
               
               <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
               
               <SettingsMenu isDarkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </div>
        </header>

        {/* Mobile Search Bar (Only visible on mobile below header) */}
        <div className="md:hidden px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
             <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                     </svg>
                  </div>
                  <input
                     type="text"
                     placeholder="Zoek taken..."
                     className="pl-9 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
        </div>

        {/* Task List Header */}
        <div className="flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-950 p-4 md:p-8 transition-colors duration-200">
           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[400px] transition-colors duration-200">
               {/* Quick Task Input Row (Bottom) - Only show if not in 'Klaar' filter */}
               {filter !== 'Klaar' && (
                   <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                      <form onSubmit={quickAddTask} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 px-1 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900 focus-within:border-blue-300 dark:focus-within:border-blue-600 transition-all shadow-sm">
                          <div className="w-full md:w-40 flex-shrink-0 px-2 pt-2 md:pt-0">
                            <StatusCell 
                                currentStatusId={quickTaskStatusId} 
                                availableStatuses={statuses}
                                onChange={setQuickTaskStatusId}
                            />
                          </div>
                          <input 
                            type="text" 
                            placeholder="Snel taak toevoegen..." 
                            className="flex-1 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent px-2 h-10 border-0 md:border-l border-gray-100 dark:border-gray-700"
                            value={quickTaskTitle}
                            onChange={(e) => setQuickTaskTitle(e.target.value)}
                          />
                          <button type="submit" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-4 h-8 bg-blue-50 dark:bg-blue-900/30 rounded mx-2 mb-2 md:mb-0 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                            Toevoegen
                          </button>
                      </form>
                   </div>
               )}

               {/* Tasks */}
               <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredTasks.length > 0 ? (
                      filteredTasks.map((task, index) => (
                        <TaskRow 
                          key={task.id} 
                          task={task}
                          availableStatuses={statuses}
                          onUpdate={updateTask} 
                          onDelete={deleteTask}
                          onNotifyClick={setNotificationTask}
                          onOpenStatusSettings={() => setIsStatusSettingsOpen(true)}
                          // Drag props - Disable drag if filtering by 'Klaar' or searching
                          draggable={filter === 'ALL' && !searchQuery}
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragEnter={(e) => handleDragEnter(e, index)}
                          onDragEnd={handleDrop}
                          onDrop={handleDrop}
                        />
                      ))
                  ) : (
                      <div className="py-20 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400 dark:text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                              {searchQuery ? 'Geen resultaten gevonden' : (filter === 'Klaar' ? 'Nog geen afgeronde taken' : 'Alles bijgewerkt!')}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mt-1">
                              {searchQuery ? `Geen taken gevonden voor "${searchQuery}"` : (filter === 'Klaar' ? 'Taken die je afrondt verschijnen hier.' : 'Geen taken in dit overzicht.')}
                          </p>
                      </div>
                  )}
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;