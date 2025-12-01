
export interface Status {
  id: string;
  label: string;
  color: string; // Tailwind background class
  textColor: string; // Tailwind text class
}

export interface Dashboard {
  id: string;
  title: string;
  shared?: boolean;
}

export interface Task {
  id: string;
  dashboardId: string;
  title: string;
  description?: string;
  status: string; // Matches Status.id
  lastUpdated: number;
  notes?: string;
  aiSuggestion?: string;
  deadline?: string; // ISO Date string YYYY-MM-DD
  completedAt?: number; // Timestamp when status changed to 'Klaar'
}

export interface ColorTheme {
  name: string;
  bg: string;
  text: string;
  dot: string;
}

export type FilterType = 'ALL' | string;
