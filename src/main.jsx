import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter,createBrowserRouter, Outlet, Route, RouterProvider, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";
import Clockin from "./components/Clockin";
import Sidebar from "./components/Sidebar";
import Checkauth from "./Utils/Checkauth";
import Setting from "./components/Setting";
import Clockdashboard from "./components/Clockdashboard";
import Clockin_int from "./components/Clockin_int";
import Leave from "./components/Leave";
import LeaveHistory from "./components/LeaveHistory";
import Leaverequest from "./components/Leaverequest";
import Holidaylist from "./components/Holidayslist";
import Workfromhome from "./components/Workfromhome";
import Remote_details from "./components/Remote_details";
import ToDoList from "./components/todo";
import UserProfile from "./components/UserProfile";
import Timemanagement from "./components/Adminfrontend/Timemanagement";
import Employeelist from "./components/Adminfrontend/Employeelist";
import Leavemanagement from "./components/Adminfrontend/Leavemanagement";
import Leaveapproval from "./components/Adminfrontend/Leave_approval";
import Wfh from "./components/Adminfrontend/Wfh_approval";
import AdminProfile from "./components/Adminfrontend/Adminprofile";
import Leavehistory from "./components/Adminfrontend/Leave_History";
import AddUser from "./components/Adminfrontend/new_employee";
import TaskPage from "./components/Taskpage";
import EmployeeDetails from "./components/EmployeeDetails";
import TaskAssign from "./components/TaskAssign";
import ViewAssignedTask from "./components/ViewAssignedTask";
import TaskDetails from "./components/TaskDetails";
import LoginPage from "./components/Loginpage";
import NotificationDashboard from "./components/NotificationDashboard";
import EnhancedNotificationDashboard from "./components/EnhancedNotificationDashboard";
import NotificationSystemTest from "./components/NotificationSystemTest";
import ApiTest from "./components/ApiTest";
import AdminAuth from "./Utils/AdminAuth";
import TaskDetailsPage from "./components/TaskDetailsPage";
import EmployeeTaskProgress from "./components/EmployeeTaskProgress";
import ManagerTaskProgress from "./components/ManagerTaskProgress";
import EmployeeTaskAssign from './components/EmployeeTaskAssign';
import ManagerTaskAssign from './components/ManagerTaskAssign';
import EmployeeprogressDetail from './components/EmployeeprogressDetail';
import ManagerprogressDetail from './components/ManagerprogressDetail';


import Attendance from "./components/Adminfrontend/Attendance";
import AddLeave from "./components/Adminfrontend/AddLeave";
import AttendanceStats from "./components/AttendanceStats";
import LeaveDetails from "./components/Adminfrontend/LeaveDetails";
import RemoteDetails from "./components/Adminfrontend/RemoteDetails";
import Chat from './components/Chat';
import OnboardingDocs from './components/OnboardingDocs';
import HRDocsReview from './components/Adminfrontend/AdminDocsReview';

import Fileuploader from './components/Fileuploader';

// Create a simple dashboard home component for admin
const DashboardHome = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
    <p className="text-gray-600">Welcome to the admin panel. Select an option from the sidebar to get started.</p>
  </div>
);

const DashboardPage = () => (
  <Checkauth>
    <div className="flex h-screen w-full flex-col lg:flex-row">
      <Sidebar />
      <div
        id="temp"
        className="h-full w-full overflow-x-hidden flex justify-center items-center"
      >
        <Outlet />
      </div>
    </div>
  </Checkauth>
);

const AdminDashboardPage = () => (
  <AdminAuth>
    <DashboardPage />
  </AdminAuth>
);

/*const rou = [];
const tempdata = [
  rou.map((item) => {
    return item;
  }),
];*/



