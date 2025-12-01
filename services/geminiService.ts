
import { GoogleGenAI, Type } from "@google/genai";
import { Task, Status } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateReminderMessage = async (task: Task, statusLabel: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, motivational, and urgent push notification message (max 20 words) for a task titled "${task.title}" with the status "${statusLabel}". Language: Dutch.`,
    });
    return response.text || `Reminder: ${task.title}`;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Vergeet niet: ${task.title}`;
  }
};

export const prioritizeTasks = async (tasks: Task[], availableStatuses: Status[]): Promise<string[]> => {
  try {
    // Create a map for quick status lookup
    const statusMap = availableStatuses.reduce((acc, s) => {
      acc[s.id] = s.label;
      return acc;
    }, {} as Record<string, string>);

    const simplifiedTasks = tasks.map(t => ({
      id: t.id,
      title: t.title,
      status: statusMap[t.status] || t.status
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze these tasks and return a JSON array of task IDs sorted by estimated urgency/importance.
      Tasks: ${JSON.stringify(simplifiedTasks)}
      
      Generally: 'Prioriteit', 'Vastgelopen', and 'Mee bezig' imply higher urgency than 'Op de planning' or 'Klaar'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as string[];
  } catch (error) {
    console.error("Gemini Prioritize Error:", error);
    return tasks.map(t => t.id);
  }
};

export const suggestSubtasks = async (taskTitle: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `For the task "${taskTitle}", suggest 3 concrete sub-steps to get it done. Dutch language.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        return JSON.parse(response.text.trim()) as string[];
    } catch (error) {
        return [];
    }
}
