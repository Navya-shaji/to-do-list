import React, { useState } from "react";
import "./ToDo.css";

function ToDoList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editTask, setEditTask] = useState("");

  function handleAddTask() {
    if (newTask.trim() !== "" && !tasks.some((task) => task.text === newTask)) {
      setTasks([...tasks, { text: newTask, completed: false }]);
      setNewTask("");
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  }

  function deleteTask(index) {
    const updatedTask = tasks.filter((_, i) => index !== i);
    setTasks(updatedTask);
  }

  function startEditing(index) {
    setEditIndex(index);
    setEditTask(tasks[index].text);
  }

  function cancelEdit() {
    setEditIndex(null);
    setEditTask("");
  }

  function saveTask() {
    if (editTask.trim()) {
      setTasks(
        tasks.map((task, i) =>
          i === editIndex ? { ...task, text: editTask } : task
        )
      );
      setEditIndex(null);
      setEditTask("");
    }
  }

  function toggleComplete(index) {
    setTasks(
      tasks.map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task
      )
    );
  }

  return (
    <div className="container">
      <h1>Todo List</h1>
      <div className="input-section">
        <input
          type="text"
          value={newTask}
          placeholder="Enter a new task..."
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleAddTask}>Add</button>
      </div>
      
      {tasks.length === 0 ? (
        <div className="empty-message">
          Your task list is empty. Add some tasks to get started!
        </div>
      ) : (
        <>
          <ul className="task-list">
            {tasks.map((task, index) => (
              <li key={index}>
                {editIndex === index ? (
                  <>
                    <input
                      type="text"
                      value={editTask}
                      onChange={(e) => setEditTask(e.target.value)}
                      autoFocus
                    />
                    <button onClick={saveTask}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span
                      className={`circle ${task.completed ? "completed" : ""}`}
                      onClick={() => toggleComplete(index)}
                    >
                      {task.completed && "✓"}
                    </span>
                    <span
                      style={{
                        textDecoration: task.completed ? "line-through" : "none",
                        color: task.completed ? "#888" : "#000",
                      }}
                    >
                      {task.text}
                    </span>
                    <button onClick={() => startEditing(index)}>Edit</button>
                    <button onClick={() => deleteTask(index)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
          
          <div className="task-counter">
            {tasks.filter(task => task.completed).length} of {tasks.length} tasks completed
          </div>
        </>
      )}
    </div>
  );
}

export default ToDoList;