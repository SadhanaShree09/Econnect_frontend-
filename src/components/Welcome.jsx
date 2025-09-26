import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSignInAlt, FaSignOutAlt, FaChartBar } from "react-icons/fa";
import Sidebar from "./Sidebar.jsx";

const WelcomePage = () => {
  const location = useLocation();
  const { userPicture, userName } = location.state || {};
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };
  const data = [
    {
      title: "Login",
      desc: "Clock in securely to access work systems",
      icon: <FaSignInAlt className="text-6xl mb-6 text-zinc-700" />,
      button: "Login",
      link: "",
    },
    {
      title: "Logout",
      desc: "Clock out to securely end your session",
      icon: <FaSignOutAlt className="text-6xl  mb-6 text-zinc-700" />,
      button: "Logout",
      link: "",
    },
    {
      title: "Dashboard",
      desc: "Overview of login and logout data",
      icon: <FaChartBar className="text-6xl  mb-6 text-zinc-700" />,
      button: "Go to Dashboard",
      link: "",
    },
  ];

  return (
    <div className="flex bg-[#6d9eeb] bg-gradient-to-b from-blue-400 to-indigo-800">
      <Sidebar
        userPicture={userPicture}
        userName={userName}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      <div className="container my-6 mx-6 bg-white rounded-3xl p-10 bg-gradient-to-b from-white to-blue-100">
        <h1 className="text-5xl font-semibold font-poppins pb-2 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text">
          Time Management
        </h1>
        <div className="my-10">
          <div className="grid grid-cols-3 gap-10">
            {data.map((item, index) => (
              <div
                key={index}
                className="w-4 p-6 rounded-lg bg-blue-50 bg-gradient-to-tr from-white to-blue-200 transition-transform duration-300 transform hover:scale-105 border-x shadow-xl  flex flex-col justify-between"
              >
                <div>
                  {item.icon}
                  <h1 className="font-poppins font-semibold text-lg pb-2 text-zinc-800">
                    {item.title}
                  </h1>
                  <p className="font-poppins font-medium text-gray-600 text-sm pb-2">
                    {item.desc}
                  </p>
                </div>
                <Link to={item.link}>
                  <button
                    className={`bg-blue-500 hover:bg-blue-400 hover:text-slate-900 text-white text-sm font-poppins px-4 py-2 mt-2 rounded-full shadow-lg`}
                  >
                    {item.button}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;