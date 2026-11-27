import { useEffect, useReducer } from "react";
import type { Task } from "../types/task";
import { tasksReducer } from "../reducers/tasksReducer";

const STORAGE_KEY = "kanban-tasks";

function loadTasks(): Task[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    // "unknown" forces a runtime check before use, "any" don't
    const data: unknown = JSON.parse(stored);

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function useTasks() {
  const [tasks, dispatch] = useReducer(tasksReducer, [], loadTasks);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  return { tasks, dispatch };
}
