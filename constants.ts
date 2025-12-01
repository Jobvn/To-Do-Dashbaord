
import { Status, ColorTheme } from './types';

export const COLOR_THEMES: ColorTheme[] = [
  { name: 'Gray', bg: 'bg-gray-200', text: 'text-gray-700', dot: 'bg-gray-400' },
  { name: 'Blue', bg: 'bg-blue-500', text: 'text-white', dot: 'bg-blue-400' },
  { name: 'Red', bg: 'bg-red-500', text: 'text-white', dot: 'bg-red-400' },
  { name: 'Yellow', bg: 'bg-yellow-400', text: 'text-yellow-900', dot: 'bg-yellow-600' },
  { name: 'Orange', bg: 'bg-orange-400', text: 'text-white', dot: 'bg-orange-300' },
  { name: 'Purple', bg: 'bg-purple-500', text: 'text-white', dot: 'bg-purple-400' },
  { name: 'Green', bg: 'bg-green-500', text: 'text-white', dot: 'bg-green-400' },
  { name: 'Pink', bg: 'bg-pink-400', text: 'text-white', dot: 'bg-pink-300' },
  { name: 'Indigo', bg: 'bg-indigo-500', text: 'text-white', dot: 'bg-indigo-300' },
  { name: 'Teal', bg: 'bg-teal-400', text: 'text-teal-900', dot: 'bg-teal-600' },
];

export const DEFAULT_STATUSES: Status[] = [
  { id: 'Op de planning', label: 'Op de planning', color: 'bg-gray-200', textColor: 'text-gray-700' },
  { id: 'Mee bezig', label: 'Mee bezig', color: 'bg-blue-500', textColor: 'text-white' },
  { id: 'Prioriteit', label: 'Prioriteit', color: 'bg-red-500', textColor: 'text-white' },
  { id: 'Reminder', label: 'Reminder', color: 'bg-yellow-400', textColor: 'text-yellow-900' },
  { id: 'Dubbelchecken', label: 'Dubbelchecken', color: 'bg-orange-400', textColor: 'text-white' },
  { id: 'Vastgelopen', label: 'Vastgelopen', color: 'bg-purple-500', textColor: 'text-white' },
  { id: 'Klaar', label: 'Klaar', color: 'bg-green-500', textColor: 'text-white' },
];

export const INITIAL_TASKS: any[] = [
  {
    id: '1',
    dashboardId: 'default',
    title: 'Website redesign concepten maken',
    status: 'Mee bezig',
    lastUpdated: Date.now()
  },
  {
    id: '2',
    dashboardId: 'default',
    title: 'Belastingaangifte Q3',
    status: 'Prioriteit',
    lastUpdated: Date.now()
  },
  {
    id: '3',
    dashboardId: 'default',
    title: 'Klant meeting voorbereiden',
    status: 'Op de planning',
    lastUpdated: Date.now()
  }
];
