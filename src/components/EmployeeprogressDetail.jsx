import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  FaTrashAlt, FaEdit, FaCheckCircle, FaRegCircle, FaTimes, FaPaperclip, 
  FaDownload, FaUser, FaFlag, FaExclamationTriangle, FaClock, FaEye, 
  FaComments, FaTasks, FaSearch, FaFilter, FaChevronDown, FaChevronUp,
  FaCalendarAlt, FaUserTie, FaClipboardList, FaChartLine, FaPlus, FaArrowLeft,
  FaSave, FaUpload
} from "react-icons/fa";
import { LS, ipadr } from "../Utils/Resuse";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmployeeprogressDetail = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [taskEdit, setTaskEdit] = useState({
    isEditing: false,
    title: "",
    priority: "",
    dueDate: ""
  });
  const fileInputRef = useRef(null);

  const statusColumns = [
    { id: "todo", title: "To Do", color: "bg-red-100", borderColor: "border-red-300" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-50", borderColor: "border-blue-300" },
    { id: "completed", title: "Completed", color: "bg-green-50", borderColor: "border-green-300" },
  ];

  const priorityColors = {
    low: "text-green-600 bg-green-100",
    medium: "text-yellow-600 bg-yellow-100",
    high: "text-red-600 bg-red-100"
  };

  const normalizeFiles = (files = []) =>
    (files || []).map(f => ({
      id: String(f.id),
      name: String(f.name || f.filename || ""),
      stored_name: String(f.stored_name || f.storedName || ""), 
      path: String(f.path || ""),                              
      size: Number(f.size || 0),
      type: String(f.type || f.mimeType || ""),
      uploadedAt: new Date(f.uploadedAt || f.uploaded_at || Date.now()).toISOString(),
      uploadedBy: String(f.uploadedBy || f.uploaded_by || "Unknown")
    }));

  const normalizeSubtasks = (subtasks = []) =>
  subtasks.map(s => ({
    id: s.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
    text: String(s.text || s.title || ""),
    completed: Boolean(s.completed ?? s.done ?? false)
  }));

  const normalizeComments = (comments) =>
    comments.map(c => ({
      id: Number(c.id),
      user: String(c.user),
      text: String(c.text),
      timestamp: new Date(c.timestamp).toISOString()
    }));

  const mapColumnToStatus = (column) => {
    switch (column) {
      case "todo": return "Pending";
      case "in-progress": return "In Progress";
      case "completed": return "Completed";
      default: return "Pending";
    }
  };

  const mapStatusToColumn = (status) => {
    if (!status) return "todo";
    const statusLower = status.toLowerCase();
    
    if (statusLower === "pending" || statusLower === "todo" || statusLower === "to do") return "todo";
    if (statusLower === "in progress" || statusLower === "in-progress" || statusLower === "ongoing") return "in-progress";
    if (statusLower === "completed" || statusLower === "done" || statusLower === "complete") return "completed";
    
    return "todo";
  };

  const getDueDateStatus = (dueDate, isCompleted = false) => {
    if (!dueDate || isCompleted) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
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

  const fetchTaskDetails = useCallback(async () => {
    setLoading(true);
    try {
      const managerName = LS.get("name");
      const queryParams = new URLSearchParams({
        manager_name: managerName
      });
      
      const response = await fetch(`${ipadr}/manager_tasks?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch task details");
      }

      const data = await response.json();

       console.log("API Response:", data);
    console.log("Looking for taskId:", taskId, "type:", typeof taskId);
    console.log("Available task IDs:", data.map(t => ({ 
      id: t.id, 
      taskid: t.taskid,
      task: t.task 
    })));
    
      const taskData = data.find(t => String(t.taskid) === String(taskId));
      
      if (!taskData) {
        throw new Error("Task not found");
      }

      const formattedTask = {
        ...taskData,
        id: taskData.taskid || taskData.id,
        status: mapStatusToColumn(taskData.status),
        subtasks: (taskData.subtasks || []).map((s, idx) => ({
          id: s.id || `${taskData.taskid}-${idx}`,
          text: s.text || s.title || "",
          completed: s.completed ?? s.done ?? false
        })),
        comments: taskData.comments || [],
        files: taskData.files || [],
        assignedBy: taskData.assigned_by || "You",
        assignedTo: taskData.assigned_to_name || taskData.employee_name || "Unknown Employee",
        priority: taskData.priority || "medium",
        createdDate: taskData.created_date || taskData.date,
        employee_name: taskData.assigned_to_name || taskData.employee_name || "Unknown Employee",
        assigned_to_id: taskData.assigned_to_id || taskData.userid
      };

      setTask(formattedTask);
      setTaskEdit({
        isEditing: false,
        title: formattedTask.task,
        priority: formattedTask.priority || "medium",
        dueDate: formattedTask.due_date || ""
      });
    } catch (error) {
      toast.error(error.message);
      navigate('/User/manager-task-detail/:taskId');
    } finally {
      setLoading(false);
    }
  }, [taskId, navigate]);

  // Add manager comment
  const addManagerComment = useCallback(async () => {
    if (!newComment.trim() || !task) return;

    const newEntry = {
      id: Date.now(),
      user: `${LS.get("name")} (Manager)`,
      text: newComment,
      timestamp: new Date().toISOString(),
      isManager: true
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
          userid: task.assigned_to_id || task.userid,
          comments: normalizeComments(updatedTask.comments),
          subtasks: normalizeSubtasks(updatedTask.subtasks),
          files: normalizeFiles(updatedTask.files)
        })
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.detail || "Failed to save comment");
      toast.success("Manager comment added!");
    } catch (err) {
      toast.error(err.message);
      fetchTaskDetails();
    }
  }, [newComment, task, fetchTaskDetails]);

  // Add manager subtask
  const addManagerSubtask = useCallback(async () => {
    if (!newSubtask.trim() || !task) return;

    const newEntry = {
      // id: Date.now(),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newSubtask,
      completed: false
    };

    const updatedTask = {
      ...task,
      subtasks: [...task.subtasks, newEntry]
    };

    setTask(updatedTask);
    setNewSubtask("");

    try {
      const res = await fetch(`${ipadr}/edit_task`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskid: updatedTask.id,
          userid: task.assigned_to_id || task.userid,
          subtasks: normalizeSubtasks(updatedTask.subtasks),
          comments: normalizeComments(updatedTask.comments),
          files: normalizeFiles(updatedTask.files)
        })
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.detail || "Failed to add subtask");
      toast.success("Subtask added successfully!");
    } catch (err) {
      toast.error(err.message);
      fetchTaskDetails();
    }
  }, [newSubtask, task, fetchTaskDetails]);

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile || !task) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("uploaded_by", "Manager");

      const res = await fetch(`${ipadr}/task/${task.id}/files`, {
        method: "POST",
        body: formData
      });
      
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.detail || "Failed to upload file");

      toast.success("File uploaded successfully!");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh task details to get updated files
      await fetchTaskDetails();
    } catch (err) {
      toast.error(err.message || "File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const updateTaskStatus = async (newStatus) => {
    if (!task) return;

    try {
      const res = await fetch(`${ipadr}/edit_task`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskid: task.id,
          userid: task.assigned_to_id || task.userid,
          updated_task: task.task,
          status: mapColumnToStatus(newStatus),
          due_date: task.due_date,
          priority: task.priority,
          subtasks: normalizeSubtasks(task.subtasks),
          comments: normalizeComments(task.comments),
          files: normalizeFiles(task.files)
        })
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.detail || "Failed to update task status");

      setTask(prev => ({ ...prev, status: newStatus }));
      toast.success(`Task moved to ${statusColumns.find(col => col.id === newStatus)?.title}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateTaskDetails = useCallback(async () => {
    if (!task) return;

    try {
      const res = await fetch(`${ipadr}/edit_task`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskid: task.id,
          userid: task.assigned_to_id || task.userid,
          updated_task: taskEdit.title,
          priority: taskEdit.priority,
          due_date: taskEdit.dueDate,
          status: mapColumnToStatus(task.status),
          subtasks: normalizeSubtasks(task.subtasks),
          comments: normalizeComments(task.comments),
          files: normalizeFiles(task.files)
        })
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.detail || "Failed to update task");

      setTask(prev => ({
        ...prev,
        task: taskEdit.title,
        priority: taskEdit.priority,
        due_date: taskEdit.dueDate
      }));
      
      setTaskEdit(prev => ({ ...prev, isEditing: false }));
      toast.success("Task updated successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  }, [task, taskEdit]);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId, fetchTaskDetails]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading task details...</div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Task not found</h3>
          <button
            onClick={() => navigate('/User/manager-employee')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = task.status === 'completed';
  const dueDateStatus = getDueDateStatus(task.due_date, isCompleted);

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
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/User/manager-employee')}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-800">Task Details</h1>
        </div>

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
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">

            <div className="flex items-center gap-2">
             
              <span> <strong>{task.task}</strong></span>
            </div>
            
            <div className="flex items-center gap-2">
              <FaUser className="text-blue-200" />
              <span>Assigned to: <strong>{task.assignedTo}</strong></span>
            </div>
            
            <div className="flex items-center gap-2">
              <FaFlag className="text-blue-200" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
                {task.priority?.toUpperCase() || 'MEDIUM'} PRIORITY
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FaClock className="text-blue-200" />
              <span className={dueDateStatus?.status === 'overdue' ? 'text-red-300 font-semibold' : ''}>
                Due: {task.due_date || "No due date"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <select
                value={task.status}
                onChange={(e) => updateTaskStatus(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
       <div className="max-w-7xl mx-auto p-6 h-[calc(90vh-100px)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch h-full">
          {/* Left Column - Subtasks */}
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-blue-600" />
              Subtasks Progress
            </h3>
            
             <div className="flex-1 space-y-3 mb-4 overflow-y-auto max-h-[350px]">
                         {task.subtasks.map((subtask, index) => (
                           <div key={`subtask-${subtask.id}-${index}`} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                               <div className="flex gap-3 flex-1 min-w-0">
                                    <span className={`text-lg ${subtask.completed ? 'text-green-500' : 'text-gray-400'}`}>
                                {subtask.completed && <FaCheckCircle />}
                              </span>
                            <p className="text-sm text-gray-800 break-words whitespace-normal min-w-0">
                                {subtask.text}
                              </p>
                              </div>
           
                             <span className={`text-xs px-2 py-1 rounded-full ${
                               subtask.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                             }`}>
                               {subtask.completed ? 'Complete' : 'Pending'}
                             </span>
                           </div>
                         ))}
                         {task.subtasks.length === 0 && (
                           <p className="text-gray-500 text-center py-8">No subtasks created yet</p>
                         )}
                       </div>

            {/* Add Subtask */}
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a new subtask..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addManagerSubtask();
                    }
                  }}
                />
                <button
                  onClick={addManagerSubtask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FaPlus /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Comments */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaComments className="text-red-600" />
              Task Discussion
            </h3>
            
             <div className="flex-1 space-y-3 mb-4 overflow-y-auto max-h-[350px]">
              {task.comments.map((comment, index) => (
                <div key={`comment-${comment.id}-${index}`} className={`p-3 rounded-lg ${
                  comment.isManager || comment.user.includes('Manager') 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : 'bg-gray-50'
                } break-words`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium text-sm ${
                      comment.isManager || comment.user.includes('Manager') 
                        ? 'text-blue-800' 
                        : 'text-gray-800'
                    }`}>
                      {comment.user}
                      {comment.isManager || comment.user.includes('Manager') ? (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Manager</span>
                      ) : (
                        <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Employee</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleDateString()} {new Date(comment.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
              ))}
              {task.comments.length === 0 && (
                <p className="text-gray-500 text-center py-8">No discussion yet. Start the conversation!</p>
              )}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a manager comment or feedback..."
                  className="flex-1 p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      addManagerComment();
                    }
                  }}
                />
                <button
                  onClick={addManagerComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors self-end"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        

        {/* Files Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaPaperclip className="text-green-600" />
            Files & References
          </h3>

          {/* Existing Files */}
         <div className="flex-1 space-y-3 mb-4 overflow-y-auto max-h-[350px]">
            {task.files.map((file, index) => (
              <div key={`file-${file.id}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FaPaperclip className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                      {file.name}
                      {file.uploadedBy === "Manager" && (
                        <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                          Manager
                        </span>
                      )}
                      {file.uploadedBy === "Employee" && (
                        <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">
                          Employee
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(file.uploadedAt).toLocaleString()} • {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <a 
                  href={`${ipadr}/task/${task.id}/files/${file.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded"
                >
                  <FaDownload />
                </a>
              </div>
            ))}
            {task.files.length === 0 && (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <FaPaperclip className="text-4xl mx-auto mb-2 opacity-50" />
                <p>No files uploaded yet</p>
              </div>
            )}
          </div>

          {/* File Upload Section */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full sm:w-2/3 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
                className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                  selectedFile && !uploading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload />
                    Upload
                  </>
                )}
              </button>
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default EmployeeprogressDetail;