const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
     { index: true, element: <LoginPage /> }, // 👈 default for "/"
  ],
  },
  {
    path: "/Login",
    element: <LoginPage />,
  },
  {
    path: "/websocket-test",
    element: <NotificationDashboard />,
  },
  // {path:"Login",
  // element:<LoginPage />
  // },
  {
    path: "/User",
    element: <DashboardPage />,
    children: [
      { path: "", element: <></> },
      {
        path: "Clockin_int",
        element: <Clockin_int />,
        children: [
          { path: "", element: <Clockin /> },
          { path: "Clockdashboard", element: <Clockdashboard /> },
        ],
      },
      {
        path: "Setting",
        element: <Setting />,
      },
      {
        path: "profile",
        element: <UserProfile />,
      },
      {
        path: "todo",
        element: <ToDoList />
      },
      {
        path: "task",
        element: <TaskPage />,
      },
         {
        path: "task/:taskId",
        element: <TaskDetailsPage />,
      },
      {
        path: "Leave",
        element: <Leave />,
      },
      {
        path: "LeaveHistory",
        element: <LeaveHistory />,
      },
      {
        path: "Holidaylist",
        element: <Holidaylist />,
      },
      {
        path: "Workfromhome",
        element: <Workfromhome />,
      },
      {
        path: "Leaverequest",
        element: <Leaverequest />,
      },
      {
        path: "Remote_details",
        element: <Remote_details />,
      },
      {
        path: "notifications",
        element: <NotificationDashboard />,
      },
      {
        path: "enhanced-notifications",
        element: <EnhancedNotificationDashboard />,
      },
      {
        path: "test",
        element: <ApiTest />,
},
{
  path: "LeaveManage",
  element: <Leavemanagement />,
},
{
  path: "newUser",
  element: <AddUser />,
},
{
  path: "leaveapproval",
  element: <Leaveapproval />,
},
{
  path: "wfh",
  element: <Wfh />,
},
{
  path: "history",
  element: <Leavehistory />,
},
{
  path: 'chat',
  element: <Chat />, // your Slack-like chat component
},
{
  path:"viewtask",
  element:<ViewAssignedTask />
},
{
  path: "manager-employee",
  element: <EmployeeTaskProgress/>,
},
{
  path: "manager-task-detail/:taskId",
  element:<EmployeeprogressDetail/>,
},
{
  path: "hr-manager",
  element: <ManagerTaskProgress/>,
},
{
  path: "hr-task-detail/:taskId",
  element:<ManagerprogressDetail/>,
},
{
  path:"employee-task-assign", 
  element:<EmployeeTaskAssign />
},
 {
        path:'my-documents',
        element:<OnboardingDocs/>,
        
      },
      {
          path: 'fileuploader',
          element:<Fileuploader/>,
        },
{
  path:"manager-task-assign", 
  element:<ManagerTaskAssign />
},
{ path: "leave_details", element: <LeaveDetails /> },
{ path: "wfh_details", element: <RemoteDetails />},
{ path: "attendance", element: <Attendance />},
{ path: "individualStats", element: <AttendanceStats />},
{ path: ":userid", element: <TaskAssign /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminDashboardPage />,
    children: [
      {
        path: "",
        element: <></>,
      },
      {
        path: "leave",
        element: <Leavemanagement />,
      },
      {
        path: "time",
        element: <Timemanagement />,
      },
      {
        path: "employee",
        element: <Employeelist />,
        // children:[{
        //   path:':id',
        //   element:<EmployeeDetails/>
        // },],
      },
      {
        path: "leaveapproval",
        element: <Leaveapproval />,
      },
      {
        path: "wfh",
        element: <Wfh />,
      },
      {
        path: "profile",
        element: <AdminProfile />,
      },
      {
        path: "history",
        element: <Leavehistory />,
      },
      {
        path: "newUser",
        element: <AddUser />,
      },
      {
        path: "task",
        element: <TaskPage />,
      },
      {
        path: "viewtask",
        element: <ViewAssignedTask />,
      },
      {
        path: ":userid",
        element: <TaskAssign />,
      },
      {
        path: "notifications",
        element: <NotificationDashboard />,
      },
      {
        path: "enhanced-notifications",
        element: <EnhancedNotificationDashboard />,
      },
      {
        path: "notification-test",
        element: <NotificationSystemTest />,
      },
      {
        path:':id',
        element:<EmployeeDetails/>
      },
      {
        path: 'review-docs',
        element: <HRDocsReview />,
      },
      
      
      { index: true, element: <DashboardHome /> }, // default admin page
      { path: "leave", element: <Leavemanagement /> },
      { path: "time", element: <Timemanagement /> },
      { path: "employee", element: <Employeelist /> },
      { path: "employee/:id", element: <EmployeeDetails /> },
      { path: "leaveapproval", element: <Leaveapproval /> },
      { path: "leave_details", element: <LeaveDetails /> },
      { path: "wfh", element: <Wfh /> },
      { path: "wfh_details", element: <RemoteDetails />},
      { path: "profile", element: <AdminProfile /> },
      { path: "history", element: <Leavehistory /> },
      { path: "attendance", element: <Attendance />},
      { path: "newUser", element: <AddUser /> },
      { path: "addLeave", element: <AddLeave /> },
    ],
  }, // Fixed: Added missing comma here
]);

