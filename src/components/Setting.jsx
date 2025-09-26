import React, { useState } from "react";
import "./setting.css";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { AiOutlineMenuUnfold } from "react-icons/ai";
import "./json.css";
function Setting() {
  const location = useLocation();
  let path = location.pathname.split("/")[2];
  const [Navbool, Setnavbool] = useState(false);
  const togglebtn = () => {
    Setnavbool(!Navbool);
  };

  return (
    <div className="h-full w-full flex justify-center items-center relative jsonback">
      <div className="absolute top-3 w-full">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-4xl font-poppins m-7 ">Settings</h1>
          <AiOutlineMenuUnfold
            size={30}
            className="mr-5 lg:hidden"
            onClick={(e) => {
              Setnavbool(!Navbool);
            }}
          />
        </div>
      </div>

      {Navbool ? <Navbar path={path} togglebtn={togglebtn} /> : <></>}
      <div className="card2">
        <div class="card px-[2rem] md:px-[4.5rem] rounded-md pb-[2rem] max-w-2xl lg:px-[7rem]">
          <div class="card-img"></div>
          <div class="card-info">
            <div className="flex flex-col gap-5">
              <input
                placeholder="Enter Access URL"
                className="md:px-10 md:py-2 px-5 py-2 rounded-lg border-2  outline-none"
              />
              <input
                placeholder="Enter Access Key"
                className="md:px-10 md:py-2 px-5 py-2 rounded-lg border-2  outline-none"
              />
            </div>
            <button class="c-button c-button--gooey">
              {" "}
             Save 
              <div class="c-button__blobs">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setting;
