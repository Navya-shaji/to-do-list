import React, { useState } from "react";

function ToDoList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editTask, setEditTask] = useState("");

  function handleAddTask() {
    if (newTask.trim() !== "" && !tasks.some((task) => task.text === newTask) ) {
      setTasks([...tasks, { text: newTask, completed: false }]);
    
      setNewTask("");
     
    }
  }
function deleteTask(index){
  const updatedtask=tasks.filter((_,i)=>index!==i)
  setTasks(updatedtask)
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
          placeholder="Enter a Task"
          onChange={(e) => setNewTask(e.target.value)}
         
        />
        <button onClick={handleAddTask}>Add</button>
      
      
        
      </div>
      <ul className="task-list">
        {tasks.map((task, index) => (
          <li key={index}>
            {editIndex === index ? (
              <>
                <input
                  type="text"
                  value={editTask}
                  onChange={(e) => setEditTask(e.target.value)}
              
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
      
    </div>
  );
}

export default ToDoList;
