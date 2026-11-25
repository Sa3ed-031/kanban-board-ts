import type { Task } from "../types/task";
import PriorityBadge from "./PriorityBadge";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  markDone: (id: string) => void;
}

function TaskCard({ task, onEdit, onDelete, markDone }: TaskCardProps) {
  return (
    <div className="w-full p-4 flex flex-col items-start gap-3 rounded-xl bg-[#1A223C]">
      {/* 1. العنوان، و PriorityBadge جنبه */}
      <div className="flex items-center justify-center gap-2">
        <h3>{task.title}</h3>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* 2. الوصف، بس إذا موجود (تلميح: task.description && ...) */}
      {task.description && <span>{task.description}</span>}

      {/* 3. تاريخ التسليم، بس إذا موجود */}
      {task.dueDate && <span className="text-slate-400">{task.dueDate}</span>}

      {/* 4. زرين: Edit و Delete */}
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
          className="px-2 py-1 text-sm font-bold whitespace-nowrap cursor-pointer active:scale-95 rounded-lg text-blue-700 bg-red-200"
          onClick={() => {
            onEdit(task);
          }}
        >
          Edit
        </button>
        {task.status != "done" && (
          <button
            type="button"
            className="px-2 py-1 text-sm font-bold whitespace-nowrap cursor-pointer active:scale-95 rounded-lg text-green-700 bg-red-200"
            onClick={() => {
              markDone(task.id);
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
