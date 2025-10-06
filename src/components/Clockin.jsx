import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaClock, FaSignInAlt, FaSignOutAlt, FaSpinner, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Baseaxios, LS  ,ipadr } from "../Utils/Resuse";

function Clockin() {
  const [Login, setLogin] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [clockInTime, setClockInTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("ready"); // ready, clocked-in, clocked-out

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate elapsed time since clock-in
  useEffect(() => {
    let interval;
    if (currentStatus === "clocked-in" && clockInTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - clockInTime) / 1000);
        
        // Cap elapsed time at 24 hours (86400 seconds) to prevent unrealistic durations
        const cappedElapsed = Math.min(elapsed, 86400);
        setElapsedTime(cappedElapsed);
        
        // If elapsed time exceeds 24 hours, show warning
        if (elapsed > 86400) {
          toast.warning("⚠️ You've been clocked in for over 24 hours! Please clock out or contact your administrator.", {
            toastId: "24hr-warning",
            autoClose: false
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStatus, clockInTime]);

  // Load saved state from localStorage
  useEffect(() => {
    const savedStatus = localStorage.getItem("clockStatus");
    const savedClockInTime = localStorage.getItem("clockInTime");
    
    if (savedStatus) {
      setCurrentStatus(savedStatus);
      if (savedStatus === "clocked-in" && savedClockInTime) {
        const clockInDate = new Date(savedClockInTime);
        const now = new Date();
        
        // Check if clock-in was from a previous day
        const clockInDay = clockInDate.toDateString();
        const today = now.toDateString();
        
        if (clockInDay !== today) {
          // Clock-in is from a previous day - clear the status and warn user
          localStorage.removeItem("clockStatus");
          localStorage.removeItem("clockInTime");
          setCurrentStatus("ready");
          toast.warning("⚠️ Your previous clock-in session was from a different day. Please contact administrator to complete previous day's attendance.", {
            autoClose: 10000
          });
        } else {
          // Same day - restore the clock-in state
          setClockInTime(clockInDate);
          setLogin(true);
        }
      }
    }
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const clockinapi = () => {
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
          
          // Save state to localStorage
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
  };

  const clockoutapi = () => {
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
        
        // Check for various response types
        if (data.message) {
          if (data.message.includes("Clock-out successful") || data.message.includes("Clock-out sucessful")) {
            const now = new Date();
            setCurrentStatus("clocked-out");
            setLogin(false);
            
            // Clear localStorage
            localStorage.removeItem("clockStatus");
            localStorage.removeItem("clockInTime");
            
            // Extract work time from message if available
            const workTimeMatch = data.message.match(/Total work time: (.+?)$/);
            const workTime = workTimeMatch ? workTimeMatch[1] : formatElapsedTime(elapsedTime);
            
            setElapsedTime(0);
            toast.success(`✅ ${data.message}`, { autoClose: 5000 });
          } else if (data.message.includes("Previous Day") || data.message.includes("previous day") || data.message.includes("incomplete")) {
            // User needs to use previous day clock-out
            toast.warning(`⚠️ ${data.message}`, {
              autoClose: 10000
            });
          } else if (data.message.includes("already clocked out") || data.message.includes("Already clocked out")) {
            toast.info(`ℹ️ ${data.message}`);
            setLogin(false);
            setCurrentStatus("clocked-out");
            localStorage.removeItem("clockStatus");
            localStorage.removeItem("clockInTime");
          } else if (data.message.includes("Clock-in required") || data.message.includes("Please clock in")) {
            toast.warning("⚠️ Please clock in first before clocking out.");
            setCurrentStatus("ready");
            setLogin(false);
            localStorage.removeItem("clockStatus");
            localStorage.removeItem("clockInTime");
          } else {
            // Generic success message
            toast.success("✅ " + data.message);
            setLogin(false);
            setCurrentStatus("clocked-out");
            localStorage.removeItem("clockStatus");
            localStorage.removeItem("clockInTime");
          }
        } else if (data.error) {
          // Handle error response
          toast.error("❌ " + data.error);
        } else {
          toast.info("ℹ️ Clock-out processed");
        }
      })
      .catch(error => {
        setIsLoading(false);
        setLastAction(null);
        toast.error("❌ Clock-out failed. Please check your connection and try again.");
        console.error(error);
      });
  };

  const previousDayClockoutApi = () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    const requestOptions = {
      method: "POST",
      headers: myHeaders,np,
      body: JSON.stringify({
        name: LS.get("name"),
        userid: userId
      }),
      redirect: "follow"
    };

    fetch(`${ipadr}/PreviousDayClockout`, requestOptions)
      .catch(error => console.error(error));
  };

  // const autoClockoutApi = () => {
  //   const myHeaders = new Headers();
  //   myHeaders.append("Content-Type", "application/json");
    
  //   const requestOptions = {
  //     method: "POST",
  //     headers: myHeaders,
  //     body: JSON.stringify({
  //       name: "dhivya",
  //       userid: "6780c24108c4b3e2da6113ec"
  //     }),
  //     redirect: "follow"
  //   };

  //   fetch("https://econnectbackend-production.up.railway.app/AutoClockout", requestOptions)
  //     .catch(error => console.error(error));
  // };

  // useEffect(() => {
  //   previousDayClockoutApi();
  //   autoClockoutApi();
    
  //   const interval = setInterval(() => {
  //     autoClockoutApi();
  //   }, 60000);

  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="w-full">
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

      <div className="w-full">
        {/* Header - E-Connect Style */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-blue-600 flex items-center justify-center space-x-2">
            <FaClock />
            <span>Productivity Dashboard</span>
          </div>
        </div>

        {/* Main Content - E-Connect Theme */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Current Time Display */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-2">Current Time</div>
                <div className="text-3xl font-mono font-bold text-gray-800 mb-1">
                  {formatTime(currentTime)}
                </div>
                <div className="text-sm text-gray-600">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>

            {/* Status and Work Time Display */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-3">Work Status</div>
                
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {currentStatus === "clocked-in" ? (
                    <>
                      <FaCheckCircle className="text-green-500 text-xl" />
                      <span className="text-green-600 font-semibold text-lg">Clocked In</span>
                    </>
                  ) : (
                    <>
                      <FaClock className="text-blue-500 text-xl" />
                      <span className="text-blue-600 font-semibold text-lg">Not Clocked In</span>
                    </>
                  )}
                </div>
                
                {/* Work Time Display */}
                {currentStatus === "clocked-in" ? (
                  <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                    <div className="text-sm text-gray-600 mb-1">Work Duration</div>
                    <div className="text-2xl font-mono font-bold text-green-600 mb-1">
                      {formatElapsedTime(elapsedTime)}
                    </div>
                    {clockInTime && (
                      <div className="text-xs text-gray-500">
                        Started at {formatTime(clockInTime)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-400">
                      Work time will be tracked when you clock in
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Separated at Bottom */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-center space-x-6">
            <button
              className={`flex items-center space-x-3 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 ${
                currentStatus === "clocked-in"
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-sm"
                  : isLoading && lastAction === "clock-in"
                  ? "bg-green-400 text-white cursor-not-allowed shadow-md"
                  : "bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl"
              }`}
              onClick={() => currentStatus !== "clocked-in" && !isLoading && showConfirmationDialog('clockin')}
              disabled={currentStatus === "clocked-in" || isLoading}
            >
              {isLoading && lastAction === "clock-in" ? (
                <FaSpinner className="animate-spin text-xl" />
              ) : (
                <FaSignInAlt className="text-xl" />
              )}
              <span>
                {isLoading && lastAction === "clock-in" ? "Clocking In..." : "Clock In"}
              </span>
            </button>

            <button
              className={`flex items-center space-x-3 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 ${
                currentStatus !== "clocked-in"
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-sm"
                  : isLoading && lastAction === "clock-out"
                  ? "bg-red-400 text-white cursor-not-allowed shadow-md"
                  : "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl"
              }`}
              onClick={() => currentStatus === "clocked-in" && !isLoading && showConfirmationDialog('clockout')}
              disabled={currentStatus !== "clocked-in" || isLoading}
            >
              {isLoading && lastAction === "clock-out" ? (
                <FaSpinner className="animate-spin text-xl" />
              ) : (
                <FaSignOutAlt className="text-xl" />
              )}
              <span>
                {isLoading && lastAction === "clock-out" ? "Clocking Out..." : "Clock Out"}
              </span>
            </button>
          </div>
          
          {/* Help Text */}
          <div className="text-center text-sm text-gray-500 mt-4 pt-4 border-t border-gray-200">
            {currentStatus !== "clocked-in" && "Click 'Clock In' to start tracking your work time"}
            {currentStatus === "clocked-in" && "You're currently clocked in. Click 'Clock Out' when you finish working."}
          </div>
        </div>
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

export default Clockin;