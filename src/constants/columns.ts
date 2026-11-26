import type { Column, Priority, PriorityFilter } from "../types/task";

export const COLUMNS: Column[] = [
  {
    id: "todo",
    title: "To Do",
  },
  {
    id: "in-progress",
    title: "In Progress",
  },
  {
    id: "done",
    title: "Done",
  },
];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PRIORITY_FILTERS: PriorityFilter[] = [
  "all",
  "low",
  "medium",
  "high",
];
