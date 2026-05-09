import React, { useState, useEffect, useMemo } from "react";
import "./ToDo.css";

function ToDoList() {
  // --- State Management ---
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("master_tasks_v3");
    return saved ? JSON.parse(saved) : [];
  });

  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem("master_lists_v3");
    return saved ? JSON.parse(saved) : [
      { id: "default", name: "🏠 General" },
      { id: "work", name: "💼 Work" },
      { id: "personal", name: "🌟 Personal" }
    ];
  });

  const [activeListId, setActiveListId] = useState(() => {
    return localStorage.getItem("active_list_id_v3") || "default";
  });

  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("dark_mode") === "true";
  });

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [isLoading, setIsLoading] = useState(true);

  // --- Effects ---
  useEffect(() => {
    // Simulate loading for 3D splash screen
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("master_tasks_v3", JSON.stringify(tasks));
    localStorage.setItem("master_lists_v3", JSON.stringify(lists));
    localStorage.setItem("active_list_id_v3", activeListId);
    localStorage.setItem("dark_mode", isDarkMode);
    document.body.className = isDarkMode ? "dark-theme" : "";
  }, [tasks, lists, activeListId, isDarkMode]);

  // --- Handlers ---
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

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
      createdAt: new Date().toISOString(),
    };
    setTasks([item, ...tasks]);
    setNewTask("");
    showToast("Added!");
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map((t) => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);
    
    // Confetti logic: If all tasks in active list are now completed
    const activeTasks = updatedTasks.filter(t => t.listId === activeListId);
    if (activeTasks.length > 0 && activeTasks.every(t => t.completed)) {
      if (window.confetti) {
        window.confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a5b4fc', '#bbf7d0', '#fed7aa']
        });
      }
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
    showToast("Removed", "info");
  };

  const saveEdit = (id) => {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }
    setTasks(tasks.map((t) => (t.id === id ? { ...t, text: editValue } : t)));
    setEditingId(null);
    showToast("Updated!");
  };

  const handleAddList = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const newList = { id: Date.now().toString(), name: newListName.trim() };
    setLists([...lists, newList]);
    setNewListName("");
    setIsAddingList(false);
    setActiveListId(newList.id);
    showToast("List created!");
  };

  // --- Computed Data ---
  const activeList = lists.find(l => l.id === activeListId) || lists[0];
  const listTasks = tasks.filter(t => t.listId === activeListId);
  const completedCount = listTasks.filter(t => t.completed).length;
  const progressPercent = listTasks.length > 0 ? (completedCount / listTasks.length) * 100 : 0;

  const filteredTasks = useMemo(() => {
    return listTasks
      .filter((t) => {
        const matchesFilter =
          filter === "All" ||
          (filter === "Pending" && !t.completed) ||
          (filter === "Completed" && t.completed);
        const matchesSearch = t.text.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [tasks, activeListId, filter, searchTerm]);

  return (
    <>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loader-container">
            <div className="cube">
              <div className="front"></div>
              <div className="back"></div>
              <div className="right"></div>
              <div className="left"></div>
              <div className="top"></div>
              <div className="bottom"></div>
            </div>
          </div>
          <div className="loading-text">Loading Task Master</div>
        </div>
      )}
      
      <div className={`app-container ${isDarkMode ? "dark-theme" : ""}`}>
      {toast.show && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <div className="main-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>My Categories</h3>
            <button className="add-list-btn" onClick={() => setIsAddingList(true)} title="Create New List">+</button>
          </div>

          {isAddingList && (
            <form onSubmit={handleAddList} className="new-list-form">
              <input 
                autoFocus 
                placeholder="Name (e.g. 🛍️ Shopping)" 
                value={newListName} 
                onChange={(e) => setNewListName(e.target.value)}
                onBlur={() => !newListName && setIsAddingList(false)}
              />
            </form>
          )}

          <nav className="list-nav">
            {lists.map(list => (
              <div 
                key={list.id} 
                className={`list-nav-item ${activeListId === list.id ? "active" : ""}`}
                onClick={() => setActiveListId(list.id)}
              >
                <span className="list-name">{list.name}</span>
                {list.id !== "default" && (
                  <button className="del-list-icon" title="Delete List" onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Delete this list?")) {
                      setLists(lists.filter(l => l.id !== list.id));
                      setTasks(tasks.filter(t => t.listId !== list.id));
                      if (activeListId === list.id) setActiveListId("default");
                    }
                  }}>×</button>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <main className="todo-content">
          <div className="todo-card">
            <header className="app-header">
              <div className="header-top">
                <h1>{activeList.name}</h1>
                <button className="icon-btn theme-btn" onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle Dark/Light Mode">
                  {isDarkMode ? "☀️" : "🌙"}
                </button>
              </div>
              
              <div className="progress-section">
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <span className="progress-label">{Math.round(progressPercent)}% completed</span>
              </div>
            </header>

            <form className="add-section" onSubmit={handleAddTask}>
              <div className="input-row">
                <input
                  type="text"
                  placeholder="Type a new task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
                <button type="submit" className="primary-btn" title="Add Task">Add</button>
              </div>
              <div className="meta-row">
                <select value={priority} onChange={(e) => setPriority(e.target.value)} title="Priority">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} title="Due Date" />
              </div>
            </form>

            <div className="controls-section">
              <input 
                type="text" 
                className="search-input"
                placeholder="🔍 Search tasks..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="filter-tabs">
                {["All", "Pending", "Completed"].map((f) => (
                  <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="list-container">
              {filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✨</div>
                  <p>{searchTerm ? "No matches found" : "You're all done! Take a break."}</p>
                </div>
              ) : (
                <ul className="task-list">
                  {filteredTasks.map((task) => (
                    <li key={task.id} className={`task-item ${task.completed ? "task-done" : ""}`}>
                      <div className="task-main" onClick={() => toggleTask(task.id)}>
                        <div className={`custom-check ${task.completed ? "checked" : ""}`}>
                          {task.completed && "✓"}
                        </div>
                        {editingId === task.id ? (
                          <input
                            className="edit-input"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(task.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(task.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="task-content">
                            <span className="task-text">{task.text}</span>
                            <div className="task-meta">
                              <span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                              {task.dueDate && <span className="date-tag">📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="task-actions">
                        <button className="icon-btn" title="Edit" onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditingId(task.id); 
                          setEditValue(task.text); 
                        }}>✏️</button>
                        <button className="icon-btn" title="Delete" onClick={(e) => { 
                          e.stopPropagation(); 
                          deleteTask(task.id); 
                        }}>🗑️</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
      </div>
    </>
  );
}

export default ToDoList;