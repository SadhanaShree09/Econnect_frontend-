import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaClock, FaSignInAlt, FaSignOutAlt, FaSpinner, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Baseaxios, LS, ipadr } from "../Utils/Resuse";

// Performance-optimized timer hook
const useOptimizedTimer = (isActive, startTime) => {
  const [time, setTime] = useState(() => new Date());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Single timer for both current time and elapsed time
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      
      if (isActive && startTime) {
        setElapsed(Math.floor((now - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, startTime]);

  return { time, elapsed };
};

// Memoized time display components to prevent unnecessary re-renders
const TimeDisplay = React.memo(({ time, label, className }) => {
  const formattedTime = useMemo(() => {
    return time.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [time]);

  return (
    <div className={className}>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
      <div className="text-2xl font-bold text-gray-800">{formattedTime}</div>
    </div>
  );
});

const ElapsedTimeDisplay = React.memo(({ seconds }) => {
  const formattedElapsed = useMemo(() => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [seconds]);

  return (
    <div className="text-center">
      <div className="text-sm text-green-600 font-medium">Work Time</div>
      <div className="text-xl font-bold text-green-700">{formattedElapsed}</div>
    </div>
  );
});

function OptimizedClockin() {
  const [Login, setLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [clockInTime, setClockInTime] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("ready");

  // Use optimized timer hook
  const { time: currentTime, elapsed: elapsedTime } = useOptimizedTimer(
    currentStatus === "clocked-in",
    clockInTime
  );

  // Load saved state from localStorage (only once on mount)
  useEffect(() => {
    const savedStatus = localStorage.getItem("clockStatus");
    const savedClockInTime = localStorage.getItem("clockInTime");
    
    if (savedStatus) {
      setCurrentStatus(savedStatus);
      if (savedStatus === "clocked-in" && savedClockInTime) {
        setClockInTime(new Date(savedClockInTime));
        setLogin(true);
      }
    }
  }, []);

  // Memoized formatters to prevent recreation on every render
  const formatTime = useCallback((date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

  const showConfirmationDialog = useCallback((action) => {
    setConfirmationAction(action);
    setShowConfirmation(true);
  }, []);

  const hideConfirmationDialog = useCallback(() => {
    setShowConfirmation(false);
    setConfirmationAction(null);
  }, []);

  const executeAction = useCallback(() => {
    if (confirmationAction === 'clockin') {
      clockinapi();
    } else if (confirmationAction === 'clockout') {
      clockoutapi();
    }
    hideConfirmationDialog();
  }, [confirmationAction]);

  const clockinapi = useCallback(() => {
    const userId = LS.get("userid");
    setIsLoading(true);
    setLastAction("clock-in");

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        name: LS.get("name"),
        userid: userId
      }),
      redirect: "follow"
    };

    fetch(`${ipadr}/Clockin`, requestOptions)
      .then(response => response.json())
      .then(data => {
        setIsLoading(false);
        if (data.message && data.message.includes("Clock-in successful")) {
          const now = new Date();
          setClockInTime(now);
          setCurrentStatus("clocked-in");
          setLogin(true);
          
          localStorage.setItem("clockStatus", "clocked-in");
          localStorage.setItem("clockInTime", now.toISOString());
          
          toast.success(`🎉 Successfully clocked in at ${formatTime(now)}! Time tracking started.`);
        } else if (data.message && data.message.includes("Already clocked in")) {
          setCurrentStatus("clocked-in");
          setLogin(true);
          toast.info("⚠️ " + data.message);
        } else {
          toast.info("ℹ️ " + data.message);
          if (data.message.includes("successful")) {
            setLogin(true);
            setCurrentStatus("clocked-in");
          }
        }
      })
      .catch(error => {
        setIsLoading(false);
        setLastAction(null);
        toast.error("❌ Clock-in failed. Please check your connection and try again.");
        console.error(error);
      });
  }, [formatTime]);

  const clockoutapi = useCallback(() => {
    const userId = LS.get("userid");
    setIsLoading(true);
    setLastAction("clock-out");

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        name: LS.get("name"),
        userid: userId
      }),
      redirect: "follow"
    };

    fetch(`${ipadr}/Clockout`, requestOptions)
      .then(response => response.json())
      .then(data => {
        setIsLoading(false);
        if (data.message && (data.message.includes("Clock-out successful") || data.message.includes("Clock-out sucessful"))) {
          const now = new Date();
          setCurrentStatus("clocked-out");
          setLogin(false);
          
          localStorage.removeItem("clockStatus");
          localStorage.removeItem("clockInTime");
          
          toast.success(`✅ Successfully clocked out at ${formatTime(now)}! Total work time: ${Math.floor(elapsedTime / 3600)}h ${Math.floor((elapsedTime % 3600) / 60)}m.`);
        } else if (data.message && data.message.includes("Clock-in required")) {
          toast.warning("⚠️ Please clock in first before clocking out.");
          setCurrentStatus("ready");
        } else {
          toast.success("✅ " + data.message);
          setLogin(false);
          setCurrentStatus("clocked-out");
          localStorage.removeItem("clockStatus");
          localStorage.removeItem("clockInTime");
        }
      })
      .catch(error => {
        setIsLoading(false);
        setLastAction(null);
        toast.error("❌ Clock-out failed. Please check your connection and try again.");
        console.error(error);
      });
  }, [formatTime, elapsedTime]);

  // Render optimized UI
  return (
    <div className="mr-8 p-6 bg-white min-h-[50vh] w-full shadow-lg rounded-xl relative">
      {/* Header Section */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ⏰ Productivity Dashboard
        </h1>
        <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full"></div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Current Time Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-md">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <FaClock className="text-2xl text-blue-600" />
              <h2 className="text-lg font-semibold text-blue-800">Current Time</h2>
            </div>
            <TimeDisplay 
              time={currentTime} 
              label="" 
              className="text-center"
            />
          </div>

          {/* Status & Work Time Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-md">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                {currentStatus === "clocked-in" ? (
                  <>
                    <FaCheckCircle className="text-2xl text-green-600" />
                    <h2 className="text-lg font-semibold text-green-800">Active</h2>
                  </>
                ) : currentStatus === "clocked-out" ? (
                  <>
                    <FaTimesCircle className="text-2xl text-red-600" />
                    <h2 className="text-lg font-semibold text-red-800">Completed</h2>
                  </>
                ) : (
                  <>
                    <FaClock className="text-2xl text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Ready</h2>
                  </>
                )}
              </div>
              
              {currentStatus === "clocked-in" ? (
                <ElapsedTimeDisplay seconds={elapsedTime} />
              ) : (
                <div className="text-center">
                  <div className="text-sm text-gray-600 font-medium">Status</div>
                  <div className="text-xl font-bold text-gray-700 capitalize">{currentStatus}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105 shadow-md
              ${!Login
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-200"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
              ${isLoading && lastAction === "clock-in" ? "opacity-75" : ""}
            `}
            onClick={() => !Login && !isLoading && showConfirmationDialog('clockin')}
            disabled={Login || isLoading}
          >
            {isLoading && lastAction === "clock-in" ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaSignInAlt />
            )}
            <span>{isLoading && lastAction === "clock-in" ? "Processing..." : "Clock In"}</span>
          </button>

          <button
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105 shadow-md
              ${Login
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-200"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
              ${isLoading && lastAction === "clock-out" ? "opacity-75" : ""}
            `}
            onClick={() => Login && !isLoading && showConfirmationDialog('clockout')}
            disabled={!Login || isLoading}
          >
            {isLoading && lastAction === "clock-out" ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaSignOutAlt />
            )}
            <span>{isLoading && lastAction === "clock-out" ? "Processing..." : "Clock Out"}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {confirmationAction === 'clockin' ? 'clock in' : 'clock out'}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                onClick={hideConfirmationDialog}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-white rounded transition-colors ${
                  confirmationAction === 'clockin'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                onClick={executeAction}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}

export default OptimizedClockin;
