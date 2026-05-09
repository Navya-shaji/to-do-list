import React, { useState, useEffect, useMemo } from "react";
import "./ToDo.css";

function ToDoList() {
  // --- State ---
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("high_fidelity_tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem("high_fidelity_lists");
    return saved ? JSON.parse(saved) : [
      { id: "inbox", name: "Inbox", icon: "📥" },
      { id: "work", name: "Project Alpha", icon: "🚀" },
      { id: "personal", name: "Ideas", icon: "💡" }
    ];
  });

  const [activeListId, setActiveListId] = useState("inbox");
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem("high_fidelity_tasks", JSON.stringify(tasks));
    localStorage.setItem("high_fidelity_lists", JSON.stringify(lists));
  }, [tasks, lists]);

  // --- Handlers ---
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const item = {
      id: Date.now(),
      text: newTask.trim(),
      completed: false,
      priority,
      dueDate,
      listId: activeListId,
      createdAt: new Date().toISOString()
    };
    setTasks([item, ...tasks]);
    setNewTask("");
    setPriority("Medium");
    setDueDate("");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const saveEdit = (id) => {
    if (!editValue.trim()) return;
    setTasks(tasks.map(t => t.id === id ? { ...t, text: editValue } : t));
    setEditingId(null);
  };

  const handleAddList = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const newList = { id: Date.now().toString(), name: newListName.trim(), icon: "📁" };
    setLists([...lists, newList]);
    setNewListName("");
    setIsAddingList(false);
    setActiveListId(newList.id);
  };

  // --- Filtering ---
  const activeList = lists.find(l => l.id === activeListId) || lists[0];
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => t.listId === activeListId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [tasks, activeListId]);

  return (
    <div className="hq-app">
      <div className="hq-layout">
        {/* Advanced Sidebar */}
        <aside className="hq-sidebar">
          <div className="hq-sidebar-section">
            <header>Favorites</header>
            <nav className="hq-nav">
              {lists.map(list => (
                <div 
                  key={list.id} 
                  className={`hq-nav-item ${activeListId === list.id ? "active" : ""}`}
                  onClick={() => setActiveListId(list.id)}
                >
                  <span className="hq-nav-icon">{list.icon}</span>
                  <span className="hq-nav-text">{list.name}</span>
                </div>
              ))}
            </nav>
          </div>

          <div className="hq-sidebar-footer">
            <button className="hq-add-list-btn" onClick={() => setIsAddingList(true)}>
              <span>+</span> New Project
            </button>
            {isAddingList && (
              <form onSubmit={handleAddList} className="hq-sidebar-form">
                <input 
                  autoFocus 
                  placeholder="Project name..." 
                  value={newListName} 
                  onChange={(e) => setNewListName(e.target.value)} 
                />
              </form>
            )}
          </div>
        </aside>

        {/* High-Fidelity Main Area */}
        <main className="hq-content">
          <header className="hq-header">
            <div className="hq-breadcrumb">Projects / {activeList.name}</div>
            <div className="hq-header-main">
              <h1>{activeList.name}</h1>
            </div>
          </header>

          <form className="hq-input-container" onSubmit={handleAddTask}>
            <div className="hq-input-wrapper">
              <input 
                type="text" 
                placeholder="What needs to be done?" 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <div className="hq-input-meta">
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                <button type="submit" className="hq-add-btn">Add</button>
              </div>
            </div>
          </form>

          <div className="hq-list-container">
            {filteredTasks.length === 0 ? (
              <div className="hq-empty-state">
                <div className="hq-empty-icon">📂</div>
                <h3>No tasks in this project</h3>
                <p>Enjoy your clear schedule or start by adding a task above.</p>
              </div>
            ) : (
              <ul className="hq-task-list">
                {filteredTasks.map(task => (
                  <li key={task.id} className={`hq-task-item ${task.completed ? "completed" : ""}`}>
                    <div className="hq-task-left">
                      <div className={`hq-checkbox ${task.completed ? "checked" : ""}`} onClick={() => toggleTask(task.id)}>
                        {task.completed && "✓"}
                      </div>
                      <div className="hq-task-info">
                        {editingId === task.id ? (
                          <input 
                            className="hq-inline-edit"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(task.id)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                            autoFocus
                          />
                        ) : (
                          <span className="hq-task-text" onClick={() => toggleTask(task.id)}>
                            {task.text}
                          </span>
                        )}
                        <div className="hq-task-labels">
                          <span className={`hq-prio-tag prio-${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                          {task.dueDate && <span className="hq-date-tag">📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="hq-task-right">
                      <button className="hq-action-btn" onClick={() => { setEditingId(task.id); setEditValue(task.text); }}>Edit</button>
                      <button className="hq-action-btn delete" onClick={() => deleteTask(task.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ToDoList;