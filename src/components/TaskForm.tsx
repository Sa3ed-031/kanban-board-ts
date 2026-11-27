import { useState, type ChangeEvent, type FormEvent } from "react";
import type { NewTask, Task } from "../types/task";

interface TaskFormProps {
  initialTask?: Task; // Task | undefined
  onSubmit: (data: NewTask) => void;
  onCancel: () => void;
}

const EMPTY_TASK: NewTask = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
};

function TaskForm({ initialTask, onSubmit, onCancel }: TaskFormProps) {
  const [form, setForm] = useState<NewTask>(initialTask ?? EMPTY_TASK);
  const [error, setError] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Please write a title..");
      return;
    }
    onSubmit(form);
    // 1. إذا العنوان فاضي بعد trim(): حط رسالة خطأ بالـ error ووقّف (return)
    // 2. وإلا: ابعت الـ form لـ onSubmit
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        placeholder="Task title"
        aria-label="Task title"
        className="p-1 px-2 rounded-xl border-2 border-gray-500"
        value={form.title}
        onChange={handleChange}
      />

      {error && <span className="font-bold text-red-700">{error}</span>}

      <textarea
        name="description"
        placeholder="Description (optional)"
        aria-label="Task description"
        className="p-1 px-2 rounded-xl border-2 border-gray-500"
        value={form.description}
        onChange={handleChange}
      ></textarea>

      <select
        name="priority"
        aria-label="Priority"
        className="p-1 px-2 rounded-xl border-2 border-gray-500"
        value={form.priority}
        onChange={handleChange}
      >
        <option className="text-gray-700" value="low">
          Low
        </option>
        <option className="text-gray-700" value="medium">
          Medium
        </option>
        <option className="text-gray-700" value="high">
          High
        </option>
      </select>

      <input
        type="date"
        name="dueDate"
        aria-label="Due date"
        className="p-1 px-2 rounded-xl border-2 border-gray-500"
        value={form.dueDate}
        onChange={handleChange}
      />

      <div className="flex items-center justify-center gap-4">
        <button
          className="p-1 px-2 flex items-center justify-center rounded-xl bg-red-400"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="p-1 px-2 flex items-center justify-center rounded-xl bg-green-400"
          type="submit"
        >
          Save
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
