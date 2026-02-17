import { useEffect, useMemo, useState } from "react";
import "./App.css";

const initialForm = { title: "", completed: false };

function formatError(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  return "Something went wrong. Please try again.";
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((task) => task.completed).length;
    return { total, done };
  }, [tasks]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/tasks")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load tasks.");
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setTasks(data);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          completed: form.completed,
        }),
      });
      if (!res.ok) throw new Error("Failed to save task.");
      const newTask = await res.json();
      setTasks((prev) => [newTask, ...prev]);
      setForm(initialForm);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to save task.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Task Forge</p>
          <h1>Shape your queue into finished work.</h1>
          <p className="subhead">
            A lightweight dashboard that talks to your FastAPI backend. Track what
            is started, what is done, and what is next.
          </p>
        </div>
        <div className="hero__panel">
          <div className="stat">
            <span className="stat__label">Total tasks</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat">
            <span className="stat__label">Completed</span>
            <strong>{stats.done}</strong>
          </div>
        </div>
      </header>

      <main className="content">
        <section className="card form-card">
          <div className="card__title">Create task</div>
          <form onSubmit={handleSubmit} className="task-form">
            <label className="field">
              <span>Title</span>
              <input
                name="title"
                placeholder="Draft onboarding email"
                value={form.title}
                onChange={handleChange}
                autoComplete="off"
              />
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                name="completed"
                checked={form.completed}
                onChange={handleChange}
              />
              <span>Mark as done</span>
            </label>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add task"}
            </button>
            {error ? <p className="error">{formatError(error)}</p> : null}
          </form>
        </section>

        <section className="card list-card">
          <div className="card__title">Latest tasks</div>
          {loading ? (
            <p className="muted">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="muted">No tasks yet. Create the first one.</p>
          ) : (
            <ul className="task-list">
              {tasks.map((task, index) => (
                <li
                  className={`task ${task.completed ? "is-done" : ""}`}
                  style={{ "--delay": `${index * 70}ms` }}
                  key={task.id}
                >
                  <div>
                    <p className="task__title">{task.title}</p>
                    <p className="task__meta">
                      {task.completed ? "Completed" : "In progress"}
                    </p>
                  </div>
                  <span className="badge">#{task.id}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
