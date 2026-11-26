import type { Task, TaskAction } from "../types/task";

export function tasksReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case "ADD_TASK":
      return [
        ...state,
        {
          ...action.payload,
          id: crypto.randomUUID(),
          status: "todo",
          createdAt: new Date().toISOString(),
        },
      ];

    case "DELETE_TASK":
      return state.filter((t) => t.id !== action.payload.id);

    case "UPDATE_TASK":
      return state.map((t) => {
        if (t.id === action.payload.id) return { ...t, ...action.payload };
        else return t;
      });

    case "MOVE_TASK": {
      const { id, status, beforeId } = action.payload;
      const draggedTask = state.find((t) => t.id === id);

      if (!draggedTask || id === beforeId) return state;

      const rest = state.filter((t) => t.id !== draggedTask.id);
      const moved = { ...draggedTask, status };

      if (!beforeId) return [...rest, moved];

      const beforeIndex = rest.findIndex((t) => t.id === beforeId);
      if (beforeIndex === -1) return [...rest, moved];

      return [
        ...rest.slice(0, beforeIndex), // everything before it
        moved,
        ...rest.slice(beforeIndex), // it, and everything after
      ];
    }

    default: {
      const _exhaustive: never = action;
      throw new Error(`Unknown action: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