const MainApp = () => {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const isRunning = localStorage.getItem("isRunning") === "true";
      if (isRunning) {
        const confirmationMessage = "Are you sure you want to leave?";
        event.preventDefault();
        event.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <RouterProvider router={router}>
      <Outlet />
      <BrowserRouter>
      <Routes>
        <Route path="/admin/employee" element={<Employeelist/>}/>
        <Route path="/admin/employee/:id" element={<EmployeeDetails/>}/>
      </Routes>
      
      </BrowserRouter>
    </RouterProvider>
   

    
  );
  //return <RouterProvider router={router} />;
};

createRoot(document.getElementById("root")).render(<MainApp />);

// import React, { useEffect } from "react";
// import { createRoot } from "react-dom/client";
// import { createBrowserRouter, Outlet, RouterProvider, Navigate } from "react-router-dom";
// import "./index.css";
// import App from "./App";
// import Clockin from "./components/Clockin";
// import Clockdashboard from "./components/Clockdashboard";
// import Sidebar from "./components/Sidebar";
// import Checkauth from "./Utils/Checkauth";
// import Setting from "./components/Setting";
// import Clockin_int from "./components/Clockin_int";
// import Leave from "./components/Leave";
// import LeaveHistory from "./components/LeaveHistory";
// import Leaverequest from "./components/Leaverequest";
// import Holidaylist from "./components/Holidayslist";
// import Workfromhome from "./components/Workfromhome";
// import Remote_details from "./components/Remote_details";
// import UserProfile from "./components/UserProfile";
// import Timemanagement from "./components/Adminfrontend/Timemanagement";
// import Employeelist from "./components/Adminfrontend/Employeelist";
// import Leavemanagement from "./components/Adminfrontend/Leavemanagement";
// import Leaveapproval from "./components/Adminfrontend/Leave_approval";
// import Wfh from "./components/Adminfrontend/Wfh_approval";
// import AdminProfile from "./components/Adminfrontend/Adminprofile";
// import Leavehistory from "./components/Adminfrontend/Leave_History";
// import ToDoList from "./components/todo";
// import AddUser from "./components/Adminfrontend/New_employee";
// import { LS } from "./Utils/Resuse";

// const DashboardPage = () => (
//   <Checkauth>
//     <div className="flex h-screen w-full flex-col lg:flex-row">
//       <Sidebar />
//       <div
//         id="temp"
//         className="h-full w-full overflow-x-hidden flex justify-center items-center"
//       >
//         <Outlet />
//       </div>
//     </div>
//   </Checkauth>
// );

// const ProtectedRoute = ({ children, role }) => {
//   const isAdmin = LS.get("isadmin");
//   const userRole = isAdmin ? "admin" : "user";
//   if (role !== userRole) {
//     return <Navigate to="/" replace />;
//   }
//   return children;
// };

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <App />,
//   },
//   {
//     path: "/User",
//     element: (
//       <ProtectedRoute role="user">
//         <DashboardPage />
//       </ProtectedRoute>
//     ),
//     children: [
//       { path: "", element: <></> },
//       {
//         path: "Clockin_int",
//         element: <Clockin_int />,
//         children: [
//           { path: "", element: <Clockin /> },
//           { path: "Clockdashboard", element: <Clockdashboard /> },
//         ],
//       },
//       { path: "Setting", element: <Setting /> },
//       { path: "profile", element: <UserProfile /> },
//       { path: "todo", element: <ToDoList />,},
//       { path: "Leave", element: <Leave /> },
//       { path: "LeaveHistory", element: <LeaveHistory /> },
//       { path: "Holidaylist", element: <Holidaylist /> },
//       { path: "Workfromhome", element: <Workfromhome /> },
//       { path: "Leaverequest", element: <Leaverequest /> },
//       { path: "Remote_details", element: <Remote_details /> },
//     ],
//   },
//   {
//     path: "/admin",
//     element: (
//       <ProtectedRoute role="admin">
//         <DashboardPage />
//       </ProtectedRoute>
//     ),
//     children: [
//       { path: "", element: <></> },
//       { path: "leave", element: <Leavemanagement /> },
//       { path: "time", element: <Timemanagement /> },
//       { path: "employee", element: <Employeelist /> },
//       { path: "leaveapproval", element: <Leaveapproval /> },
//       { path: "wfh", element: <Wfh /> },
//       { path: "profile", element: <AdminProfile /> },
//       { path: "history", element: <Leavehistory /> },
//       { path: "newUser", element: <AddUser /> },
//     ],
//   },
// ]);

