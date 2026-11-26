import { useEffect, useReducer } from "react";
import type { Task } from "../types/task";
import { tasksReducer } from "../reducers/tasksReducer";

const STORAGE_KEY = "kanban-tasks";

function loadTasks(): Task[] {
  // 1. read STORAGE_KEY from localStorage
  const stored = localStorage.getItem(STORAGE_KEY);

  // 2. if nothing → return []
  if (!stored) return [];

  try {
    // 3. JSON.parse inside try/catch → on error return []
    const data: unknown = JSON.parse(stored); // if "any" instead of unknown then TypeScript will never check it, but "unknown" make TS check it before use it, so force narrowing.

    // 4. if the result is NOT an array → return []
    // 5. otherwise → return it
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function useTasks() {
  const [tasks, dispatch] = useReducer(tasksReducer, [], loadTasks);

  // save tasks to localStorage every time they change (useEffect)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  return { tasks, dispatch };
}
