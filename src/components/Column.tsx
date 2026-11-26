import { useState, type DragEvent } from "react";
import type { Column as ColumnType, Status, Task } from "../types/task";
import TaskCard from "./TaskCard";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: Status, beforeId?: string) => void;
}

function Column({ column, tasks, onEdit, onDelete, onMove }: ColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    // اللحظة 2: اسمح بالإفلات
    e.preventDefault();
  };

  const handleDragLeave = (e: DragEvent<HTMLElement>) => {
    const next = e.relatedTarget; // العنصر يلي رايحله الماوس

    // إذا next جوّا العمود: لا تعمل شي
    if (next instanceof Node && e.currentTarget.contains(next)) return;
    // contains accept just "Node", and "next" has a "EventTarget | null" type, so we narrowed the type to "Node".

    setIsOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    setIsOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;

    const target = e.target;
    const card =
      target instanceof HTMLElement
        ? target.closest<HTMLElement>("[data-task-id]")
        : null;

    const beforeId = card?.dataset.taskId;
    onMove(id, column.id, beforeId);
  };

  return (
    <section
      className={`p-4 flex flex-col gap-3 rounded-2xl ${isOver ? "ring-2 ring-indigo-500" : ""} bg-white/5`}
      onDragOver={handleDragOver}
      onDragEnter={() => setIsOver(true)}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="font-bold flex items-center justify-between gap-2">
        <h2>{column.title}</h2>
        <span>{tasks.length}</span>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={onMove}
          />
        ))}
      </div>

      {tasks.length === 0 && <span>No tasks yet.</span>}
    </section>
  );
}

export default Column;
