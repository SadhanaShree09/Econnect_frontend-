import React,{useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { ipadr,LS } from "../Utils/Resuse";
import { Modal } from "./Modal";
import { createPortal } from "react-dom";
import { FaEdit } from "react-icons/fa";
import { toast,ToastContainer } from "react-toastify";
import Multiselect from 'multiselect-react-dropdown';
import { FaCheck } from "react-icons/fa"; 
import { DateRangePicker } from "react-date-range";
import { format, isWithinInterval, parseISO } from 'date-fns';
import { useParams } from 'react-router-dom';
import { ArrowUp, ArrowDown, ArrowUpDown, RotateCw } from "lucide-react";
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { useSearchParams } from 'react-router-dom';

// Note Component
const Note = ({ empdata, handleDelete, handleEdit }) => {
  return (
    <div
    className={`${
      empdata.bg ? empdata.bg : 'bg-green-300'
    } p-6 pt-12 w-[320px] min-h-[250px] relative flex flex-col 
      rounded-lg shadow-xl border-l-[10px] border-grey-500 
      transition-all duration-300 transform hover:rotate-2 hover:-translate-y-2 hover:scale-105
      hover:shadow-2xl hover:shadow-black/20 hover:z-10 animate-fade-in`}
  >
    {/* Sticky Tape Effect */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-400 opacity-30 rounded-b-lg"></div>
  
    {/* Task Details */}
    <p className="text-gray-900 font-bold text-xl mb-3 text-center">📝 Task Details</p>
    <ul className="text-gray-800 text-base space-y-2">
      <li><span className="font-semibold">Task:</span>  <p className="break-words whitespace-normal">{empdata.task}</p></li>
      <li><span className="font-semibold">Assigned Date:</span> {empdata.date}</li>
      <li><span className="font-semibold">Due Date:</span> {empdata.due_date}</li>
      <li>
        <span className="font-semibold">Status:</span> 
        <span className={`ml-2 px-3 py-1 text-xs font-bold rounded-full shadow-md 
          ${empdata.status === 'Completed' ? 'bg-green-500 text-white' : 
          empdata.status === 'Pending' ? 'bg-yellow-500 text-black' : 
          'bg-red-500 text-white'}`}>
          {empdata.status}
        </span>
      </li>
      <li>
  <span className="font-semibold">Assigned By:</span>{" "}
  {empdata.assigned_by && empdata.assigned_by !== "self"
    ? empdata.assigned_by
    : "Self"}
</li>
<li>
  
  <span className="font-semibold">Priority:</span>{" "}
  <span className={`ml-2 px-3 py-1 text-xs font-bold rounded-full shadow-md
    ${empdata.priority === "High" ? "bg-red-500 text-white" :
      empdata.priority === "Medium" ? "bg-yellow-400 text-black" :
      "bg-green-400 text-black"}`}>
    {empdata.priority}
  </span>
</li>

{empdata.subtasks.map((subtask, idx) => {
  const text = subtask.text ?? subtask.title ?? "";
  const completed = subtask.completed || false;
  
  const subtaskKey = `subtask-${empdata._id || empdata.id || empdata.taskid}-${idx}`;

  return (
    <div key={subtaskKey} className="flex items-center text-sm">
      <span className={`mr-2 ${completed ? 'text-green-500' : 'text-gray-400'}`}>
        {completed ? '✓' : '○'}
      </span>
      <span className={completed ? 'line-through text-gray-500' : ''}>
        {text}
      </span>
    </div>
  );
})}

    </ul>

{(LS.get("position") === "Manager") && (
  <div className="absolute top-2 right-4 flex gap-2">
    <button
      className="bg-green-600 text-white p-2 rounded-full shadow-lg transition-transform transform hover:scale-110 hover:-rotate-6 hover:shadow-green-500"
      onClick={() => handleEdit(empdata.taskid || empdata._id || empdata.id)}
    >
      <AiOutlineEdit className="text-xl" />
    </button>
    <button
      className="bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform transform hover:scale-110 hover:rotate-6 hover:shadow-red-500"
      onClick={() => handleDelete(empdata.taskid || empdata._id || empdata.id)}
    >
      <AiOutlineDelete className="text-xl" />
    </button>
  </div>
)}

  </div>
  );
};

const EmployeeTaskAssign=()=>{
    
  const navigate = useNavigate();
     const [employeeData, setEmployeeData] = useState([]);
     const [taskData,SetTaskData]=useState([]);
     const [loading, setLoading] = useState(false);
     const [error,setError]=useState('');
     const [currentPage, setCurrentPage] = useState(1);
     const [itemsPerPage, setItemsPerPage] = useState(5);
    const [openmodel,SetOpenmodel]=useState(false)
    const [modalOpen, setModalOpen] = useState(false);
    const [selectone,SetSelectone]=useState({});
    const [allselect,SetAllSelect]=useState({});
    const[tempdata,SetTempdata]=useState({});
    const[options,SetOptions]=useState([]);
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [assignedByFilter, setAssignedByFilter] = useState("all"); 

    const [viewMode, setViewMode] = useState('personal'); // 'personal' or 'assigned'
const [personalTasks, setPersonalTasks] = useState([]);
const [assignedTasks, setAssignedTasks] = useState([]);

const [searchParams] = useSearchParams();

  const [targetEmployee, setTargetEmployee] = useState(null);
  const [employeeTasks, setEmployeeTasks] = useState([]);

  
  const handleBackToDashboard = () => {
    navigate('/User/manager-employee');
  };

  const validateTaskForm = () => {
  const errors = [];

  const hasValidTask = modeldata.task.some(task => task.trim() !== "");
  if (!hasValidTask) {
    errors.push("Task title is required");
  }

  if (!modeldata.due_date) {
    errors.push("Due date is required");
  }
  
  if (!modeldata.priority || modeldata.priority === "") {
    errors.push("Priority is required");
  }
  
  if (isManager && selectedUsers.length === 0) {
    errors.push("Please select an employee");
  }
  
  return errors;
};
  
      const [selectedValue, setSelectedValue] = useState('');
      const [ValueSelected,SetValueSelected]=useState('');
      const [selectedUsers, setSelectedUsers] = useState([]);

      const [hrPersonalTasks, setHrPersonalTasks] = useState([]);
const [hrAssignedTasks, setHrAssignedTasks] = useState([]);

      const [showDatePicker, setShowDatePicker] = useState(false);
      const [dateRange, setDateRange] = useState([
          {
            startDate: null,
            endDate: null,
            key: "selection",
          },
        ]);
      const [filteredData, setFilteredData] = useState([]);
       const [sortConfig, setSortConfig] = useState({
          column: null,
          direction: 'asc'
        });

    const [editModel,SetEditmodel]=useState([]);

    const[modeldata,setModelData]=useState({
        task:[""],
          userid:"",
          date:"",
          due_date:"",
          TL:"",
          priority: "Medium",
          subtasks:[]
    })
    

    const isManager=LS.get('position')==="Manager"? true:false;
    const params = useParams();
    let userid = params.userid;
    
    // Handle the case where userid is the string "undefined"
    if (userid === 'undefined' || !userid) {
        userid = LS.get('id'); 
    }

     let url=''

     if(isManager) {
      url=`${ipadr}/get_assigned_task?TL=${LS.get('name')}&manager_id=${LS.get('id')}`;
     } 
  
  else {
      url=`${ipadr}/get_tasks/${userid}`
     }

     useEffect(()=>{
    fetchEmpdata();
    if(isManager) {
        users();
    } 
},[userid])
     
  const fetchEmpdata = async() => {
  try {
    setLoading(true);
    setError('');
    
    if (isManager) {
      const assignedResponse = await axios.get(`${ipadr}/get_assigned_task?TL=${LS.get('name')}`);
      const managerAssignedTasks = assignedResponse.data && Array.isArray(assignedResponse.data) ? assignedResponse.data : [];
      
      const employeeAssignedTasks = managerAssignedTasks.filter(task => task.userid !== LS.get('id'));
        setAssignedTasks(employeeAssignedTasks);
        setEmployeeData(employeeAssignedTasks);
        setFilteredData(employeeAssignedTasks);

    }  else {

      const response = await axios.get(url);
      const Empdata = response.data && Array.isArray(response.data) ? response.data : [];
      setEmployeeData(Empdata);
      setFilteredData(Empdata);
    }
    
    setLoading(false);
  } catch(error) {
    console.error("Error fetching data:", error);
    setLoading(false);
    setEmployeeData([]);
    setFilteredData([]);
    setError("Error while fetching tasks");
  }
}

useEffect(() => {
  if (isManager) {
   
      setEmployeeData(assignedTasks);
      setFilteredData(assignedTasks);
    
    setCurrentPage(1);
  } 
}, [viewMode, personalTasks, assignedTasks, hrPersonalTasks, hrAssignedTasks]);

useEffect(() => {
  const employeeId = searchParams.get('employee');
  const employeeName = searchParams.get('name');
  
  if (employeeId && employeeName) {
    setTargetEmployee({
      id: employeeId,
      name: employeeName
    });
    setSelectedUsers([{
      userid: employeeId,
      name: employeeName
    }]);
    fetchEmployeeTasks(employeeId);
  }
}, [searchParams]);

const fetchEmployeeTasks = async (employeeId) => {
  try {
    setLoading(true);
    const response = await axios.get(
      `${ipadr}/get_assigned_task?TL=${LS.get('name')}&userid=${employeeId}`
    );
    const tasks = response.data && Array.isArray(response.data) ? response.data : [];
    setEmployeeData(tasks);
    setFilteredData(tasks);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching employee tasks:", error);
    setEmployeeData([]);
    setFilteredData([]);
    setLoading(false);
  }
};
  
const handleReset = () => {
  setDateRange([{
    startDate: null,
    endDate: null,
    key: "selection"
  }]);
  
  if (isManager) {
  
      setFilteredData(assignedTasks);
    
  }  else {
    setFilteredData(employeeData);
  }
  
  setCurrentPage(1);
  setSortConfig({ column: null, direction: 'asc' });
  setShowDatePicker(false);
  SetValueSelected('');
  setPriorityFilter("all");
  setAssignedByFilter("all");
 
};

      const handleChange = (e) => {
        const {name , checked} = e.target ;
        console.log(name);

        if(name == "allSelect") {
            let tempEmp = employeeData.map(item => {
                return {...item,isChecked: checked,category:name}
            }) ;
            console.log(tempEmp);
            SetAllSelect(tempEmp);
            setEmployeeData(tempEmp) ;
        }
        else { 
            console.log("SelectOne")
            let tempUser = employeeData.map(item => item.name === name ? {...item, isChecked: checked,category: "SelectOne"} : item);
            console.log(tempUser);
            let user= Object.assign(tempUser.filter(item=>item.category==="SelectOne"));
            console.log(user)
            SetSelectone(user);
            setEmployeeData(tempUser) ;
        }
    }

    const handletaskeditChange=(e)=>{
      const { name, value } = e.target;
      console.log("name:",name,"- value:",value );

      SetEditmodel((prevData) => ({
          ...prevData,
          Task_details: prevData.Task_details.map((item, index) =>
              index === 0 ? { ...item, [name]: value } : item
          )
      }));
    }

    const handleduedateeditChange=(e)=>{
      const{value}=e.target;
      console.log(value);
      SetEditmodel({ ...editModel,due_date:value})
    }

    const handleEditmodel = (index, e) => {
      const { name, value } = e.target;
      const updatedEditModel = [...editModel];
      updatedEditModel[index] = { ...updatedEditModel[index], [name]: value };
      SetEditmodel(updatedEditModel);
    };
    
    const handleAllChange=(e,index,type)=>{
       const {name,value}=e.target;
       console.log(name +"-"+ value);
       setModelData({ ...modeldata, [name]: value });
    }

    const handleforAllChange = (e) => {
      const { name, value } = e.target;
      console.log("name:",name,"- value:",value );
      setModelData((prevData) => ({
          ...prevData,
          Task_details: prevData.Task_details.map((item, index) =>
              index === 0 ? { ...item, [name]: value } : item
          )
      }));
  };
  
  console.log("duedate:",modeldata.due_date);

    const handleButtonClick = (value) => {
  setModalOpen(false);
  SetOpenmodel(false);
  setSelectedUsers([]); 
};

      const handleTaskChange = (index, event) => {
        const newTasks = [...modeldata.task];
        newTasks[index] = event.target.value; 
        setModelData({ ...modeldata, task: newTasks, });
      };

      const today = new Date();
      const month = ("0" + (today.getMonth() + 1)).slice(-2);
      const year = today.getFullYear();
      const date = ("0" + today.getDate()).slice(-2);
      const currentDate = `${year}-${month}-${date}`;
      
      console.log("Current date:",currentDate);

const normalizeSubtasks = (subtasks) => {
  console.log("normalizeSubtasks input:", subtasks);
  
  if (!subtasks) {
    console.log("No subtasks provided");
    return [];
  }
  
  if (!Array.isArray(subtasks)) {
    console.log("Subtasks is not an array:", subtasks, "Type:", typeof subtasks);
    return [];
  }
  
  if (subtasks.length === 0) {
    console.log("Subtasks array is empty");
    return [];
  }
  
  const normalized = subtasks.map((s, index) => {
    const normalizedSubtask = {
      id: s.id || `subtask_${Date.now()}_${index}_${Math.random()}`, // Ensure unique ID
      title: s.title || s.text || "", // Prefer title, fallback to text
      text: s.text || s.title || "", // Keep both for compatibility
      completed: s.completed ?? s.done ?? false, // Prefer completed, fallback to done
      done: s.done ?? s.completed ?? false // Keep both for compatibility
    };
    
    console.log(`Normalized subtask ${index}:`, normalizedSubtask);
    return normalizedSubtask;
  });
  
  console.log("Final normalized subtasks:", normalized);
  return normalized;
};

const handleonSubmit = async () => {
  // Validate form before submission
  const validationErrors = validateTaskForm();
  if (validationErrors.length > 0) {
    validationErrors.forEach(error => toast.error(error));
    return;
  }

  let taskArr = [];

  try {
    if (isManager) {
      if (selectedUsers.length === 0) {
        toast.error("Please select at least one employee");
        return;
      }

      for (let i = 0; i < selectedUsers.length; i++) {
        const taskdetails = {
          Tasks: modeldata.task,
          userid: selectedUsers?.[i]?.userid,
          assigned_by: LS.get("name"), // Use actual name when assigning to others
          date: currentDate,
          due_date: modeldata.due_date,
          priority: modeldata.priority || "Medium",
          subtasks: normalizeSubtasks(modeldata.subtasks || []),
        };
        taskArr.push(taskdetails);
      }

      const assignMessage = selectedUsers.length > 1 
        ? `Tasks assigned to ${selectedUsers.length} employees`
        : `Task assigned to ${selectedUsers[0].name}`;
      
      console.log("taskArr:", taskArr);

      const response = await axios({
        method: "post",
        url: `${ipadr}/task_assign_to_multiple_members`,
        data: { Task_details: taskArr },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        toast.success(assignMessage);
        setModelData({
          task: [""],
          userid: "",
          date: "",
          due_date: "",
          TL: "",
          priority: "Medium",
          subtasks: [],
        });
        setSelectedUsers([]); 
      } else {
        toast.error("Error while adding the task");
      }
      setModalOpen(false);
    } else {
      const singletask = {
        task: modeldata.task,
        userid: userid,
        date: currentDate,
        due_date: modeldata.due_date,
        priority: modeldata.priority || "Medium",
        assigned_by: "self",
        subtasks: normalizeSubtasks(modeldata.subtasks || []),
      };
      
      console.log("singletask:", singletask);

      const response = await fetch(`${ipadr}/add_task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(singletask),
      });

      if (response.status === 200) {
        toast.success("Task Added successfully");
        setModelData({
          task: [""],
          userid: "",
          date: "",
          due_date: "",
          priority: "Medium",
          subtasks: [],
        });
      } else {
        toast.error("Error while adding the task");
      }
      setModalOpen(false);
    }

    fetchEmpdata();
  } catch (error) {
    console.error("Error submitting task:", error);
    toast.error("Error submitting task");
  }
};

       const deleteTask = async (taskId) => {
          if (!taskId) {
              toast.error("Invalid task ID");
              return;
          }
          
          console.log("Deleting task with ID:", taskId);
          
          try {
            const response = await fetch(`${ipadr}/task_delete/${taskId}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            });

            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.detail || "Failed to delete task");
            }

            toast.success("Task deleted successfully!");
            fetchEmpdata();
          } catch (error) {
            console.error("Error deleting task:", error);
            toast.error(error.message);
          }
        };

        const fetchTasks = async (userId, selectedDate) => {
            setLoading(true);
            console.log(selectedDate);
            try {
              const response = await fetch(
                `${ipadr}/get_tasks/${userId}/${selectedDate}`
              );
        
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to fetch tasks");
              }
        
              const data = await response.json();
              if (data.message) {
                setEmployeeData([]);
                setFilteredData([]);
              } else {
                setEmployeeData(data);
                setFilteredData(data);
              }
            } catch (error) {
              setError(error.message);
            } finally {
              setLoading(false);
            }
          };

      const handleoneditSubmit=async()=>{
        try {
            console.log("editmodel:",editModel);
            console.log("editmodel task:",editModel?.[0]?.task);
            
            if (!editModel || editModel.length === 0) {
                toast.error("No task data to update");
                return;
            }
            
            const updatedetails={
                updated_task:editModel?.[0]?.task,
                userid:editModel?.[0]?.userid,
                status:editModel?.[0]?.status,
                due_date:editModel?.[0]?.due_date,
                priority: editModel?.[0]?.priority || "Medium", 
                taskid:editModel?.[0]?._id,
                subtasks: normalizeSubtasks(editModel?.[0]?.subtasks || [])
            }
            console.log("updatedetails:",updatedetails);

            const response=await  axios({
                method: 'put',
                url: `${ipadr}/edit_task`,
                data: updatedetails, 
                headers: {
                    'Content-Type': 'application/json'
                },    
            });

            if(response.status===200) {
                toast.success("Task edited successfully");
            } else {
                toast.error("Error while editing the task");
            }
            SetOpenmodel(false);
            fetchEmpdata();
        } catch(error) {
            console.error("Error editing task:", error);
            toast.error("Error editing task");
        }
      }

const confirm = async (id) => {
  if (!id) {
    console.error("No ID provided for confirm function");
    toast.error("Invalid task ID");
    return;
  }
  
  try {
    const response = await axios.get(`${ipadr}/get_single_task/${id}`);
    const taskdetails = response.data;
    console.log("Raw taskdetails:", taskdetails);

    let actualTaskData;
    
    if (taskdetails && taskdetails.task) {
      actualTaskData = taskdetails.task;
    } else if (Array.isArray(taskdetails)) {
      actualTaskData = taskdetails[0];
    } else {
      actualTaskData = taskdetails;
    }
    
    console.log("Extracted actualTaskData:", actualTaskData);
    
    const safedetails = [{
      userid: actualTaskData.userid || '',
      task: (() => {
        if (Array.isArray(actualTaskData.task)) {
          return actualTaskData.task[0] || '';
        } else if (typeof actualTaskData.task === 'string') {
          return actualTaskData.task;
        } else if (actualTaskData.Tasks) {
          return Array.isArray(actualTaskData.Tasks) ? actualTaskData.Tasks[0] : actualTaskData.Tasks;
        }
        return '';
      })(),
      status: actualTaskData.status || 'Not Started',
      due_date: actualTaskData.due_date || '',
      priority: actualTaskData.priority || 'Medium',
      _id: actualTaskData._id || actualTaskData.id || actualTaskData.taskid || '',
      assigned_by: actualTaskData.assigned_by || '',
      assigned_to: actualTaskData.assigned_to || '',
      date: actualTaskData.date || '',
      subtasks: normalizeSubtasks(actualTaskData.subtasks || []),
      TL: actualTaskData.TL || '',
      bg: actualTaskData.bg || ''
    }];

    console.log("Final safedetails for editing:", safedetails);
    console.log("Subtasks in safedetails:", safedetails[0].subtasks);
    
    SetEditmodel(safedetails);
    SetOpenmodel(true);
    
  } catch (error) {
    console.error("Error in confirm function:", error);
    toast.error("Error fetching task details");
  }
}

      let url1='';
      let url2='';
      
      if(isManager) {
        url1=`${ipadr}/get_team_members?TL=${LS.get('name')}`;
        // url2=`${ipadr}/get_assigned_task?TL=${LS.get('name')}&userid=${ValueSelected}`
        url2=`${ipadr}/get_assigned_task?manager_name=${LS.get('name')}&userid=${ValueSelected}`

      }

      const users=async()=>{
        if (!isManager) return;
        
        try {
            const response =await axios.get(`${url1}`)
            const userdetails=response.data && Array.isArray(response.data) ? response.data:[];
            console.log("userdetails",userdetails)
            
            SetOptions(userdetails);
        } catch (error) {
            console.error("Error fetching users:", error);
            SetOptions([]);
        }
      }

      console.log("options:",options);
      
   const dropdown = async () => {
  if (isManager && ValueSelected) {
    try {
      const url = `${ipadr}/get_assigned_task?TL=${LS.get('name')}&userid=${ValueSelected}`;
      const response = await axios.get(url);
      const Empdata = Array.isArray(response.data) ? response.data : [];
      const employeeFilteredTasks = Empdata.filter(task => task.userid !== LS.get('id'));
      setFilteredData(employeeFilteredTasks);
    } catch (error) {
      console.error("Error in manager dropdown:", error);
      setFilteredData([]);
    }
  } 
};



      const [note, setNote] = useState({
        body: '',
        bg: ''
      });
      const [editNote, setEditNote] = useState();
      const [toggleForm, setToggleForm] = useState(false);
      const [toggleEditForm, setToggleEditForm] = useState(false);
    
      const handlesChange = (e) => {
        if (toggleEditForm) {
          setEditNote({ ...editNote, [e.target.name]: e.target.value });
        }
    
        if (toggleForm) {
          setNote({ ...note, [e.target.name]: e.target.value });
        }
      };

      const handleDelete = (id) => {
        const leftNotes = employeeData.filter((note) => note.id !== id);
        setEmployeeData(leftNotes);
        setFilteredData(leftNotes);
      };
      
      const handleEditSubmit = (e) => {
        e.preventDefault();
        const updatedNotes = employeeData.map((note) => (note.id === editNote.id ? editNote : note));
        setEmployeeData(updatedNotes);
        setFilteredData(updatedNotes);
        setEditNote({});
        setToggleEditForm(!toggleEditForm);
      };
 
      const handleSelectChange =(event)=>{
        setSelectedValue(event.target.value);
      };
      
      const handleSelectvalueChange = (event) => {
    SetValueSelected(event.target.value);
};
useEffect(() => {
  if ((isManager) && ValueSelected) {
    dropdown();
  }
}, [ValueSelected]);


      const addTask = () => {
        setModelData({ ...modeldata, task: [...modeldata.task, ""] });
      };
    
      const onSelect=(selectedList)=>{
        setSelectedUsers(selectedList);
        console.log("selected",selectedList);
      }
      
     const onRemove=(selectedList)=>{
      setSelectedUsers(selectedList);
      console.log("unselected:",selectedList);
     }

     const handleDateRangeChange = (ranges) => {
      const { startDate, endDate } = ranges.selection;
      setDateRange([ranges.selection]);
      filterDataByDateRange(startDate, endDate);
    };

    const filterDataByDateRange = (startDate, endDate) => {
        if (!startDate || !endDate) {
          setFilteredData(employeeData);
          return;
        }

        const filtered = employeeData.filter(item => {
          const itemDate = parseISO(convertDateFormat(item.date || item.due_date));
          return isWithinInterval(itemDate, {
            start: startDate,
            end: endDate
          });
        });

        setFilteredData(filtered);
        setCurrentPage(1);
    };

    const convertDateFormat = (dateString) => {
        if (!dateString) return '';
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
    };
          
    console.log("filter data:",filteredData);
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    console.log("currentItems:",currentItems)

    // Show loading state
    if (loading) {
        return (
            <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md h-screen overflow-y-scroll scrollbar-hide">
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl">Loading tasks...</div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md h-screen overflow-y-scroll scrollbar-hide">
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl text-red-500">Error: {error}</div>
                    <button 
                        onClick={fetchEmpdata}
                        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

     return(
      <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md h-screen overflow-y-scroll scrollbar-hide">
  <div className="">
    {/* Title and Toggle Section */}
    <div className="flex justify-between items-center mb-6">
    
    
        <h1 className="text-5xl font-semibold font-inter pb-2 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text border-b-2">
          Task Assign
        </h1>

         <button
          onClick={handleBackToDashboard}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
      
    </div>

    <div>
  
      <header className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">

        <button className="bg-blue-500 hover:bg-blue-400 hover:text-slate-900 text-white text-sm font-inter px-4 py-2 rounded-full shadow-lg" onClick={() => setModalOpen(true)}>
          Add Task
        </button>

        {/* Center: Filters */}
        <div className="flex items-center space-x-3">
      
            <select 
              className="w-48 border border-gray-400 rounded-lg px-4 py-2 text-gray-700 bg-white shadow-md outline-none focus:ring-2 focus:ring-blue-500 transition" 
              value={ValueSelected} 
              onChange={handleSelectvalueChange}
            >
              <option value="">--select Employee--</option>
              {options.map(item => (
                <option key={item.id || item.userid} value={item.userid}>{item.name}</option>
              ))}
            </select>

        </div>

        {/* Right: Reset and Date Range */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Reset
          </button>
        
        </div>
      </header>

      <div className="notes border-t-2 border-gray-200 mt-5 pt-5 container mx-auto grid md:grid-cols-4 gap-10 justify-items-center">
        {filteredData && filteredData.length > 0 ? (
          filteredData.map((item, i) => {
            return (
              <Note handleDelete={() => deleteTask(item._id || item.id || item.taskid)} handleEdit={() => confirm(item._id || item.id || item.taskid)} key={item._id || item.id || item.taskid || i} empdata={item} />
            );
          })
        ) : (
            <div className="col-span-4 text-center py-8">
                <p className="text-gray-500 text-lg">
                    {loading ? "Loading tasks..." : "No tasks found. Please add a new task."}
                </p>
            </div>
        )}
      </div>

             {modalOpen &&
        createPortal(
          <Modal
            closeModal={handleButtonClick}
            onSubmit={handleonSubmit}
            onCancel={handleButtonClick}
          >
           
           <>
           <div className="max-h-[50vh] overflow-y-auto">
           {modeldata.task.map((task, index) => (
        <div key={index} className="mb-4">
          <label className="block text-lg font-semibold text-gray-700 mb-2">Task {index + 1}</label>
          <textarea
            name={`task-${index}`}
            value={task}
            onChange={(e) => handleTaskChange(index, e)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-500"
            placeholder="Enter task description..."
          ></textarea>
        </div>
          ))}
           <button
              type="button"
              onClick={addTask}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:scale-105 transition transform mb-4"
            >
             ➕ Add Another Task
            </button>
             
            <div className="mt-4">
            <label className="block text-lg font-semibold text-gray-700 mb-2">Due date</label>
            <input
               type="date"
                name="due_date"
                value={modeldata.due_date}
                onChange={handleAllChange}
                min={new Date().toISOString().split("T")[0]} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition cursor-pointer"
                />
           </div>
           <div className="mt-4">
            <label className="block text-lg font-semibold text-gray-700 mb-2">Priority</label>
            <select
              name="priority"
              value={modeldata.priority || ""}
              onChange={(e) => setModelData({ ...modeldata, priority: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            >
             <option value="">Select Priority</option>
  <option value="High">High</option>
  <option value="Medium">Medium</option>
  <option value="Low">Low</option>
            </select>
          </div>
          <div className="mt-4">
            <label className="block text-lg font-semibold text-gray-700 mb-2">Subtasks</label>
            {modeldata.subtasks?.map((subtask, idx) => (
              <div key={idx} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={subtask.done}
                  onChange={() => {
                    const updated = [...modeldata.subtasks];
                    updated[idx].done = !updated[idx].done;
                    setModelData({ ...modeldata, subtasks: updated });
                  }}
                  className="mr-2"
                />
                <input
                  type="text"
                  value={subtask.title}
                  onChange={(e) => {
                    const updated = [...modeldata.subtasks];
                    updated[idx].title = e.target.value;
                    setModelData({ ...modeldata, subtasks: updated });
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1"
                />
              </div>
            ))}
            <button
              onClick={() =>
                setModelData({
                  ...modeldata,
                  subtasks: [...(modeldata.subtasks || []), { title: "", done: false }],
                })
              }
              className="text-blue-500 mt-2"
            >
              ➕ Add Subtask
            </button>
          </div>
   
           {
            (isManager) && (
      <div className="mt-4">
       <label className="block text-lg font-semibold text-gray-700 mb-2">
     👤 Select Employee
       </label>
        <div className="w-full max-w-sm bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm">
         <Multiselect
           options={options}
           selectedValues={selectedUsers}
           onSelect={onSelect}
           onRemove={onRemove}
           displayValue="name"
           className="text-gray-700"
           />
           </div>
         </div>
            )

           }
              </div>
            </>
          </Modal>,
          document.body
        )}

  {openmodel &&
  createPortal(
    <Modal
      closeModal={handleButtonClick}
      onSubmit={handleoneditSubmit}
      onCancel={handleButtonClick}
    >
      {editModel &&
        editModel.length > 0 &&
        editModel.map((item, index) => (
          <div key={index} className="space-y-4">
            
            {/* Task */}
            <div>
              <label className="block mb-1 font-semibold">Task</label>
              <textarea
                name="task"
                // value={item.task || ""}
                value={Array.isArray(item.task) ? item.task[0] : item.task || ""}
                onChange={(e) => handleEditmodel(index, e)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows="3"
                required
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block mb-1 font-semibold">Due Date</label>
              {/* <input
                type="date"
                name="due_date"
                value={item.due_date || ""}
                onChange={(e) => handleEditmodel(index, e)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              /> */}
              <input
  type="date"
  name="due_date"
  value={
    item.due_date && item.due_date.includes("-")
      ? (() => {
          const parts = item.due_date.split("-");
          return parts[0].length === 4
            ? item.due_date // already YYYY-MM-DD
            : `${parts[2]}-${parts[1]}-${parts[0]}`; // convert DD-MM-YYYY → YYYY-MM-DD
        })()
      : ""
  }
  onChange={(e) => handleEditmodel(index, e)}
  required
  className="w-full border border-gray-300 rounded px-3 py-2"
/>

            </div>

            {/* Status */}
            <div>
              <label className="block mb-1 font-semibold">Status</label>
              <select
  name="status"
  value={item.status || "Not Started"}
  onChange={(e) => handleEditmodel(index, e)}
  className="w-full border border-gray-300 rounded px-3 py-2"
>
  <option value="Not Started">Not Started</option>
  <option value="In Progress">In Progress</option>
  <option value="Completed">Completed</option>
</select>

            </div>

            {/* Priority */}
            <div>
              <label className="block mb-1 font-semibold">Priority</label>
              <select
                name="priority"
                value={item.priority || "Medium"}
                onChange={(e) => handleEditmodel(index, e)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Subtasks */}
<div>
  <label className="block mb-1 font-semibold">Subtasks</label>
  {(item.subtasks && item.subtasks.length > 0 ? item.subtasks : []).map((subtask, sidx) => {
    const text = subtask.text ?? subtask.title ?? "";
    const completed = subtask.completed ?? subtask.done ?? false;

    return (
      <div key={subtask.id || sidx} className="flex items-center mb-2">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => {
            const updatedModel = [...editModel];
            updatedModel[index].subtasks[sidx] = {
              ...updatedModel[index].subtasks[sidx],
              completed: e.target.checked,
            };
            SetEditmodel(updatedModel);
          }}
          className="mr-2"
        />
        {/* Title */}
        <input
          type="text"
          value={text}
          onChange={(e) => {
            const updatedModel = [...editModel];
            updatedModel[index].subtasks[sidx] = {
              ...updatedModel[index].subtasks[sidx],
              text: e.target.value,
            };
            SetEditmodel(updatedModel);
          }}
          className="w-full border border-gray-300 rounded px-2 py-1"
        />
      </div>
    );
  })}

  {/* Add new subtask */}
  <button
    type="button"
    onClick={() => {
      const updatedModel = [...editModel];
      if (!updatedModel[index].subtasks) updatedModel[index].subtasks = [];
      updatedModel[index].subtasks.push({
        id: Date.now(),
        text: "",
        completed: false,
      });
      SetEditmodel(updatedModel);
    }}
    className="text-blue-500 mt-2"
  >
    ➕ Add Subtask
  </button>
</div>
            {/* Assigned To */}
            {/* <div>
              <label className="block mb-1 font-semibold">Assigned To</label>
              <input
                type="text"
                name="assigned_to"
                value={item.assigned_to || ""}
                onChange={(e) => handleEditmodel(index, e)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div> */}

          </div>
        ))}
    </Modal>,
    document.body
  )}
                     
</div>                         
  </div>
    </div>
      )
}
export default EmployeeTaskAssign;
