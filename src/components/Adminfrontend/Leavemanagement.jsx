import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserClock, faHome, faClipboardList, faCalendarDay } from "@fortawesome/free-solid-svg-icons";
import { LS } from "../../Utils/Resuse";

const Leavemanagement = () => {
  const isAdmin= LS.get('isAdmin');
  const data = [
    {
      title: "Leave Approval",
      desc: "Easy tracking of employee leave requests",
      icon: <FontAwesomeIcon icon={faUserClock} className="text-6xl mb-6 text-zinc-700" />,
      button: "View now",
      link1: "/admin/leaveapproval",
      link2: "/User/leaveapproval"
    },
    {
      title: "Remote Work Approval",
      desc: "Easy tracking of employee remote work requests",
      icon: <FontAwesomeIcon icon={faHome} className="text-6xl mb-6 text-zinc-700" />,
      button: "View now",
      link1: "/admin/wfh",
      link2:"/User/wfh",
    },
    {
      title: "Employees Leave Details",
      desc: "Easy tracking of employee leave details",
      icon: <FontAwesomeIcon icon={faClipboardList} className="text-6xl mb-6 text-zinc-700" />,
      button: "View now",
      link1: "/admin/history",
      link2:"/User/history"
    },
    {
      title: "Employees Attendance Percentage",
      desc: "Easy tracking of employee attendance percentage",
      icon: <FontAwesomeIcon icon={faCalendarDay} className="text-6xl mb-6 text-zinc-700" />,
      button: "View now",
      link1: "/admin/attendance",
      link2:"/User/attendance"
    },
  ];

  return (
    <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full  shadow-black rounded-xl justify-center items-center relative jsonback  ml-10 rounded-md">
      <div>
        <h1 className="text-5xl font-semibold font-poppins pb-2 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text border-b-2">
          Leave Management
        </h1>
        <div className="my-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.map((item, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-blue-50 bg-gradient-to-tr from-white to-blue-100 transition-transform duration-300 transform hover:scale-105 border border-gray-200 shadow-lg flex flex-col justify-between"
              >
                <div>
                  {item.icon}
                  <h1 className="font-poppins font-semibold text-2xl pb-2 text-zinc-800">
                    {item.title}
                  </h1>
                  <p className="font-poppins font-medium text-gray-600 text-sm pb-3">
                    {item.desc}
                  </p>
                </div>
               { LS.get('isadmin')===true ?(
                <Link to={item.link1}>
                <button
                  className="bg-blue-500 hover:bg-[#b7c6df80] hover:text-black text-white font-poppins px-4 py-2 mt-3 rounded-full shadow-lg"
                >
                  {item.button}
                </button>
              </Link>):  (
                <Link to={item.link2}>
                <button
                  className="bg-blue-500 hover:bg-[#b7c6df80] hover:text-black text-white font-poppins px-4 py-2 mt-3 rounded-full shadow-lg"
                >
                  {item.button}
                </button>
              </Link>
                 
              )
                
               }
                
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leavemanagement;
