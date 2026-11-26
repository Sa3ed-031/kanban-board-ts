import { useState } from "react";

import Board from "./components/Board";
import Modal from "./components/Modal";
import TaskForm from "./components/TaskForm";
import { useTasks } from "./hooks/useTasks";
import type { NewTask, Task } from "./types/task";

function App() {
  const { tasks, dispatch } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  function closeForm() {
    setIsFormOpen(false);
    setEditingTask(null);
  }

  function handleSubmit(data: NewTask) {
    if (editingTask) {
      // 'editingTask' is possibly 'null'.
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kanban Board</h1>
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
      <Board
        tasks={tasks}
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
            // Type 'Task | null' is not assignable to type 'Task | undefined',
            initialTask={editingTask ?? undefined} // if {editingTask} just, cause error because it can be null in this case, but in the definition on initialTask it can be Task | undefined(no null) so writing undefind explicity will make it match the definition.
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </Modal>
      )}
    </div>
  );
}

export default App;
