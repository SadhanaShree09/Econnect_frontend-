import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
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

const mapStatusToColumn = (status) => {
  if (!status) return "todo";
  const statusLower = status.toLowerCase();
  if (statusLower === "pending" || statusLower === "todo" || statusLower === "to do") return "todo";
  if (statusLower === "in progress" || statusLower === "in-progress" || statusLower === "ongoing") return "in-progress";
  if (statusLower === "completed" || statusLower === "done" || statusLower === "complete") return "completed";
  return "todo";
};

const TaskProgress = () => {
  // Utility to always format date as yyyy-mm-dd
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const parts = dateStr.split(/[-\/]/);
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  };
  const navigate = useNavigate();
  const headerRef = useRef(null);

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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Auto-detect role
  const userRole = LS.get("role") || "employee"; // fallback to employee
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
    const dueStr = formatDate(String(dueDate).slice(0, 10));
    const due = new Date(dueStr + 'T00:00:00');
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
        throw new Error(errorData.detail || "Failed to fetch tasks");
      }
      const data = await response.json();
      // Remove self-assigned tasks
      const filteredData = data.filter(task => task.userid !== userId && task.assigned_to_id !== userId);
      // Group tasks by employee
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
  }, [userId]);

  const updateTaskStatus = async (taskId, newStatus) => {
    const allTasks = employeeTasks.flatMap(emp => emp.tasks);
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    // Prevent status changes for verified tasks
    if (task.verified) {
      toast.error('This task is verified and cannot be moved. Unverify first to change status.');
      return;
    }
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

  // Keep a CSS variable with the header height so scrollable areas can account for it
  useEffect(() => {
    const setHeaderVar = () => {
      const h = headerRef.current ? headerRef.current.offsetHeight : 0;
      document.documentElement.style.setProperty('--tp-header-height', `${h}px`);
    };
    setHeaderVar();
    window.addEventListener('resize', setHeaderVar);
    return () => window.removeEventListener('resize', setHeaderVar);
  }, [showProgress, searchTerm, filters]);

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
    // First, filter tasks for each employee
    let filtered = employeeTasks.map(emp => {
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
        if (filters.status !== 'all') {
  if (filters.status === 'verified') {
    // show only verified tasks
    if (!task.verified) return false;
  } else {
    // normal status filter
    if (task.status !== filters.status) return false;
  }
}

        // Fix: Normalize priority to lowercase for comparison
        if (filters.priority !== 'all' && String(task.priority).toLowerCase() !== filters.priority) {
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
    });

    // Fix: If searching for employee or task, only show employees with matches
    if (searchTerm) {
      // Only show employees with at least one matching task or name
      filtered = filtered.filter(emp => {
        const empName = typeof emp.employeeName === "string" ? emp.employeeName : "";
        const matchesEmployee = empName.toLowerCase().includes(searchTerm.toLowerCase());
        return emp.tasks.length > 0 || matchesEmployee;
      });
      // If only one employee matches by name, show only that employee
      const matchingByName = filtered.filter(emp => {
        const empName = typeof emp.employeeName === "string" ? emp.employeeName : "";
        return empName.toLowerCase().includes(searchTerm.toLowerCase());
      });
      if (matchingByName.length === 1) {
        filtered = matchingByName;
      }
    } else {
      // If not searching, only show employees with tasks (or all if filter allows)
      filtered = filtered.filter(emp => emp.tasks.length > 0 || filters.employee === 'all');
    }
    return filtered;
  }, [employeeTasks, filters, searchTerm]);

  // Navigation logic based on role
  const openTaskDetail = (task) => {
    // Prevent opening edit/detail if task is verified and the user would attempt edits
    if (task.verified) {
      // allow viewing details but block edit actions within those pages; still navigate to show the badge
    }
    if (LS.get("position") === "Manager") {
      navigate(`/User/manager-task-detail/${task.taskid}`, { state: { task } });
    } else {
       navigate(`/User/hr-task-detail/${task.taskid}`, { state: { task } });
    }
  };

  const handleAssignTask = () => {
    if (LS.get("position") === "Manager") {
       navigate(`/User/employee-task-assign`);
    } else {
     navigate(`/User/manager-task-assign`);
    }
  };

  // Make expansion single-selection: selecting an employee opens its detail in the right pane
  const toggleEmployeeExpansion = (employeeId) => {
    setSelectedEmployeeId(prev => prev === employeeId ? null : employeeId);
    setExpandedEmployees(() => new Set([employeeId]));
  };

  // When the filtered employee list changes, ensure there is a sensible default selection
  useEffect(() => {
    if (!selectedEmployeeId && filteredEmployeeTasks && filteredEmployeeTasks.length > 0) {
      setSelectedEmployeeId(filteredEmployeeTasks[0].employeeId);
      setExpandedEmployees(new Set([filteredEmployeeTasks[0].employeeId]));
    }
  }, [filteredEmployeeTasks]);

  // Task Card (shared)
  const TaskCard = ({ task, employeeName }) => {
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
          <h4 className="font-semibold text-gray-800 text-sm leading-tight pr-2 flex-1 line-clamp-2 break-words">{task.task}</h4>
          <div className="flex flex-col gap-1 items-end">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              task.status === 'todo' ? 'bg-red-200 text-red-700' :
              task.status === 'in-progress' ? 'bg-blue-200 text-blue-700' :
              'bg-green-200 text-green-700'
            }`}>
              {statusColumns.find(col => col.id === task.status)?.title}
            </span>
            {task.verified && (
              <span className="mt-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-700 text-white">
                Verified
              </span>
            )}
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
              Due: {task.due_date ? formatDate(task.due_date) : ''}
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
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
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
      {/* Header (sticky, compact) */}
      <div ref={headerRef} className="bg-white shadow-sm border-b border-gray-200 p-4 shrink-0">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{(LS.get("position") === "HR") ? "Manager Task Progress" : "Employee Task Progress"}</h2>
            <p className="text-gray-600 mt-1">Monitor and manage all {(LS.get("position") === "HR")  ? "manager" : "employee"} task progress</p>
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
  <div className="relative mb-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-2 border border-blue-200 shadow-md overflow-hidden">
    {/* Header with inline progress */}
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <FaChartLine className="text-lg text-blue-600" />
        <h3 className="text-base font-semibold text-gray-800 leading-snug">
          Team Performance Overview
        </h3>
      </div>
      {/* Compact progress bar */}
      <div className="flex flex-col items-end w-28">
        <span className="text-[11px] font-medium text-gray-700 mb-0.5">
          {overallStats.completed}/{overallStats.total} done
        </span>
        <div className="w-full bg-gray-300 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${overallStats.completionRate}%` }}
          ></div>
        </div>
      </div>
    </div>

    {/* Compact grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-center">
      <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
        <div className="text-lg font-bold text-blue-700 leading-none">
          {overallStats.totalEmployees}
        </div>
        <div className="text-[11px] font-medium text-blue-600">
          {(LS.get("position") === "HR") ? "Managers" : "Employees"}
        </div>
      </div>
      <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
        <div className="text-lg font-bold text-gray-700 leading-none">
          {overallStats.total}
        </div>
        <div className="text-[11px] font-medium text-gray-600">Tasks</div>
      </div>
      <div className="bg-red-50 p-2 rounded-lg border border-red-200">
        <div className="text-lg font-bold text-red-700 leading-none">
          {overallStats.todo}
        </div>
        <div className="text-[11px] font-medium text-red-600">To Do</div>
      </div>
      <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
        <div className="text-lg font-bold text-blue-700 leading-none">
          {overallStats.inProgress}
        </div>
        <div className="text-[11px] font-medium text-blue-600">In Progress</div>
      </div>
      <div className="bg-green-50 p-2 rounded-lg border border-green-200">
        <div className="text-lg font-bold text-green-700 leading-none">
          {overallStats.completed}
        </div>
        <div className="text-[11px] font-medium text-green-600">Completed</div>
      </div>
      <div className="bg-red-50 p-2 rounded-lg border border-red-200">
        <div className="text-lg font-bold text-red-700 leading-none">
          {overallStats.overdue}
        </div>
        <div className="text-[11px] font-medium text-red-600">Overdue</div>
      </div>
      <div className="bg-green-50 p-2 rounded-lg border border-green-200">
        <div className="text-lg font-bold text-green-700 leading-none">
          {overallStats.highPriority}
        </div>
        <div className="text-[11px] font-medium text-green-600">High Priority</div>
      </div>
      <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-200">
        <div className="text-lg font-bold text-indigo-700 leading-none">
          {overallStats.completionRate}%
        </div>
        <div className="text-[11px] font-medium text-indigo-600">Progress</div>
      </div>
    </div>
  </div>
)}

        {/* Filters and Search (compact) */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-2 rounded-xl border border-gray-200 shadow-sm">
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
                  className="pl-10 pr-3 py-1.5 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="verified">Verified</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                className="w-full p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                className="w-full px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Master-Detail: Left = compact employee list, Right = selected employee detail */}
      <div className="p-4">
        <div className="flex gap-6 h-[calc(100vh-var(--tp-header-height)-16px)] overflow-hidden">
          {/* Left column: compact scrollable employee list */}
          <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 border-b">
              <h4 className="text-sm font-semibold text-gray-700">Team</h4>
              <p className="text-xs text-gray-500">Select an employee to view tasks progress</p>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - var(--tp-header-height) - 40px)' }}>
              {filteredEmployeeTasks.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No employees</div>
              ) : (
                filteredEmployeeTasks.map(emp => {
                  const isSelected = emp.employeeId === selectedEmployeeId;
                  const empStats = {
                    total: emp.tasks.length,
                    completed: emp.tasks.filter(t => t.status === 'completed').length
                  };
                  return (
                    <div
                      key={emp.employeeId}
                      onClick={() => { setSelectedEmployeeId(emp.employeeId); setExpandedEmployees(new Set([emp.employeeId])); }}
                      className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                        <FaUserTie />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-800">{emp.employeeName}</div>
                            <div className="text-xs text-gray-500">{emp.tasks.length} tasks</div>
                          </div>
                          <div className="text-xs text-gray-500">{empStats.completed}/{empStats.total}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right column: selected employee detail */}
          <div className="flex-1 overflow-hidden">
            {(!selectedEmployeeId) ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">Select an employee to view tasks</div>
            ) : (
              (() => {
                const selected = filteredEmployeeTasks.find(e => e.employeeId === selectedEmployeeId) || filteredEmployeeTasks[0];
                if (!selected) return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">No tasks found</div>;
                const employeeStats = {
                  total: selected.tasks.length,
                  completed: selected.tasks.filter(t => t.status === 'completed').length,
                  inProgress: selected.tasks.filter(t => t.status === 'in-progress').length,
                  overdue: selected.tasks.filter(t => {
                    if (!t.due_date || t.status === 'completed') return false;
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const dueDate = new Date(t.due_date);
                    dueDate.setHours(0,0,0,0);
                    return dueDate < today;
                  }).length,
                  progress: selected.tasks.length > 0 ? Math.round((selected.tasks.filter(t => t.status === 'completed').length / selected.tasks.length) * 100) : 0
                };
                return (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-1 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <FaUserTie className="text-white text-lg" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{selected.employeeName}</h3>
                            <p className="text-blue-600 font-medium text-sm">{selected.tasks.length} assigned tasks</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="font-bold text-green-700">{employeeStats.completed}</div>
                            <div className="text-green-600 text-sm">Completed</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-blue-700">{employeeStats.inProgress}</div>
                            <div className="text-gray-600 text-sm">In Progress</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-red-700">{employeeStats.overdue}</div>
                            <div className="text-gray-600 text-sm">Overdue</div>
                          </div>
                          {/* <div className="text-center">
                            <div className="font-bold text-gray-700">{employeeStats.progress}%</div>
                            <div className="text-gray-600">Progress</div>
                        </div> */}
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
                      </div>
                    </div>
                    <div className="p-4">
                      {selected.tasks.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <FaClipboardList className="text-3xl mx-auto mb-2 opacity-50" />
                          <p>No tasks for this {(LS.get("position") === "Manager")  ? "manager" : "employee"} matching current filters</p>
                        </div>
                      ) : (
                        <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - var(--tp-header-height) - 80px)' }}>
                          {selected.tasks.map((task) => (
                            <TaskCard key={task.id} task={task} employeeName={selected.employeeName} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskProgress;
