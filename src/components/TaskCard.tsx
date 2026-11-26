import type { DragEvent } from "react";
import type { Status, Task } from "../types/task";
import PriorityBadge from "./PriorityBadge";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: Status, beforeId?: string) => void;
}

function TaskCard({ task, onEdit, onDelete, onMove }: TaskCardProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", task.id);
  };

  return (
    <div
      className="w-full p-4 flex flex-col items-start gap-3 rounded-xl cursor-grab active:cursor-grabbing bg-[#1A223C]"
      draggable
      onDragStart={handleDragStart}
      data-task-id={task.id}
    >
      <div className="flex items-center justify-center gap-2">
        <h3>{task.title}</h3>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && <span>{task.description}</span>}

      {task.dueDate && <span className="text-slate-400">{task.dueDate}</span>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="px-2 py-1 text-sm font-bold whitespace-nowrap cursor-pointer active:scale-95 rounded-lg text-red-700 bg-red-200"
          onClick={() => {
            onDelete(task.id);
          }}
        >
          Delete
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm font-bold whitespace-nowrap cursor-pointer active:scale-95 rounded-lg text-blue-700 bg-blue-200"
          onClick={() => {
            onEdit(task);
          }}
        >
          Edit
        </button>
        {task.status !== "done" && (
          <button
            type="button"
            className="px-2 py-1 text-sm font-bold whitespace-nowrap cursor-pointer active:scale-95 rounded-lg text-green-700 bg-green-200"
            onClick={() => {
              onMove(task.id, "done");
            }}
          >
            Mark Done
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
