import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { 
  FaTrashAlt, FaEdit, FaCheckCircle, FaRegCircle, FaTimes, FaPaperclip, 
  FaDownload, FaUser, FaFlag, FaExclamationTriangle, FaClock, FaEye, 
  FaComments, FaTasks, FaSearch, FaFilter, FaChevronDown, FaChevronUp,
  FaCalendarAlt, FaUserTie, FaClipboardList, FaChartLine, FaPlus
} from "react-icons/fa";
import { LS, ipadr } from "../Utils/Resuse";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from "moment";

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

const normalizeSubtasks = (subtasks) =>
  subtasks.map(s => ({
    title: String(s.text || s.title || ""),
    done: Boolean(s.completed)
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

const EmployeeTaskProgress = () => {
  const navigate = useNavigate();
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [filters, setFilters] = useState({
    employee: 'all',
    status: 'all',
    priority: 'all',
    dateRange: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEmployees, setExpandedEmployees] = useState(new Set());

  const userId = LS.get("id");

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

  const fetchEmployeeTasks = useCallback(async () => {
    setLoading(true);
    try {
      const managerName = LS.get("name");
      const queryParams = new URLSearchParams({
        manager_name: managerName
      });
      
      const response = await fetch(`${ipadr}/manager_tasks?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch employee tasks");
      }

      const data = await response.json();
      
      const managerId = LS.get("id");
      const filteredData = data.filter(task => task.userid !== managerId && task.assigned_to_id !== managerId);
      
      const groupedTasks = filteredData.reduce((acc, task) => {
        const employeeId = task.assigned_to_id || task.userid;
        const employeeName = task.assigned_to_name || task.employee_name || "Unknown Employee";
        
        if (!acc[employeeId]) {
          acc[employeeId] = {
            employeeId,
            employeeName,
            tasks: []
          };
        }
        
        const formattedTask = {
          ...task,
          id: task.taskid || task.id,
          status: mapStatusToColumn(task.status),
          subtasks: (task.subtasks || []).map((s, idx) => ({
            id: s.id || `${task.taskid}-${idx}`,
            text: s.text || s.title || "",
            completed: s.completed ?? s.done ?? false
          })),
          comments: task.comments || [],
          files: task.files || [],
          assignedBy: task.assigned_by || "You",
          assignedTo: employeeName,
          priority: task.priority || "medium",
          createdDate: task.created_date || task.date,
          employee_name: employeeName,
          assigned_to_id: employeeId
        };
        
        acc[employeeId].tasks.push(formattedTask);
        return acc;
      }, {});

      Object.values(groupedTasks).forEach(employee => {
        employee.tasks.sort((a, b) => {
          const dateA = new Date(a.createdDate || a.created_date || a.date);
          const dateB = new Date(b.createdDate || b.created_date || b.date);
          return dateB - dateA; // Newest first
        });
      });
      
      setEmployeeTasks(Object.values(groupedTasks));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const mapStatusToColumn = (status) => {
    if (!status) return "todo";
    const statusLower = status.toLowerCase();
    
    if (statusLower === "pending" || statusLower === "todo" || statusLower === "to do") return "todo";
    if (statusLower === "in progress" || statusLower === "in-progress" || statusLower === "ongoing") return "in-progress";
    if (statusLower === "completed" || statusLower === "done" || statusLower === "complete") return "completed";
    
    return "todo";
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    const allTasks = employeeTasks.flatMap(emp => emp.tasks);
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const response = await fetch(`${ipadr}/edit_task`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskid: taskId,
          userid: task.assigned_to_id,
          updated_task: task.task,
          status: mapColumnToStatus(newStatus),
          due_date: task.due_date,
          priority: task.priority,
          subtasks: normalizeSubtasks(task.subtasks),
          comments: normalizeComments(task.comments),
          files: normalizeFiles(task.files)
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to update task status");
      }

      // Update local state
      setEmployeeTasks(prev => prev.map(emp => ({
        ...emp,
        tasks: emp.tasks.map(t => 
          t.id === taskId ? { ...t, status: newStatus } : t
        ).sort((a, b) => {
          const dateA = new Date(a.createdDate || a.created_date || a.date);
          const dateB = new Date(b.createdDate || b.created_date || b.date);
          return dateB - dateA;
        })
      })));

      toast.success(`Task moved to ${statusColumns.find(col => col.id === newStatus)?.title}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchEmployeeTasks();
  }, [fetchEmployeeTasks]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const allTasks = employeeTasks.flatMap(emp => emp.tasks);
    const total = allTasks.length;
    const todo = allTasks.filter(task => task.status === 'todo').length;
    const inProgress = allTasks.filter(task => task.status === 'in-progress').length;
    const completed = allTasks.filter(task => task.status === 'completed').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = allTasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;
    
    const highPriority = allTasks.filter(task => task.priority === 'high').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      todo,
      inProgress,
      completed,
      overdue,
      highPriority,
      completionRate,
      totalEmployees: employeeTasks.length
    };
  }, [employeeTasks]);

  const filteredEmployeeTasks = useMemo(() => {
    return employeeTasks.map(emp => {
      const filteredTasks = emp.tasks.filter(task => {
        const taskText = typeof task.task === "string" ? task.task : "";
        const empName = typeof emp.employeeName === "string" ? emp.employeeName : "";

        if (
          searchTerm &&
          !taskText.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !empName.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        if (filters.status !== 'all' && task.status !== filters.status) {
          return false;
        }

        if (filters.priority !== 'all' && task.priority !== filters.priority) {
          return false;
        }

        if (filters.dateRange !== 'all') {
          const today = new Date();
          const taskDate = new Date(task.createdDate);
          const diffDays = Math.ceil((today - taskDate) / (1000 * 60 * 60 * 24));

          switch (filters.dateRange) {
            case 'today':
              if (diffDays !== 0) return false;
              break;
            case 'week':
              if (diffDays > 7) return false;
              break;
            case 'month':
              if (diffDays > 30) return false;
              break;
          }
        }

        return true;
      }).sort((a, b) => {
        const dateA = new Date(a.createdDate || a.created_date || a.date);
        const dateB = new Date(b.createdDate || b.created_date || b.date);
        return dateB - dateA;
      });

      return { ...emp, tasks: filteredTasks };
    }).filter(emp => emp.tasks.length > 0 || filters.employee === 'all');
  }, [employeeTasks, filters, searchTerm]);

  // Navigate to task detail page
  const openTaskDetail = (task) => {
     console.log("Task being passed:", task); // Add this debug line
     console.log("Task.taskid:", task.taskid);
    navigate(`/User/manager-task-detail/${task.taskid}`);
  };

  const toggleEmployeeExpansion = (employeeId) => {
    setExpandedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const handleAssignTask = () => {
    navigate(`/User/employee-task-assign`);
  };

  // Enhanced Task Card for Manager View
  const ManagerTaskCard = ({ task, employeeName }) => {
    const isCompleted = task.status === 'completed';
    const dueDateStatus = getDueDateStatus(task.due_date, isCompleted);
    const subtaskProgress = task.subtasks.length > 0 ? 
      (task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100 : 0;
    
    return (
      <div
        onClick={() => openTaskDetail(task)}
        className={`bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-lg transition-all mb-3 ${
          dueDateStatus?.status === 'overdue' ? 'border-red-300 shadow-red-100' : 
          dueDateStatus?.status === 'due-today' ? 'border-orange-300 shadow-orange-100' :
          'border-gray-200 hover:border-blue-300'
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

        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-gray-800 text-sm leading-tight pr-2 flex-1">{task.task}</h4>
          <div className="flex flex-col gap-1 items-end">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              task.status === 'todo' ? 'bg-red-200 text-red-700' :
              task.status === 'in-progress' ? 'bg-blue-200 text-blue-700' :
              'bg-green-200 text-green-700'
            }`}>
              {statusColumns.find(col => col.id === task.status)?.title}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <FaUser className="text-gray-400" />
            <span className="font-medium text-blue-600">{employeeName}</span>
          </div>
          
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
            {task.priority?.toUpperCase() || 'MEDIUM'}
          </span>
        </div>

        {task.due_date && (
          <div className="flex items-center gap-2 mb-3">
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

        {/* Progress Indicators */}
        <div className="space-y-2 mb-3">
          {task.subtasks && task.subtasks.length > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Subtask Progress</span>
                <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${subtaskProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Activity Summary */}
        <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-2">
          <span className="flex items-center gap-1">
            📅 Created: {new Date(task.createdDate).toLocaleDateString()}
          </span>
          <div className="flex gap-3">
            {task.comments && task.comments.length > 0 && (
              <span className="flex items-center gap-1">
                <FaComments /> {task.comments.length}
              </span>
            )}
            {task.files && task.files.length > 0 && (
              <span className="flex items-center gap-1">
                <FaPaperclip /> {task.files.length}
              </span>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <span className="flex items-center gap-1">
                <FaTasks /> {task.subtasks.length}
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openTaskDetail(task);
              }}
              className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
            >
              <FaEye /> View Details
            </button>
          </div>
          <select
            value={task.status}
            onChange={(e) => {
              e.stopPropagation();
              updateTaskStatus(task.id, e.target.value);
            }}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading employee tasks...</div>
        </div>
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
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Employee Task Progress</h2>
            <p className="text-gray-600 mt-1">Monitor and manage all employee task progress</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleAssignTask()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
            >
              <FaPlus />
              Assign Task
            </button>
            
            <button
              onClick={() => setShowProgress(!showProgress)}
              className={`px-6 py-3 rounded-lg transition-all duration-300 font-medium flex items-center gap-2 ${
                showProgress 
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              <FaChartLine className={`transition-transform duration-300 ${showProgress ? 'rotate-180' : ''}`} />
              {showProgress ? 'Hide Progress' : 'See Progress'}
            </button>
          </div>
        </div>

        {/* Progress Section - Conditionally Rendered */}
        {showProgress && (
          <div className="relative mb-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 shadow-lg">
            
            {/* Header with inline progress */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FaChartLine className="text-2xl text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Team Performance Overview</h3>
              </div>

              {/* Small compact progress */}
              <div className="flex flex-col items-end w-36">
                <span className="text-xs font-semibold text-gray-700 mb-1">
                  {overallStats.completed}/{overallStats.total} completed
                </span>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: `${overallStats.completionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Overall Statistics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-sm border border-blue-200 text-center">
                <div className="text-2xl font-bold text-blue-700 mb-1">{overallStats.totalEmployees}</div>
                <div className="text-sm font-medium text-blue-600">Employees</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="text-2xl font-bold text-gray-700 mb-1">{overallStats.total}</div>
                <div className="text-sm font-medium text-gray-600">Total Tasks</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl shadow-sm border border-red-200 text-center">
                <div className="text-2xl font-bold text-red-700 mb-1">{overallStats.todo}</div>
                <div className="text-sm font-medium text-red-600">To Do</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-sm border border-blue-200 text-center">
                <div className="text-2xl font-bold text-blue-700 mb-1">{overallStats.inProgress}</div>
                <div className="text-sm font-medium text-blue-600">In Progress</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl shadow-sm border border-green-200 text-center">
                <div className="text-2xl font-bold text-green-700 mb-1">{overallStats.completed}</div>
                <div className="text-sm font-medium text-green-600">Completed</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl shadow-sm border border-red-200 text-center">
                <div className="text-2xl font-bold text-red-700 mb-1">{overallStats.overdue}</div>
                <div className="text-sm font-medium text-red-600">Overdue</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl shadow-sm border border-green-200 text-center">
                <div className="text-2xl font-bold text-green-700 mb-1">{overallStats.highPriority}</div>
                <div className="text-sm font-medium text-green-600">High Priority</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl shadow-sm border border-indigo-200 text-center">
                <div className="text-2xl font-bold text-indigo-700 mb-1">{overallStats.completionRate}%</div>
                <div className="text-sm font-medium text-indigo-600">Overall Progress</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks or employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <button
                onClick={() => {
                  setFilters({ employee: 'all', status: 'all', priority: 'all', dateRange: 'all' });
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Task Lists */}
      <div className="p-6 space-y-6">
        {filteredEmployeeTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No employee tasks found</h3>
            <p className="text-gray-500">No tasks match your current filters or search criteria.</p>
          </div>
        ) : (
          filteredEmployeeTasks.map((employee) => {
            const isExpanded = expandedEmployees.has(employee.employeeId);
            const employeeStats = {
              total: employee.tasks.length,
              completed: employee.tasks.filter(t => t.status === 'completed').length,
              inProgress: employee.tasks.filter(t => t.status === 'in-progress').length,
              overdue: employee.tasks.filter(t => {
                if (!t.due_date || t.status === 'completed') return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dueDate = new Date(t.due_date);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate < today;
              }).length,
              progress: employee.tasks.length > 0 ? Math.round((employee.tasks.filter(t => t.status === 'completed').length / employee.tasks.length) * 100) : 0
            };

            return (
              <div key={employee.employeeId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Employee Header */}
                <div
                  className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-gray-200 cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-colors"
                  onClick={() => toggleEmployeeExpansion(employee.employeeId)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <FaUserTie className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{employee.employeeName}</h3>
                        <p className="text-blue-600 font-medium">{employee.tasks.length} assigned tasks</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Employee Stats */}
                      <div className="hidden md:flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-green-700">{employeeStats.completed}</div>
                          <div className="text-green-600">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-blue-700">{employeeStats.inProgress}</div>
                          <div className="text-gray-600">In Progress</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-red-700">{employeeStats.overdue}</div>
                          <div className="text-gray-600">Overdue</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-700">{employeeStats.progress}%</div>
                          <div className="text-gray-600">Progress</div>
                        </div>
                      </div>

                      {/* Progress Circle */}
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="2"
                          />
                          <path
                            d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray={`${employeeStats.progress}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{employeeStats.progress}%</span>
                        </div>
                      </div>

                      {/* Expand/Collapse Icon */}
                      {isExpanded ? (
                        <FaChevronUp className="text-blue-600 text-xl" />
                      ) : (
                        <FaChevronDown className="text-blue-600 text-xl" />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${employeeStats.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Employee Tasks */}
                {isExpanded && (
                  <div className="p-6">
                    {employee.tasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FaClipboardList className="text-4xl mx-auto mb-2 opacity-50" />
                        <p>No tasks for this employee matching current filters</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {employee.tasks.map((task) => (
                          <ManagerTaskCard 
                            key={task.id} 
                            task={task} 
                            employeeName={employee.employeeName} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EmployeeTaskProgress;