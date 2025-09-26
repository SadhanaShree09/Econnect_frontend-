import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTrashAlt, FaEdit, FaCheckCircle, FaRegCircle, FaTimes, FaPaperclip, FaDownload, FaUser, FaFlag, FaExclamationTriangle, FaClock, FaChartLine, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { LS, ipadr } from "../Utils/Resuse";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DailyProgress = memo(({ stats, isVisible, onToggle }) => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FaChartLine className="text-blue-600" size={20} />
          <span className="text-lg font-semibold text-gray-800">Daily Progress</span>
        </div>
        {isVisible ? (
          <FaChevronUp className="text-gray-500" size={16} />
        ) : (
          <FaChevronDown className="text-gray-500" size={16} />
        )}
      </button>


      {isVisible && (
        <div className="p-6 pt-0 border-t border-gray-200">
          {/* Task Statistics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-700 mb-1">{stats.total}</div>
                <div className="text-sm font-medium text-gray-600">Total Tasks</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl shadow-sm border border-red-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-700 mb-1">{stats.todo}</div>
                <div className="text-sm font-medium text-red-600">To Do</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-sm border border-blue-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-1">{stats.inProgress}</div>
                <div className="text-sm font-medium text-blue-600">In Progress</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl shadow-sm border border-green-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-1">{stats.completed}</div>
                <div className="text-sm font-medium text-green-600">Completed</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl shadow-sm border border-red-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-700 mb-1">{stats.overdue}</div>
                <div className="text-sm font-medium text-red-600">Overdue</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl shadow-sm border border-green-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-1">{stats.highPriority}</div>
                <div className="text-sm font-medium text-green-600">High Priority</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl shadow-sm border border-indigo-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-700 mb-1">{stats.completionRate}%</div>
                <div className="text-sm font-medium text-indigo-600">Completion Rate</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Daily Progress</span>
              <span className="text-sm text-gray-600">{stats.completed} of {stats.total} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

DailyProgress.displayName = 'DailyProgress';

const TaskPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [date, setDate] = useState("");
  const userId = LS.get("id");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newTask, setNewTask] = useState("");
  const [duedate, setDuedate] = useState("");
  const [draggedTask, setDraggedTask] = useState(null);
  const [showDailyProgress, setShowDailyProgress] = useState(false);

  const statusColumns = [
    { id: "todo", title: "To Do", color: "bg-red-50", borderColor: "border-red-300" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-50", borderColor: "border-blue-300" },
    { id: "completed", title: "Completed", color: "bg-green-50", borderColor: "border-green-300" },
  ];

  const priorityColors = {
    low: "text-green-600 bg-green-100",
    medium: "text-yellow-600 bg-yellow-100",
    high: "text-red-600 bg-red-100"
  };

  // Calculate task statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter(task => task.status === 'todo').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    
    // Calculate overdue tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = tasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;
    
    // Calculate high priority tasks
    const highPriority = tasks.filter(task => task.priority === 'high').length;
    
    // Calculate completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      todo,
      inProgress,
      completed,
      overdue,
      highPriority,
      completionRate
    };
  }, [tasks]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isPastDate = (selectedDate) => {
    if (!selectedDate) return false;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    return selectedDate < todayStr;
  };

  // Enhanced function to check due date status
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

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const dateFromQuery = queryParams.get("date");
    setDate(dateFromQuery || "");

    if (dateFromQuery) {
      fetchTasks(userId, dateFromQuery);
    }
  }, [location, userId]);

  const convertDateFormat = (dateString) => {
    if (!dateString) return null;
    
    // Check if it's in DD-MM-YYYY format
    if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
      const [day, month, year] = dateString.split('-');
      return `${year}-${month}-${day}`;
    }
    
    return dateString;
  };

  const fetchTasks = async (userId, selectedDate) => {
    setLoading(true);
    setErrorMessage("");
    try {
      let endpoint;

      // Employees → only manager-assigned tasks
      if (LS.get("position") === "Employee") {
        endpoint = `${ipadr}/get_manager_tasks/${userId}?date=${selectedDate}`;
      } else if (LS.get("position") === "Manager") {
        // Managers → only HR-assigned tasks, no self-assigned
        endpoint = selectedDate
          ? `${ipadr}/get_manager_hr_tasks/${userId}?date=${selectedDate}`
          : `${ipadr}/get_manager_hr_tasks/${userId}`;
      } else if (LS.get("position") === "HR") {
        // HR → only self-assigned tasks
        endpoint = selectedDate
          ? `${ipadr}/get_hr_self_tasks/${userId}?date=${selectedDate}`
          : `${ipadr}/get_hr_self_tasks/${userId}`;
      }

      const response = await fetch(endpoint);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch tasks");
      }

      const data = await response.json();

      if (data.message) {
        setTasks([]);
      } else {
        const formattedTasks = (data || []).map((t) => ({
          ...t,
          id: t.taskid || t.id,
          status: mapStatusToColumn(t.status),
          // Convert DD-MM-YYYY to YYYY-MM-DD format
          due_date: convertDateFormat(t.due_date || t.dueDate || t.due),
          subtasks: (t.subtasks || []).map((s, idx) => ({
            id: s.id || `${t.taskid}-${idx}`,
            text: s.text || s.title || "",
            completed: s.completed ?? s.done ?? false
          })),
          comments: t.comments || [],
          files: t.files || [],
          assignedBy: t.assigned_by || t.assignedBy || "Manager",
          priority: t.priority || "medium",
          createdDate: t.created_date || t.date
        }));
        setTasks(formattedTasks);
      }
    } catch (error) {
      setErrorMessage(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const mapStatusToColumn = (status) => {
    if (!status) return "todo";
    const statusLower = status.toLowerCase();
    
    // Exact matching to prevent wrong assignments
    if (statusLower === "pending" || statusLower === "todo" || statusLower === "to do") return "todo";
    if (statusLower === "in progress" || statusLower === "in-progress" || statusLower === "ongoing") return "in-progress";
    if (statusLower === "completed" || statusLower === "done" || statusLower === "complete") return "completed";
    
    // Default to todo for new tasks
    return "todo";
  };

  const mapColumnToStatus = (column) => {
    switch (column) {
      case "todo": return "Pending";
      case "in-progress": return "In Progress";
      case "completed": return "Completed";
      default: return "Pending";
    }
  };

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

  const updateTaskStatus = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const requestBody = {
        taskid: taskId,
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

      // Update the local state
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? { ...t, status: newStatus } : t
        )
      );

      toast.success(`Task moved to ${statusColumns.find(col => col.id === newStatus)?.title}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

 const addTask = async () => {
  if (newTask.trim() === "") {
    toast.error("Task cannot be empty.");
    return;
  }

  setErrorMessage("");
  try {
    const formatDDMMYYYYtoISO = (d) => {
      if (!d) return "";
      const [day, month, year] = d.split("-");
      return `${year}-${month}-${day}`;
    };

    const response = await fetch(`${ipadr}/add_task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: [newTask],
        userid: userId,
        date: formatDDMMYYYYtoISO(date),
        due_date: duedate,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to add task");
    }

    toast.success("Task added successfully!");

    // Instead of re-fetching, update tasks locally
    const newTaskObj = {
      // id: data.taskid || Date.now(),   // backend id or fallback
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      task: newTask,
      status: "todo",
      due_date: duedate,
      priority: "medium",
      assignedBy: "Self",
      createdDate: new Date().toISOString().split("T")[0],
      subtasks: [],
      comments: [],
      files: [],
    };

    setTasks((prev) => [...prev, newTaskObj]); // append new task

    setNewTask("");
    setDuedate("");
  } catch (error) {
    toast.error(error.message);
  }
};


  const handleDragStart = (e, task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTask) return;

    await updateTaskStatus(draggedTask.id, newStatus);
    setDraggedTask(null);
  };

  const openTaskDetails = (task) => {
    navigate(`/User/task/${task.id}`, {
      state: {
        task,
        userId,
        date,
        statusColumns,
        priorityColors
      }
    });
  };

  const TaskCard = ({ task }) => {
    const isCompleted = task.status === 'completed';
    const dueDateStatus = getDueDateStatus(task.due_date, isCompleted);
    
    return (
        <div
          draggable
          onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, task); }}
          onDragEnd={() => setDraggedTask(null)}
          onClick={() => openTaskDetails(task)}
          className={`bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-all mb-3 ${
            dueDateStatus?.status === 'overdue' ? 'border-red-300 shadow-red-100' : 
            dueDateStatus?.status === 'due-today' ? 'border-orange-300 shadow-orange-100' :
            'border-gray-200'
          }`}
        >
        {/* Due Date Alert Banner */}
        {dueDateStatus && (
          <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-md border ${dueDateStatus.className}`}>
            {dueDateStatus.icon}
            <span className="text-sm font-semibold">{dueDateStatus.message}</span>
            {dueDateStatus.status === 'overdue' && (
              <FaExclamationTriangle className="text-red-600 ml-auto animate-pulse" />
            )}
          </div>
        )}

        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-800 text-sm leading-tight pr-2 break-words whitespace-normal">{task.task}</h4>
          <div className="flex flex-col gap-1 items-end">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              task.status === 'todo' ? 'bg-red-200 text-red-700' :
              task.status === 'in-progress' ? 'bg-blue-200 text-blue-700' :
              'bg-green-200 text-green-700'
            }`}>
              {statusColumns.find(col => col.id === task.status)?.title}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
              {task.priority?.toUpperCase() || 'MEDIUM'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
          <FaUser className="text-gray-400" />
          <span>Assigned by: {task.assignedBy}</span>
        </div>

        {task.due_date && (
          <div className="flex items-center gap-2 mb-2">
            <p className={`text-xs flex items-center gap-1 ${
              dueDateStatus?.status === 'overdue' ? 'text-red-600 font-semibold' :
              dueDateStatus?.status === 'due-today' ? 'text-orange-600 font-semibold' :
              dueDateStatus?.status === 'due-tomorrow' ? 'text-yellow-600 font-semibold' :
              'text-gray-600'
            }`}>
              <FaClock className="text-xs" />
              Due: {task.due_date}
            </p>
          </div>
        )}

        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Subtasks</span>
              <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ 
                  width: `${task.subtasks.length > 0 ? (task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500">
          <span className="flex items-center gap-1">
            📅 {task.createdDate || task.date}
          </span>
          <div className="flex gap-2">
            {task.comments && task.comments.length > 0 && (
              <span className="flex items-center gap-1">💬 {task.comments.length}</span>
            )}
            {task.files && task.files.length > 0 && (
              <span className="flex items-center gap-1">📎 {task.files.length}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Tasks - {date || "Date not available"}
          </h2>
          <button
            onClick={() => navigate("/User/todo")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Calendar
          </button>
        </div>

        {/* Daily Progress Component */}
        <div className="mb-6">
          <DailyProgress 
            stats={stats} 
            isVisible={showDailyProgress} 
            onToggle={() => setShowDailyProgress(!showDailyProgress)} 
          />
        </div>

        {/* Add Task Form */}
        {/* {!isPastDate(date) && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                placeholder="Enter new task"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
              />
              <input
                type="date"
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                placeholder="Due date"
                value={duedate}
                onChange={(e) => setDuedate(e.target.value)}
              />
              <button
                onClick={addTask}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
              >
                Add Task
              </button>
            </div>
            {errorMessage && <p className="text-red-500 text-sm mt-3">{errorMessage}</p>}
          </div>
        )} */}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 p-6 h-[calc(100vh-200px)] overflow-x-auto">
        {statusColumns.map((column) => (
          <div
            key={column.id}
            className={`${column.color} ${column.borderColor} border-2 border-dashed rounded-xl p-4 min-w-[320px] flex-1 shadow-sm`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{column.title}</h3>
              <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-600 shadow-sm">
                {tasks.filter(task => task.status === column.id).length}
              </span>
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[calc(95vh-300px)]">
              {tasks
                .filter(task => task.status === column.id)
                .map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              
              {tasks.filter(task => task.status === column.id).length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-lg">No tasks in {column.title.toLowerCase()}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskPage;