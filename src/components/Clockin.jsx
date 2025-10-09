import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaClock, FaSignInAlt, FaSignOutAlt, FaSpinner, FaCheckCircle, FaTimesCircle, FaCalendarDay } from "react-icons/fa";
import { Baseaxios, LS  ,ipadr } from "../Utils/Resuse";

function Clockin() {
  const [Login, setLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [todayClockIn, setTodayClockIn] = useState(null);
  const [todayClockOut, setTodayClockOut] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("not-clocked-in"); // not-clocked-in, clocked-in, clocked-out
  const [todayDate, setTodayDate] = useState(new Date());
  const [fetchingStatus, setFetchingStatus] = useState(true);

  // Fetch today's status on component mount
  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      setFetchingStatus(true);
      const userId = LS.get("userid");
      const response = await fetch(`${ipadr}/clock-records/${userId}`);
      const data = await response.json();
      
      if (data && data.clock_records && Array.isArray(data.clock_records)) {
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Find today's record
        const todayRecord = data.clock_records.find(record => {
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          return recordDate === todayStr;
        });
        
        if (todayRecord) {
          // User has a record for today
          if (todayRecord.clockin) {
            setTodayClockIn(new Date(todayRecord.clockin));
            setLogin(true);
          }
          
          if (todayRecord.clockout) {
            setTodayClockOut(new Date(todayRecord.clockout));
            setCurrentStatus("clocked-out");
            setLogin(false);
          } else if (todayRecord.clockin) {
            setCurrentStatus("clocked-in");
            setLogin(true);
          }
        } else {
          // No record for today
          setCurrentStatus("not-clocked-in");
          setLogin(false);
        }
      }
    } catch (error) {
      console.error("Error fetching today's status:", error);
      toast.error("❌ Failed to load today's status");
    } finally {
      setFetchingStatus(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
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
          setTodayClockIn(now);
          setCurrentStatus("clocked-in");
          setLogin(true);
          
          toast.success(`Successfully clocked in at ${formatTime(now)}!`, {
            autoClose: 2000
          });
          
          // Refresh status
          fetchTodayStatus();
        } else if (data.message && data.message.includes("Already clocked in")) {
          setCurrentStatus("clocked-in");
          setLogin(true);
          toast.info("⚠️ " + data.message);
          fetchTodayStatus();
        } else {
          toast.info("ℹ️ " + data.message);
          if (data.message.includes("successful")) {
            setLogin(true);
            setCurrentStatus("clocked-in");
            fetchTodayStatus();
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
            setTodayClockOut(now);
            setCurrentStatus("clocked-out");
            setLogin(false);
            
            toast.success(`✅ Successfully clocked out at ${formatTime(now)}!`, {
              autoClose: 2000
            });
            
            // Refresh status
            fetchTodayStatus();
          } else if (data.message.includes("Previous Day") || data.message.includes("previous day") || data.message.includes("incomplete")) {
            // User needs to use previous day clock-out
            toast.warning(`⚠️ ${data.message}`, {
              autoClose: 5000
            });
          } else if (data.message.includes("already clocked out") || data.message.includes("Already clocked out")) {
            toast.info(`ℹ️ ${data.message}`);
            setLogin(false);
            setCurrentStatus("clocked-out");
            fetchTodayStatus();
          } else if (data.message.includes("Clock-in required") || data.message.includes("Please clock in")) {
            toast.warning("⚠️ Please clock in first before clocking out.");
            setCurrentStatus("not-clocked-in");
            setLogin(false);
            fetchTodayStatus();
          } else {
            // Generic success message
            toast.success("✅ " + data.message);
            setLogin(false);
            setCurrentStatus("clocked-out");
            fetchTodayStatus();
          }
        } else if (data.error) {
          // Handle error response
          toast.error("❌ " + data.error);
        } else {
          toast.info("ℹ️ Clock-out processed");
          fetchTodayStatus();
        }
      })
      .catch(error => {
        setIsLoading(false);
        setLastAction(null);
        toast.error("❌ Clock-out failed. Please check your connection and try again.");
        console.error(error);
      });
  };

  return (
    <div className="w-full">
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 border-2 border-gray-200">
            <div className="text-center">
              <div className="mb-4">
                {confirmationAction === 'clockin' ? (
                  <FaSignInAlt className="text-6xl text-green-300 mx-auto" />
                ) : (
                  <FaSignOutAlt className="text-6xl text-red-300 mx-auto" />
                )}
              </div>
              <div className="text-2xl font-bold mb-3 text-gray-800">
                {confirmationAction === 'clockin' ? 'Confirm Clock In' : 'Confirm Clock Out'}
              </div>
              <p className="text-gray-600 mb-4 text-base">
                {confirmationAction === 'clockin' 
                  ? 'Are you sure you want to clock in now?' 
                  : 'Are you sure you want to clock out now?'}
              </p>
              <div className="bg-blue-50 rounded-lg p-3 mb-6">
                <div className="text-sm text-gray-600 mb-1">Current Time</div>
                <div className="text-xl font-bold text-blue-600">{formatTime(new Date())}</div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={hideConfirmationDialog}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-bold text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  className={`flex-1 px-6 py-3 text-white rounded-lg transition-colors font-bold text-base ${
                    confirmationAction === 'clockin' 
                      ? 'bg-green-300 hover:bg-green-400' 
                      : 'bg-red-300 hover:bg-red-400'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {fetchingStatus ? (
        <div className="flex justify-center items-center py-16">
          <FaSpinner className="animate-spin text-5xl text-blue-500" />
          <span className="ml-4 text-xl text-gray-600">Loading...</span>
        </div>
      ) : (
        <>
          {/* Today's Date & Status Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            {/* Date Header */}
            <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-gray-200">
              <FaCalendarDay className="text-blue-500 text-xl" />
              <span className="text-base font-medium text-gray-600">Today:</span>
              <span className="text-base font-bold text-gray-800">{formatDate(todayDate)}</span>
            </div>
            
            {/* Status Display */}
            <div>
              {currentStatus === "not-clocked-in" && (
                <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-5 border-2 border-gray-300">
                  <FaTimesCircle className="text-4xl text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="text-lg font-bold text-gray-700">Not Clocked In</div>
                    <div className="text-sm text-gray-500 mt-1">Ready to start your work day</div>
                  </div>
                </div>
              )}

              {currentStatus === "clocked-in" && (
                <div className="flex items-center space-x-4 bg-white rounded-lg p-5 border-2 border-green-300">
                  <FaCheckCircle className="text-4xl text-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-lg font-bold text-green-700">Currently Clocked In</div>
                    <div className="text-base text-green-600 font-semibold mt-2">
                      Started at: {formatTime(todayClockIn)}
                    </div>
                  </div>
                </div>
              )}

              {currentStatus === "clocked-out" && (
                <div className="bg-white rounded-lg p-5 border-2 border-blue-300">
                  <div className="flex items-center space-x-3 mb-4">
                    <FaCheckCircle className="text-3xl text-blue-500" />
                    <div className="text-lg font-bold text-blue-700">Completed for Today</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Clock In</div>
                      <div className="text-lg font-bold text-blue-600">{formatTime(todayClockIn)}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Clock Out</div>
                      <div className="text-lg font-bold text-blue-600">{formatTime(todayClockOut)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                className={`flex items-center justify-center space-x-3 px-6 py-4 text-base font-bold rounded-lg transition-all duration-200 ${
                  currentStatus !== "not-clocked-in"
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : isLoading && lastAction === "clock-in"
                    ? "bg-green-200 text-white cursor-not-allowed"
                    : "bg-green-100 text-green-800 hover:bg-green-200 shadow-md hover:shadow-lg transform hover:scale-105 border border-green-300"
                }`}
                onClick={() => currentStatus === "not-clocked-in" && !isLoading && showConfirmationDialog('clockin')}
                disabled={currentStatus !== "not-clocked-in" || isLoading}
              >
                {isLoading && lastAction === "clock-in" ? (
                  <FaSpinner className="animate-spin text-xl" />
                ) : (
                  <FaSignInAlt className="text-xl" />
                )}
                <span>{isLoading && lastAction === "clock-in" ? "Clocking In..." : "Clock In"}</span>
              </button>

              <button
                className={`flex items-center justify-center space-x-3 px-6 py-4 text-base font-bold rounded-lg transition-all duration-200 ${
                  currentStatus !== "clocked-in"
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : isLoading && lastAction === "clock-out"
                    ? "bg-red-200 text-white cursor-not-allowed"
                    : "bg-red-100 text-red-800 hover:bg-red-200 shadow-md hover:shadow-lg transform hover:scale-105 border border-red-300"
                }`}
                onClick={() => currentStatus === "clocked-in" && !isLoading && showConfirmationDialog('clockout')}
                disabled={currentStatus !== "clocked-in" || isLoading}
              >
                {isLoading && lastAction === "clock-out" ? (
                  <FaSpinner className="animate-spin text-xl" />
                ) : (
                  <FaSignOutAlt className="text-xl" />
                )}
                <span>{isLoading && lastAction === "clock-out" ? "Clocking Out..." : "Clock Out"}</span>
              </button>
            </div>
            
            {/* Help Text */}
            <div className="text-center text-sm text-gray-500 mt-5 pt-5 border-t border-gray-200">
              {currentStatus === "not-clocked-in" && "Click 'Clock In' to start your work day"}
              {currentStatus === "clocked-in" && "Click 'Clock Out' when you finish work"}
              {currentStatus === "clocked-out" && "✓ Attendance recorded for today"}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Clockin;