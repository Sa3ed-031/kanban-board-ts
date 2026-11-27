import { useState } from "react";

import Board from "./components/Board";
import Modal from "./components/Modal";
import TaskForm from "./components/TaskForm";
import { useTasks } from "./hooks/useTasks";
import type { PriorityFilter, NewTask, Task } from "./types/task";
import useLocalStorage from "./hooks/useLocalStorage";
import { PRIORITY_FILTERS, PRIORITY_LABELS } from "./constants/columns";

function App() {
  const { tasks, dispatch } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useLocalStorage<PriorityFilter>(
    "kanban-filter",
    "all",
  );

  const visibleTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.priority === filter);
  /* if filter is "all" → all tasks, otherwise → only tasks with this priority */

  function closeForm() {
    setIsFormOpen(false);
    setEditingTask(null);
  }

  function handleSubmit(data: NewTask) {
    if (editingTask) {
      dispatch({
        type: "UPDATE_TASK",
        payload: { ...data, id: editingTask.id },
      });
    } else {
      dispatch({ type: "ADD_TASK", payload: data });
    }
    closeForm();
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="max-md:flex-col flex items-center justify-between gap-6">
        <h1 className="text-3xl font-bold">Kanban Board</h1>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-2">
            {PRIORITY_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                className={`p-1 px-2 text-sm font-bold rounded-lg ${filter === f ? "text-white bg-indigo-600" : "text-slate-300 bg-white/5"}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : PRIORITY_LABELS[f]}
              </button>
            ))}
          </div>
          <button
            className="p-1 px-2 rounded-lg bg-green-500"
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
          >
            Add Task
          </button>
        </div>
      </div>
      <Board
        tasks={visibleTasks}
        onEdit={(t) => {
          setEditingTask(t);
          setIsFormOpen(true);
        }}
        onDelete={(id) => dispatch({ type: "DELETE_TASK", payload: { id } })}
        onMove={(id, status, beforeId) =>
          dispatch({ type: "MOVE_TASK", payload: { id, status, beforeId } })
        }
      />

      {isFormOpen && (
        <Modal
          title={editingTask ? "Edit Task" : "New Task"}
          onClose={closeForm}
        >
          <TaskForm
            initialTask={editingTask ?? undefined} // TaskForm expects undefined, not null.
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </Modal>
      )}
    </div>
  );
}

export default App;
