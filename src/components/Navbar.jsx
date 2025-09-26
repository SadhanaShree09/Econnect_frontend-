import { SlArrowDown } from "react-icons/sl";
import Headlogo from "../assets/chat.png";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai";
import { LS } from "../Utils/Resuse";
export default function Navbar({ path, togglebtn }) {
  const navigate = useNavigate();

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-opacity-50 bg-black backdrop-blur-lg z-50 flex justify-center items-center "
      onClick={() => {
        togglebtn();
      }}
    >
      <div className="absolute right-4 top-4">
        <AiFillCloseCircle
          size={30}
          onClick={() => {
            togglebtn();
          }}
        />
      </div>
      <div className="w-[90vw] " id="navbar-default">
        <ul className="font-medium flex flex-col p-4  text-center mt-4 border border-gray-100 rounded-lg bg-[#6d9eeb]  ">
          <li>
            <Link to={"../Dashboard"}>
              <a
                className={`block py-2 pl-3 pr-4 text-white ${
                  path == "Dashboard" ? "bg-blue-700" : ""
                } hover:bg-gray-700 rounded `}
              >
                Dashboard
              </a>
            </Link>
          </li>
          <li>
            <Link to={"../Jsoneditor"}>
              <a
                className={`block py-2 pl-3 pr-4 text-white ${
                  path == "Jsoneditor" ? "bg-blue-700" : ""
                } hover:bg-gray-700 rounded `}
              >
                Json Editor
              </a>
            </Link>
          </li>
          <li>
            <Link to={"../Setting"}>
              <a
                className={`block py-2 pl-3 pr-4 text-white ${
                  path == "Setting" ? "bg-blue-700" : ""
                } hover:bg-gray-700 rounded `}
              >
                Setting
              </a>
            </Link>
          </li>
          <li>
            <Link
              onClick={(e) => {
              
                LS.clear();
                navigate("/", { replace: true });
              }}
            >
              <a className="block py-2 pl-3 pr-4 text-white  rounded hover:bg-gray-700">
                Logout
              </a>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
