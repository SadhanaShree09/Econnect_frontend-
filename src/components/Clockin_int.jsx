import React, { useState, useEffect } from "react";
import { useLocation, Link, Outlet, useNavigate } from "react-router-dom";
import { AiOutlineMenuUnfold } from "react-icons/ai";
import { FaClock, FaPlay, FaStop, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Baseaxios, LS } from "../Utils/Resuse";

function Clockin_int() {
  const location = useLocation();
  let path = location.pathname.split("/")[2];
  const navigate = useNavigate();
  const [Navbool, Setnavbool] = useState(false);
  const togglebtn = () => {
    Setnavbool(!Navbool);
  };
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [Login, Setlogin] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedStartTime = parseInt(localStorage.getItem("startTime"));
    const storedElapsedTime = parseInt(localStorage.getItem("elapsedTime"));
    const storedIsRunning = localStorage.getItem("isRunning") === "true";
    const storedLogin = localStorage.getItem("Login") === "true";

    if (!isNaN(storedStartTime)) {
      setStartTime(storedStartTime);
    }
    if (!isNaN(storedElapsedTime)) {
      setElapsedTime(storedElapsedTime);
    }
    setIsRunning(storedIsRunning);
    Setlogin(storedLogin);
  }, []);

  useEffect(() => {
    localStorage.setItem("startTime", startTime);
    localStorage.setItem("elapsedTime", elapsedTime);
    localStorage.setItem("isRunning", isRunning);
    localStorage.setItem("Login", Login);
  }, [startTime, elapsedTime, isRunning, Login]);

  useEffect(() => {
    let timer;

    if (isRunning) {
      timer = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      clearInterval(timer);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isRunning, startTime]);

  const toggleTimer = () => {
    Setlogin(true);
    if (isRunning) {
      setIsRunning(false);
    } else {
      const now = Date.now() - elapsedTime;
      setStartTime(now);
      setIsRunning(true);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const showConfirmationDialog = (action) => {
    setConfirmationAction(action);
    setShowConfirmation(true);
  };

  const hideConfirmationDialog = () => {
    setShowConfirmation(false);
    setConfirmationAction(null);
  };

  const executeAction = () => {
    if (confirmationAction === 'clockin') {
      clockinapi();
    } else if (confirmationAction === 'clockout') {
      clockoutapi();
    }
    hideConfirmationDialog();
  };

  const resetTimer = () => {
    Setlogin(false);
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
  };

  const clockinapi = () => {
    const userid = LS.get("userid");
    const userName = LS.get("name");
    setIsLoading(true);
    let currentDate = new Date();
    let time = currentDate.toLocaleTimeString().toString();
    
    Baseaxios.post("/Clockin", { userid, name: userName, time: time })
      .then((response) => {
        setIsLoading(false);
        console.log("✅ Clock-in successful:", response.data);
        toggleTimer();
        
        toast.success(`🎉 Successfully clocked in at ${formatTime(currentDate)}! Time tracking started.`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error("❌ Clock-in error:", err);
        toast.error("❌ Failed to clock in. Please check your connection and try again.");
      });
  };

  const clockoutapi = () => {
    const userid = LS.get("userid");
    const userName = LS.get("name");
    setIsLoading(true);
    console.log("Clock-out for user:", userid);
    let currentDate = new Date();
    let time = currentDate.toLocaleTimeString().toString();
    
    Baseaxios.post("/Clockout", {
      userid: userid,
      name: userName,
      time: time,
    })
      .then((res) => {
        setIsLoading(false);
        console.log(res);
        const workDuration = formatElapsedTime(elapsedTime);
        resetTimer();
        
        toast.success(`✅ Successfully clocked out at ${formatTime(currentDate)}! Total work time: ${workDuration}`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
        toast.error("❌ Failed to clock out. Please check your connection and try again.");
      });
  };

  const formatElapsedTime = (time) => {
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor(time / (1000 * 60 * 60));
    return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""
      }${seconds}`;
  };

  const handleDetailsClick = () => {
    setShowBackButton(true);
  };

  const handleBackClick = () => {
    setShowBackButton(false);
    navigate("/User/Clockin_int");
  };

  return (
    <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md">
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="text-lg font-semibold mb-3">
                {confirmationAction === 'clockin' ? '🔄 Confirm Clock In' : '🔄 Confirm Clock Out'}
              </div>
              <p className="text-gray-600 mb-4">
                {confirmationAction === 'clockin' 
                  ? 'Are you sure you want to clock in now?' 
                  : 'Are you sure you want to clock out now?'}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={hideConfirmationDialog}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                    confirmationAction === 'clockin' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="">
        <div className="mb-6 w-full flex items-start justify-between font-poppins border-b-2 pb-3">
          <div className="text-4xl font-semibold text-zinc-700">
            Welcome{" "}
            <span>
              {LS.get("name")}
            </span>
            👋
          </div>
          <div className="">
            {!showBackButton ? (
              <Link
                className="m-4 px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white"
                to={"Clockdashboard"}
                onClick={handleDetailsClick}
              >
                Details
              </Link>
            ) : (
              <button
                className="px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white"
                onClick={handleBackClick}
              >
                Go Back
              </button>
            )}
          </div>
        </div>
        <Outlet />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default Clockin_int;