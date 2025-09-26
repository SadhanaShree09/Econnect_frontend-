import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaTrashAlt, FaEdit, FaCheckCircle, FaRegCircle, FaTimes, FaPaperclip, FaDownload, FaUser, FaFlag, FaExclamationTriangle, FaClock, FaArrowLeft, FaPlus } from "react-icons/fa";
import { LS, ipadr } from "../Utils/Resuse";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TaskDetailsPage = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const location = useLocation();
  
  const { 
    task: initialTask, 
    userId, 
    date, 
    statusColumns, 
    priorityColors
  } = location.state || {};

  const getDueDateStatus = (dueDate, isCompleted = false) => {
    if (!dueDate || isCompleted) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    
    // Check if the date is valid
    if (isNaN(due.getTime())) {
      console.log("Invalid date format:", dueDate);
      return null;
    }
    
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        status: 'overdue',
        message: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`,
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: <FaExclamationTriangle className="text-red-600" />
      };
    } else if (diffDays === 0) {
      return {
        status: 'due-today',
        message: 'Due Today',
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: <FaClock className="text-orange-600" />
      };
    } else if (diffDays === 1) {
      return {
        status: 'due-tomorrow',
        message: 'Due Tomorrow',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <FaClock className="text-yellow-600" />
      };
    } else if (diffDays <= 3) {
      return {
        status: 'due-soon',
        message: `Due in ${diffDays} days`,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <FaClock className="text-blue-600" />
      };
    }
    
    return null;
  };

  const convertDateFormat = (dateString) => {
  if (!dateString) return null;
  if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  }
  return dateString;
};

const mapStatusToColumn = (status) => {
  if (!status) return "todo";
  const statusLower = status.toLowerCase();
  if (statusLower === "pending" || statusLower === "todo" || statusLower === "to do") return "todo";
  if (statusLower === "in progress" || statusLower === "in-progress" || statusLower === "ongoing") return "in-progress";
  if (statusLower === "completed" || statusLower === "done" || statusLower === "complete") return "completed";
  return "todo";
};

  const [task, setTask] = useState(initialTask || null);
  const [loading, setLoading] = useState(!initialTask);
  const [newComment, setNewComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const normalizeFiles = (files) =>
    files.map(f => ({
      id: String(f.id),
      name: String(f.name),
      size: Number(f.size),
      type: String(f.type),
      uploadedAt: new Date(f.uploadedAt).toISOString(),
      uploadedBy: String(f.uploadedBy)
    }));
    
  const normalizeSubtasks = (subtasks = []) =>
    subtasks.map(s => ({
      id: s.id,
      text: String(s.text || s.title || ""),
      completed: Boolean(s.completed),
    }));

  const normalizeComments = (comments) =>
    comments.map(c => ({
      id: Number(c.id),
      user: String(c.user),
      text: String(c.text),
      timestamp: new Date(c.timestamp).toLocaleString()
    }));

  useEffect(() => {
  if (taskId && userId && date) {
    fetchTaskDetails();
  }
}, [taskId, userId, date]);

  const fetchTaskDetails = async () => {
  try {
    setLoading(true);
    
    let endpoint;
    if (LS.get("position") === "Employee") {
      endpoint = `${ipadr}/get_manager_tasks/${userId}?date=${date}`;
    } else if (LS.get("position") === "Manager") {
      endpoint = `${ipadr}/get_manager_hr_tasks/${userId}?date=${date}`;
    } else if (LS.get("position") === "HR") {
      endpoint = `${ipadr}/get_hr_self_tasks/${userId}?date=${date}`;
    }

    const response = await fetch(endpoint);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch task details");
    }
    
    const data = await response.json();
 
    const foundTask = data.find(t => String(t.taskid || t.id) === String(taskId));
    if (foundTask) {
      const formattedTask = {
        ...foundTask,
        id: foundTask.taskid || foundTask.id,
        status: mapStatusToColumn(foundTask.status),
        due_date: convertDateFormat(foundTask.due_date || foundTask.dueDate || foundTask.due),
        subtasks: (foundTask.subtasks || []).map((s, idx) => ({
          id: s.id || `${foundTask.taskid}-${idx}`,
          text: s.text || s.title || "",
          completed: s.completed ?? s.done ?? false
        })),
        comments: foundTask.comments || [],
        files: foundTask.files || [],
        assignedBy: foundTask.assigned_by || foundTask.assignedBy || "Manager",
        priority: foundTask.priority || "medium",
        createdDate: foundTask.created_date || foundTask.date
      };
      setTask(formattedTask);
    } else {
      throw new Error("Task not found");
    }
  } catch (error) {
    toast.error(error.message);
    navigate(-1);
  } finally {
    setLoading(false);
  }
};

  const addComment = useCallback(async () => {
    if (!newComment.trim() || !task) return;

    const newEntry = {
      id: Date.now(),
      user: LS.get("name") || "You",
      text: newComment,
      timestamp: new Date().toLocaleString()
    };

    const updatedTask = {
      ...task,
      comments: [...task.comments, newEntry]
    };

    setTask(updatedTask);
    setNewComment("");

    try {
      const res = await fetch(`${ipadr}/edit_task`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskid: updatedTask.id,
          userid: userId,
          comments: normalizeComments(updatedTask.comments),
          subtasks: normalizeSubtasks(updatedTask.subtasks),
          files: normalizeFiles(updatedTask.files)
        })
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.detail || "Failed to save comment");
      toast.success("Comment added!");
    } catch (err) {
      toast.error(err.message);
      fetchTaskDetails(); // Refresh on error
    }
  }, [newComment, task, userId]);

  const addSubtask = useCallback(async () => {
    if (!newSubtask.trim() || !task) return;

    const updatedTask = {
      ...task,
      subtasks: [
        ...task.subtasks,
        // { id: Date.now(), text: newSubtask, completed: false }
        {id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: newSubtask, completed: false}

      ]
    };

    setTask(updatedTask);
    setNewSubtask("");

    try {
      const res = await fetch(`${ipadr}/edit_task`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskid: updatedTask.id,
          userid: userId,
          subtasks: normalizeSubtasks(updatedTask.subtasks),
          comments: normalizeComments(updatedTask.comments),
          files: normalizeFiles(updatedTask.files)
        })
      });
      
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.detail || "Failed to save subtask");
      toast.success("Subtask added!");
    } catch (err) {
      toast.error(err.message || "Failed to save subtask");
      fetchTaskDetails(); // Refresh on error
    }
  }, [newSubtask, task, userId]);

  const toggleSubtask = useCallback(async (subtaskId) => {
    if (!task) return;

    const updatedTask = {
      ...task,
      subtasks: task.subtasks.map(subtask =>
        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
      )
    };

    setTask(updatedTask);

    try {
      const res = await fetch(`${ipadr}/edit_task`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskid: updatedTask.id,
          userid: userId,
          subtasks: normalizeSubtasks(updatedTask.subtasks),
          comments: normalizeComments(updatedTask.comments),
          files: normalizeFiles(updatedTask.files)
        })
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.detail || "Failed to update subtask");

      const subtask = updatedTask.subtasks.find(st => st.id === subtaskId);
      toast.success(`Subtask ${subtask?.completed ? 'completed' : 'not completed'}!`);
    } catch (err) {
      toast.error(err.message || "Failed to update subtask");
      fetchTaskDetails(); // Refresh on error
    }
  }, [task, userId]);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file || !task) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploaded_by", `${LS.get("name")} (${LS.get("position")})`);

      const res = await fetch(`${ipadr}/task/${task.id}/files`, {
        method: "POST",
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      const uploadedFile = data.file;

      const updatedTask = {
        ...task,
        files: [...(task.files || []), uploadedFile]
      };

      setTask(updatedTask);
      toast.success("File uploaded successfully!");
    } catch (err) {
      toast.error(err.message);
      fetchTaskDetails(); // Refresh on error
    }

    event.target.value = "";
  }, [task]);

  const updateTaskStatus = async (newStatus) => {
    if (!task) return;

    const mapColumnToStatus = (column) => {
      switch (column) {
        case "todo": return "Pending";
        case "in-progress": return "In Progress";
        case "completed": return "Completed";
        default: return "Pending";
      }
    };

    try {
      const requestBody = {
        taskid: task.id,
        userid: userId,
        updated_task: Array.isArray(task.task) ? task.task[0] : task.task,
        status: mapColumnToStatus(newStatus),
        due_date: task.due_date,
        priority: task.priority,
        subtasks: normalizeSubtasks(task.subtasks),
        comments: normalizeComments(task.comments),
        files: normalizeFiles(task.files)
      };

      const response = await fetch(`${ipadr}/edit_task`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to update task status");
      }

      setTask(prev => ({ ...prev, status: newStatus }));
      toast.success(`Task moved to ${statusColumns.find(col => col.id === newStatus)?.title}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading task details...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Task not found</div>
      </div>
    );
  }

  const isCompleted = task.status === 'completed';
  const dueDateStatus = getDueDateStatus ? getDueDateStatus(task.due_date, isCompleted) : null;

  return (
    <div className="min-h-screen bg-gray-50 ">

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">

        {/* Due Date Alert */}
        {dueDateStatus && (
          <div className={`flex items-center gap-3 mb-6 px-4 py-3 rounded-lg border-2 ${dueDateStatus.className}`}>
            {dueDateStatus.icon}
            <span className="font-semibold">{dueDateStatus.message}</span>
            {dueDateStatus.status === 'overdue' && (
              <FaExclamationTriangle className="text-red-600 ml-auto animate-pulse" size={20} />
            )}
          </div>
        )}

        {/* Task Header */}
        <div className="mb-1">
            <div className="flex items-center justify-between mb-4">

          <h1 className="text-3xl font-bold text-gray-800 mb-4">{task.task}</h1>

           <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Tasks</span>
          </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FaUser className="text-gray-400" />
              <span className="text-gray-600">Assigned by: <strong>{task.assignedBy}</strong></span>
            </div>
            
            <div className="flex items-center gap-2">
              <FaFlag className="text-gray-400" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
                {task.priority?.toUpperCase() || 'MEDIUM'} PRIORITY
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FaClock className="text-gray-400" />
              <span className={`text-gray-600 ${
                dueDateStatus?.status === 'overdue' ? 'text-red-600 font-semibold' :
                dueDateStatus?.status === 'due-today' ? 'text-orange-600 font-semibold' :
                ''
              }`}>
                Due: {task.due_date || "No due date"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Status:</span>
              <select
                value={task.status}
                onChange={(e) => updateTaskStatus(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

     {/* Main Content */}
<div className="max-w-7xl mx-auto p-6 overflow-y-hidden">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    {/* Subtasks Section */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FaCheckCircle className="text-blue-600" /> Subtasks
      </h2>

      <div className="flex-1 space-y-3 mb-4 overflow-y-auto max-h-[350px]">
        {task.subtasks.length ? (
          task.subtasks.map((subtask, index) => (
            <div
              key={`subtask-${subtask.id}-${index}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <button
                onClick={() => toggleSubtask(subtask.id)}
                className={`text-lg transition-colors ${
                  subtask.completed
                    ? "text-green-500 hover:text-green-600"
                    : "text-gray-400 hover:text-gray-500"
                }`}
              >
                {subtask.completed ? <FaCheckCircle /> : <FaRegCircle />}
              </button>
              <span
                className={`flex-1 transition-all break-words whitespace-pre-wrap line-clamp-5
                   ${
                  subtask.completed
                    ? "line-through text-gray-500"
                    : "text-gray-800"
                }`}
              >
                {subtask.text}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No subtasks yet</p>
        )}
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          placeholder="Add a new subtask..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSubtask();
            }
          }}
        />
        <button
          onClick={addSubtask}
          disabled={!newSubtask.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPlus />
          Add Subtask
        </button>
      </div>
    </div>

    {/* Files Section */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FaPaperclip className="text-green-600" /> Files & References
      </h2>

      <div className="flex-1 space-y-3 mb-4 overflow-y-auto max-h-[350px]">
        {(task.files || []).length ? (
          task.files.map((file, index) => (
            <div
              key={`file-${file.id}-${index}`}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FaPaperclip className="text-gray-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(file.uploadedAt).toLocaleString()} •{" "}
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <span className="text-xs text-blue-600 font-medium">
                    {file.uploadedBy || "Unknown"}
                  </span>
                </div>
              </div>
              <a
                href={`${ipadr}/task/${task.id}/files/${file.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors p-2"
                title="Download file"
              >
                <FaDownload />
              </a>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No files uploaded yet</p>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>

    {/* Comments Section */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">💬 Discussion</h2>

      <div className="flex-1 space-y-3 mb-4 overflow-y-auto max-h-[350px]">
        {task.comments.length ? (
          task.comments.map((comment, index) => (
            <div
              key={`comment-${comment.id}-${index}`}
              className="p-4 bg-gray-50 rounded-lg break-words border border-gray-200"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm text-gray-800">
                  {comment.user}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">
                {comment.text}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Start the discussion!
          </p>
        )}
      </div>

      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Write a comment..."
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-24"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            addComment();
          }
        }}
      />
      <button
        onClick={addComment}
        disabled={!newComment.trim()}
        className="w-full mt-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </div>
  </div>
</div>

      </div>

  );
};

export default TaskDetailsPage;