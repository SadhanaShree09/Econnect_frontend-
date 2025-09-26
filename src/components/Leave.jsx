import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserClock,
  faHome,
  faCalendarAlt,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const LeaveApplication = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [showLeaveDetails, setShowLeaveDetails] = useState(false);
  const [showHolidayList, setShowHolidayList] = useState(false);

  const handleShowDetails = () => {
    setShowDetails(!showDetails);
    setShowLeaveDetails(false);
    setShowHolidayList(false);
  };

  const handleShowLeaveDetails = () => {
    setShowLeaveDetails(true);
    setShowDetails(false);
    setShowHolidayList(false);
  };

  const handleShowHolidayList = () => {
    setShowHolidayList(true);
    setShowDetails(false);
    setShowLeaveDetails(false);
  };

  return (
      <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full  shadow-black rounded-xl justify-center items-center relative jsonback  ml-10 rounded-md ">
        <h1 className="text-5xl font-semibold font-poppins pb-2 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text border-b-2">
          Leave Management
        </h1>
        <div className="my-16 ">
          <div className="flex justify-between space-x-8 mb-4">
            <div className="px-5 py-8 rounded-lg bg-blue-50 bg-gradient-to-tr from-white to-blue-100 transition-transform duration-300 transform hover:scale-105 border-x shadow-xl w-1/4 flex flex-col justify-between">
              <div>
                <FontAwesomeIcon
                  icon={faUserClock}
                  className="text-6xl mb-7 text-zinc-700"
                />
                <h1 className="font-poppins font-semibold text-2xl pb-2 text-zinc-800">
                  Request Leave
                </h1>
                <p className="font-poppins font-medium text-gray-600 text-base pb-2">
                  Submit your leave request
                </p>
              </div>
              <Link to={"/User/Leaverequest"}>
                <button
                  className={`mt-3 px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black  active:bg-white active:text-white ${
                    showDetails ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  onClick={handleShowDetails}
                  disabled={showDetails}
                >
                  Request Now
                </button>
              </Link>
            </div>

            <div className="px-5 py-8 rounded-lg bg-blue-50 bg-gradient-to-tr from-white to-blue-100 transition-transform duration-300 transform hover:scale-105 border-x shadow-xl w-1/4 flex flex-col justify-between">
              <div>
                <FontAwesomeIcon
                  icon={faClipboardList}
                  className="text-6xl mb-7 text-zinc-700 "
                />

                <h1 className="font-poppins font-semibold text-2xl pb-2 text-zinc-800">
                  Leave Details
                </h1>
                <p className="font-poppins font-medium text-gray-600 text-base pb-2">
                  Check your leave records
                </p>
              </div>
              <Link to={"/User/LeaveHistory"}>
                <button
                 className={`mt-3 px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black  active:bg-white active:text-white ${
                    showLeaveDetails ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  onClick={handleShowLeaveDetails}
                  disabled={showLeaveDetails}
                >
                  View Details
                </button>
              </Link>
            </div>

            <div className="px-5 py-8 rounded-lg bg-blue-50 bg-gradient-to-tr from-white to-blue-100 transition-transform duration-300 transform hover:scale-105 border-x shadow-xl w-1/4 flex flex-col justify-between">
              <div>
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-6xl mb-7 text-zinc-700"
                />

                <h1 className="font-poppins font-semibold text-2xl pb-2 text-zinc-800">
                  Holidays
                </h1>
                <p className="font-poppins font-medium text-gray-600 text-base pb-2">
                   Check upcoming Holidays
                </p>
              </div>
              <Link to={"/User/Holidaylist"}>
                <button
                  className={`mt-3 px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black  active:bg-white active:text-white ${
                    showHolidayList ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  onClick={handleShowHolidayList}
                  disabled={showHolidayList}
                >
                  View Holidays
                </button>
              </Link>
            </div>

            <div className="px-5 py-8 rounded-lg bg-blue-50 bg-gradient-to-tr from-white to-blue-100 transition-transform duration-300 transform hover:scale-105 border-x shadow-xl w-1/4 flex flex-col justify-between">
              <div>
                <FontAwesomeIcon
                  icon={faHome}
                  className="text-6xl mb-7 text-zinc-700"
                />

                <h1 className="font-poppins font-semibold text-2xl pb-2 text-zinc-800">
                  Remote Work
                </h1>
                <p className="font-poppins font-medium text-gray-600 text-base pb-2">
                  Apply for the Remote Work
                </p>
              </div>
              <Link to={"/User/Workfromhome"}>
                <button
                  className={`mt-3 px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black  active:bg-white active:text-white ${
                    showDetails ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  // onClick={handleShowDetails}
                  // disabled={showDetails}
                >
                  Apply Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default LeaveApplication;