// const MainApp = () => {
//   useEffect(() => {
//     const handleBeforeUnload = (event) => {
//       const isRunning = localStorage.getItem("isRunning") === "true";
//       if (isRunning) {
//         const confirmationMessage = "Are you sure you want to leave?";
//         event.preventDefault();
//         event.returnValue = confirmationMessage;
//         return confirmationMessage;
//       }
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, []);

//   return (
//     <RouterProvider router={router}>
//       <Outlet />
//     </RouterProvider>
//   );
// };

// createRoot(document.getElementById("root")).render(<MainApp />);








// // import React, { useEffect } from "react";
// // import { createRoot } from "react-dom/client";
// // import { BrowserRouter, createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
// // import "./index.css";
// // import App from "./App";
// // import Clockin from "./components/Clockin";
// // import Sidebar from "./components/Sidebar";
// // import Checkauth from "./Utils/Checkauth";
// // import Setting from "./components/Setting";
// // import Clockdashboard from "./components/Clockdashboard";
// // import Clockin_int from "./components/Clockin_int";
// // import Leave from "./components/Leave";
// // import LeaveHistory from "./components/LeaveHistory";
// // import Leaverequest from "./components/Leaverequest";
// // import Holidaylist from "./components/Holidayslist";
// // import Workfromhome from "./components/Workfromhome";
// // import Remote_details from "./components/Remote_details";
// // import ToDoList from "./components/todo";
// // import UserProfile from "./components/UserProfile";
// // import Timemanagement from "./components/Adminfrontend/Timemanagement";
// // import Employeelist from "./components/Adminfrontend/Employeelist";
// // import Leavemanagement from "./components/Adminfrontend/Leavemanagement";
// // import Leaveapproval from "./components/Adminfrontend/Leave_approval";
// // import Wfh from "./components/Adminfrontend/Wfh_approval";
// // import AdminProfile from "./components/Adminfrontend/Adminprofile";
// // import Leavehistory from "./components/Adminfrontend/Leave_History";
// // import AddUser from "./components/Adminfrontend/new_employee";
// // import TaskPage from "./components/Taskpage";
// // import EmployeeDetails from "./components/EmployeeDetails";
// // import TaskAssign from "./components/TaskAssign";
// // import ViewAssignedTask from "./components/ViewAssignedTask";
// // import TaskDetails from "./components/TaskDetails";
// // import LoginPage from "./components/Loginpage";
// // import Signin from "./components/Signin";
// // import Signup from "./components/Signup";

// // // Create a simple dashboard home component for admin
// // const DashboardHome = () => (
// //   <div className="p-6">
// //     <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
// //     <p className="text-gray-600">Welcome to the admin panel. Select an option from the sidebar to get started.</p>
// //   </div>
// // );

// // const DashboardPage = () => (
// //   <Checkauth>
// //     <div className="flex h-screen w-full flex-col lg:flex-row">
// //       <Sidebar />
// //       <div
// //         id="temp"
// //         className="h-full w-full overflow-x-hidden flex justify-center items-center"
// //       >
// //         <Outlet />
// //       </div>
// //     </div>
// //   </Checkauth>
// // );

