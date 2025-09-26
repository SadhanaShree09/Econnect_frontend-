import Headlogo from "../assets/rbg2.png";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiLogOut, FiUser } from "react-icons/fi";
import { LS } from "../Utils/Resuse";
import NotificationBell from "./NotificationBell";

// Modal component
const Modal = ({ show, onClose, onConfirm, message }) => {
  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50 ">
      <div className="bg-blue-100 p-4 rounded-lg">
        <p className="mb-3 text-black font-poppins">{message}</p>
        <hr className="border-gray-400" />
        <div className="flex flex-row">
          <button
            className="bg-red-400 hover:bg-red-500 text-white w-1/2 px-4 py-2 mt-4 rounded mr-2 font-poppins"
            onClick={onConfirm}
          >
            Yes
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-black w-1/2 px-4 py-2 mt-4 rounded font-poppins"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ userPicture, userName, isLoggedIn, onLogout = () => {} }) => {
  const navigate = useNavigate(); // Declare navigate only once
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = () => {
    // Clear all localStorage data
    LS.remove("isloggedin");
    LS.remove("access_token");
    LS.remove("userid");
    LS.remove("name");
    LS.remove("isadmin");
    LS.remove("position");
    LS.remove("department");
    
    toast.success("Successfully logged out!", {
      position: "top-right",
      autoClose: 1000,
      onClose: () => {
        navigate("/"); // Redirect after logout
        setShowLogoutModal(false);
        if (onLogout && typeof onLogout === 'function') {
          onLogout();
        }
      },
    });
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleClick = () => {
    navigate("/User/profile");
  };
  const loggedIn = LS.get("isloggedin");
  const isAdmin = LS.get("isadmin");
  const isManager=LS.get("position");
  const isDepart=LS.get("department");
  const userid=LS.get('userid');

  return (
    <div className="flex flex-col min-h-screen w-64 bg-blue-600 text-white shadow-lg border-r">
      {/* Logo Section */}
      <div className="p-4 border-b-2 border-white border-purple-900 flex items-center justify-between">
        <img src={Headlogo} alt="Logo" className="h-16" />
        <NotificationBell className="mr-2" />
      </div>

      {/* Links Section */}
      <div className="flex flex-col mt-6">
        {loggedIn && isAdmin ? (
          <>
            <Link to="time" className="sidebar-item">
              <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 mr-3 text-white"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l3 3" />
                </svg>
                <span className="font-medium">Time Management</span>
              </div>
            </Link>

            <Link to="leave" className="sidebar-item">
              <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 mr-3 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
                <span className="font-medium">Leave Management</span>
              </div>
            </Link>

            <Link to="employee" className="sidebar-item">
              <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 mr-3 text-white"
                >
                  <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                  <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18a6 6 0 016-6h4a6 6 0 016 6"
                  />
                </svg>
                <span className="font-medium">Employee List</span>
              </div>
            </Link>

            <Link to="newUser" className="sidebar-item">
              <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 mr-3 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4a4 4 0 110 8 4 4 0 010-8zM6 20v-1a6 6 0 0112 0v1M16 11h6m-3-3v6"
                  />
                </svg>
                <span className="font-medium">Add Employee</span>
              </div>
            </Link>

            <Link to="notifications" className="sidebar-item">
              <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 mr-3 text-white"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM20.61 10.83l-1.44-1.44a3 3 0 00-4.24 0l-5 5-1.39-1.39a1 1 0 00-1.42 0l-4.24 4.24a1 1 0 000 1.42l1.44 1.44a1 1 0 001.42 0L9 16.83l1.39 1.39a3 3 0 004.24 0l5-5a1 1 0 000-1.39z" />
                </svg>
                <span className="font-medium">Notifications</span>
              </div>
            </Link>

            <Link to="addLeave" className="sidebar-item">
              <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
                
                <svg xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke-width="1.5" 
                  stroke="currentColor" 
                  class="size-6"
                  className="size-6 mr-3"
                  >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
              </svg>

              <span className="font-medium">Add Leave</span>
              </div>
            </Link>
          </>
        ) : loggedIn && !isAdmin && (
          <>
            <Link to="Clockin_int" className="sidebar-item">
              <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 mr-3 text-white"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l3 3" />
                </svg>
                <span className="font-medium">Time Management</span>
              </div>
            </Link>

            <Link to="Leave" className="sidebar-item">
              <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 mr-3 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
                <span className="font-medium">Leave Management</span>
              </div>
            </Link>

            {isDepart !== "HR" && (
            <Link to="todo" className="sidebar-item">
              <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 mr-3 text-white"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 3h12M6 7h12M6 11h12M6 15h12M6 19h12" />
                </svg>
                <span className="font-medium">Task List</span>
              </div>
            </Link>
            )}

            {/* <Link to={`${userid}`} className="sidebar-item">

            <Link to={`${userid}`} className="sidebar-item">
              <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 mr-3 text-white"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 3h12M6 7h12M6 11h12M6 15h12M6 19h12" />
                </svg>
                <span className="font-medium">Task Assign</span>
              </div>
            </Link> */}

            <Link to="notifications" className="sidebar-item">
              <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 mr-3 text-white"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM20.61 10.83l-1.44-1.44a3 3 0 00-4.24 0l-5 5-1.39-1.39a1 1 0 00-1.42 0l-4.24 4.24a1 1 0 000 1.42l1.44 1.44a1 1 0 001.42 0L9 16.83l1.39 1.39a3 3 0 004.24 0l5-5a1 1 0 000-1.39z" />
                </svg>
                <span className="font-medium">Notifications</span>
              </div>
            </Link>
            
            
          </>
        ) 
        }
        
        {loggedIn && !isAdmin  && (
  <Link to="my-documents" className="sidebar-item">
    <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
        viewBox="0 0 24 24" stroke="currentColor" 
        className="w-6 h-6 mr-3 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" 
          strokeWidth="2"
          d="M12 6v6m0 0l3 3m-3-3l-3-3" />
      </svg>
      <span className="font-medium">My Documents</span>
    </div>
  </Link>
)}

{/* HR/Admin - Review Documents */}
{loggedIn && (isAdmin) && (
  <Link to="review-docs" className="sidebar-item">
    <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
        viewBox="0 0 24 24" stroke="currentColor" 
        className="w-6 h-6 mr-3 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" 
          strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
      <span className="font-medium">Docs Review</span>
    </div>
  </Link>
)}

{loggedIn && !isAdmin && (
  (isDepart === 'HR' || isManager === 'Manager' || userid ) && (
    <Link to="chat" className="sidebar-item">
      <div className='flex items-center p-4 hover:bg-blue-700 transition-colors'>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6 mr-3 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 8h10M7 12h4m1 8a9 9 0 110-18 9 9 0 010 18z"
          />
        </svg>
        <span className="font-medium">Chat</span>
      </div>
    </Link>
  )
)}

        {
          loggedIn && isManager=="Manager" ?(
          <>

                <Link to="manager-employee" className="sidebar-item">
              <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" className="w-6 h-6 mr-3 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M6 3h12M6 7h12M6 11h12M6 15h12M6 19h12"/>
                </svg>
                <span className="font-medium">Employee Task Progress</span>
              </div>
            </Link>

            <Link to="LeaveManage" className="sidebar-item">
              <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 mr-3 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
                <span className="font-medium">Employee Leave Management</span>
              </div>
            </Link>

           
          </>
          ): loggedIn && isDepart=="HR" && (
           <>

           <Link to="hr-manager" className="sidebar-item">
        <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" className="w-6 h-6 mr-3 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M6 3h12M6 7h12M6 11h12M6 15h12M6 19h12"/>
          </svg>
          <span className="font-medium">Manager Task Progress</span>
        </div>
      </Link>
      
           <Link to="LeaveManage" className="sidebar-item">
              <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 mr-3 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
                <span className="font-medium">Employee Leave Management</span>
              </div>
            </Link>
            <Link to="newUser" className="sidebar-item">
              <div className="flex items-center p-4 hover:bg-blue-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 mr-3 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4a4 4 0 110 8 4 4 0 010-8zM6 20v-1a6 6 0 0112 0v1M16 11h6m-3-3v6"
                  />
                </svg>
                <span className="font-medium">Add Employee</span>
              </div>
            </Link>
           </>
          )
        }
      </div>

      {/* Footer Section */}
      <div className="mt-auto border-t-2 border-white border-purple-900 p-4 flex justify-around">
        <FiLogOut
          size={24}
          className="cursor-pointer hover:text-red-500"
          onClick={() => setShowLogoutModal(true)}
        />
        <FiUser
          size={24}
          className="cursor-pointer "
          onClick={() => {
            if (loggedIn && !isAdmin) {
              navigate("/User/profile");
            } else if (loggedIn && isAdmin) {
              navigate("/admin/profile");
            }
          }}

        />
      </div>

      {/* Logout Modal */}
      <Modal
        show={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        message="Are you sure you want to logout?"
      />

      <ToastContainer position="top-right" autoClose={1000} hideProgressBar theme="light" />
    </div>
  );
};

export default Sidebar;