// // const router = createBrowserRouter([
// //   {
// //     path: "/",
// //     element: <App />,
// //     errorElement: <h1 className="text-red-600">Something went wrong!</h1>,
// //     children: [
// //       { index: true, element: <LoginPage /> }, // default route → show login
// //       { path: "signin", element: <Signin /> },
// //       { path: "signup", element: <Signup /> },
// //     ],
// //   },
// //   {
// //     path: "/Login",
// //     element: <LoginPage />,
// //   },
// //   {
// //     path: "/User",
// //     element: <DashboardPage />,
// //     children: [
// //       { path: "", element: <></> },
// //       {
// //         path: "Clockin_int",
// //         element: <Clockin_int />,
// //         children: [
// //           { path: "", element: <Clockin /> },
// //           { path: "Clockdashboard", element: <Clockdashboard /> },
// //         ],
// //       },
// //       { path: "Setting", element: <Setting /> },
// //       { path: "profile", element: <UserProfile /> },
// //       { path: "todo", element: <ToDoList /> },
// //       { path: "task", element: <TaskPage /> },
// //       { path: "Leave", element: <Leave /> },
// //       { path: "LeaveHistory", element: <LeaveHistory /> },
// //       { path: "Holidaylist", element: <Holidaylist /> },
// //       { path: "Workfromhome", element: <Workfromhome /> },
// //       { path: "Leaverequest", element: <Leaverequest /> },
// //       { path: "Remote_details", element: <Remote_details /> },
// //       { path: "LeaveManage", element: <Leavemanagement /> },
// //       { path: "newUser", element: <AddUser /> },
// //       { path: "leaveapproval", element: <Leaveapproval /> },
// //       { path: "wfh", element: <Wfh /> },
// //       { path: "history", element: <Leavehistory /> },
// //       { path: ":userid", element: <TaskAssign /> },
// //       { path: "viewtask", element: <ViewAssignedTask /> },
// //     ],
// //   },
// //   {
// //     path: "/admin",
// //     element: <DashboardPage />,
// //     children: [
// //       { index: true, element: <DashboardHome /> }, // default admin page
// //       { path: "leave", element: <Leavemanagement /> },
// //       { path: "time", element: <Timemanagement /> },
// //       { path: "employee", element: <Employeelist /> },
// //       { path: "employee/:id", element: <EmployeeDetails /> },
// //       { path: "leaveapproval", element: <Leaveapproval /> },
// //       { path: "wfh", element: <Wfh /> },
// //       { path: "profile", element: <AdminProfile /> },
// //       { path: "history", element: <Leavehistory /> },
// //       { path: "newUser", element: <AddUser /> },
// //     ],
// //   }, // Fixed: Added missing comma here
// // ]);

// // const MainApp = () => {
// //   useEffect(() => {
// //     const handleBeforeUnload = (event) => {
// //       const isRunning = localStorage.getItem("isRunning") === "true";
// //       if (isRunning) {
// //         const confirmationMessage = "Are you sure you want to leave?";
// //         event.preventDefault();
// //         event.returnValue = confirmationMessage;
// //         return confirmationMessage;
// //       }
// //     };

// //     window.addEventListener("beforeunload", handleBeforeUnload);
// //     return () => {
// //       window.removeEventListener("beforeunload", handleBeforeUnload);
// //     };
// //   }, []);

// //   return <RouterProvider router={router} />;
// // };

// // createRoot(document.getElementById("root")).render(<MainApp />);



// import React, { useEffect } from "react";
// import { createRoot } from "react-dom/client";
// import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
// import "./index.css";
// import App from "./App";
// import Clockin from "./components/Clockin";
// import Sidebar from "./components/Sidebar";
// import Checkauth from "./Utils/Checkauth";
// import Setting from "./components/Setting";
// import Clockdashboard from "./components/Clockdashboard";
// import Clockin_int from "./components/Clockin_int";
// import Leave from "./components/Leave";
// import LeaveHistory from "./components/LeaveHistory";
// import Leaverequest from "./components/Leaverequest";
// import Holidaylist from "./components/Holidayslist";
// import Workfromhome from "./components/Workfromhome";
// import Remote_details from "./components/Remote_details";
// import ToDoList from "./components/todo";
// import UserProfile from "./components/UserProfile";
// import Timemanagement from "./components/Adminfrontend/Timemanagement";
// import Employeelist from "./components/Adminfrontend/Employeelist";
// import Leavemanagement from "./components/Adminfrontend/Leavemanagement";
// import Leaveapproval from "./components/Adminfrontend/Leave_approval";
// import Wfh from "./components/Adminfrontend/Wfh_approval";
// import AdminProfile from "./components/Adminfrontend/Adminprofile";
// import Leavehistory from "./components/Adminfrontend/Leave_History";
// import AddUser from "./components/Adminfrontend/new_employee";
// import TaskPage from "./components/Taskpage";
// import EmployeeDetails from "./components/EmployeeDetails";
// import TaskAssign from "./components/TaskAssign";
// import ViewAssignedTask from "./components/ViewAssignedTask";
// import LoginPage from "./components/Loginpage";
// import Signin from "./components/Signin";
// import Signup from "./components/Signup";


// // Simple Admin Dashboard Home
// const DashboardHome = () => (
//   <div className="p-6">
//     <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
//     <p className="text-gray-600">Welcome to the admin panel.</p>
//   </div>
// );

// const DashboardPage = () => (
//   <Checkauth>
//     <div className="flex h-screen w-full flex-col lg:flex-row">
//       <Sidebar />
//       <div className="h-full w-full overflow-x-hidden flex justify-center items-center">
//         <Outlet />
//       </div>
//     </div>
//   </Checkauth>
// );

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <App />,
//     errorElement: <h1 className="text-red-600">Something went wrong!</h1>,
//     children: [
//       { index: true, element: <LoginPage /> }, // default route → show login
//       { path: "signin", element: <Signin /> },
//       { path: "signup", element: <Signup /> },
//     ],
//   },
//   {
//     path: "/User",
//     element: <DashboardPage />,
//     children: [
//       { index: true, element: <Clockin /> },
//       {
//         path: "Clockin_int",
//         element: <Clockin_int />,
//         children: [
//           { index: true, element: <Clockin /> },
//           { path: "Clockdashboard", element: <Clockdashboard /> },
//         ],
//       },
//       { path: "Setting", element: <Setting /> },
//       { path: "profile", element: <UserProfile /> },
//       { path: "todo", element: <ToDoList /> },
//       { path: "task", element: <TaskPage /> },
//       { path: "Leave", element: <Leave /> },
//       { path: "LeaveHistory", element: <LeaveHistory /> },
//       { path: "Holidaylist", element: <Holidaylist /> },
//       { path: "Workfromhome", element: <Workfromhome /> },
//       { path: "Leaverequest", element: <Leaverequest /> },
//       { path: "Remote_details", element: <Remote_details /> },
//       { path: "LeaveManage", element: <Leavemanagement /> },
//       { path: "newUser", element: <AddUser /> },
//       { path: "leaveapproval", element: <Leaveapproval /> },
//       { path: "wfh", element: <Wfh /> },
//       { path: "history", element: <Leavehistory /> },
//       { path: ":userid", element: <TaskAssign /> },
//       { path: "viewtask", element: <ViewAssignedTask /> },
//     ],
//   },
//   {
//     path: "/admin",
//     element: <DashboardPage />,
//     children: [
//       { index: true, element: <DashboardHome /> },
//       { path: "leave", element: <Leavemanagement /> },
//       { path: "time", element: <Timemanagement /> },
//       { path: "employee", element: <Employeelist /> },
//       { path: "employee/:id", element: <EmployeeDetails /> },
//       { path: "leaveapproval", element: <Leaveapproval /> },
//       { path: "wfh", element: <Wfh /> },
//       { path: "profile", element: <AdminProfile /> },
//       { path: "history", element: <Leavehistory /> },
//       { path: "newUser", element: <AddUser /> },
//       { path: "LeaveManage", element: <Leavemanagement /> },
//     ]
//   },
// ]);

// const MainApp = () => {
//   useEffect(() => {
//     const handleBeforeUnload = (event) => {
//       const isRunning = localStorage.getItem("isRunning") === "true";
//       if (isRunning) {
//         const confirmationMessage = "Are you sure you want to leave?";
//         event.preventDefault();
//         event.returnValue = confirmationMessage;
//         return confirmationMessage;
//       }
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, []);

//   return <RouterProvider router={router} />;
// };

// createRoot(document.getElementById("root")).render(<MainApp />);
