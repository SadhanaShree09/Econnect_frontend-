import React, { useState } from "react";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Baseaxios, LS } from "../Utils/Resuse";
import moment from 'moment';

// const indianTimezone = 'Asia/Kolkata';


const LeaveRequest = () => {
  const [leaveType, setLeaveType] = useState("");
  // const [selectedDate, setSelectedDate] = useState(moment().tz(indianTimezone));
  const [selectedDate, setSelectedDate] = useState(null); // Set initial value here
  const [timeSlot, setTimeSlot] = useState("");
  const [reason, setReason] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  // State for "Other Leave" fields
  const [otherFromDate, setOtherFromDate] = useState(null);
  const [otherToDate, setOtherToDate] = useState(null);
  const [otherReason, setOtherReason] = useState("");
  
  // State for "Bonus Leave" fields
  const [bonusLeaveDate, setBonusLeaveDate] = useState(null);  // Initialize the bonus leave date
  const [bonusLeaveReason, setBonusLeaveReason] = useState("");
  
// function formatTimestamp(timestamp) {
//   // Parse the timestamp using moment.js
//   let parsedTimestamp = moment(timestamp);

//   // Convert to Asia/Kolkata timezone
//   parsedTimestamp = parsedTimestamp.tz("Asia/Kolkata");

//   // Format the timestamp as "DD-MM-YYYY"
//   let formattedTimestamp = parsedTimestamp.format("DD-MM-YYYY");
// }

  const handleLeaveTypeChange = (event) => {
    setLeaveType(event.target.value);
    setSelectedDate(null); // Clear selected date when changing leave type
    setValidationMessage("");
  };

  const handleDateChange = (date) => {
    // Ensure we only set valid dates
    if (date && moment.isMoment(date)) {
      setSelectedDate(date);
    } else if (date instanceof Date && !isNaN(date.getTime())) {
      setSelectedDate(moment(date));
    } else {
      setSelectedDate(null);
    }
    console.log("Selected date:", selectedDate);
    setValidationMessage("");
  };

  const handleTimeSlotChange = (event) => {
    setTimeSlot(event.target.value);
    setValidationMessage("");
  };

  const handleReasonChange = (event) => {
    setReason(event.target.value);
    setValidationMessage("");
  };

  // Handlers for "Other Leave" fields
  const handleOtherFromDateChange = (date) => {
    // Ensure we only set valid dates
    if (date && moment.isMoment(date)) {
      setOtherFromDate(date);
    } else if (date instanceof Date && !isNaN(date.getTime())) {
      setOtherFromDate(moment(date));
    } else {
      setOtherFromDate(null);
    }
    setValidationMessage("");
  };

  const handleOtherToDateChange = (date) => {
    // Ensure we only set valid dates
    if (date && moment.isMoment(date)) {
      setOtherToDate(date);
    } else if (date instanceof Date && !isNaN(date.getTime())) {
      setOtherToDate(moment(date));
    } else {
      setOtherToDate(null);
    }
    setValidationMessage("");
  };

  const handleOtherReasonChange = (event) => {
    setOtherReason(event.target.value);
    setValidationMessage("");
  };

  const handleCancel = () => {
    setLeaveType("");
    setSelectedDate(null);
    setReason("");
    setValidationMessage("");
    setIsApplying(false);
  };
  
  const handleBonusLeaveDateChange = (date) => {
    // Ensure we only set valid dates
    if (date && moment.isMoment(date)) {
      setBonusLeaveDate(date);
    } else if (date instanceof Date && !isNaN(date.getTime())) {
      setBonusLeaveDate(moment(date));
    } else {
      setBonusLeaveDate(null);
    }
    setValidationMessage("");  // Clear validation message
  };
  
  const handleBonusLeaveReasonChange = (e) => {
    setBonusLeaveReason(e.target.value);
  };

  const leaverequestapi = (newLeave) => {
    setIsApplying(true);
    const userid = LS.get("userid");
    let currentDate = new Date();
    let time = currentDate.toLocaleTimeString().toString();

    // Define the endpoint based on the leave type
    let endpoint = "/leave-request";
    if (newLeave.leaveType === "Other Leave") {
      endpoint = "/Other-leave-request";
    }
    if (newLeave.leaveType === "Permission") {                                                                                                                                                                              
      endpoint = "/Permission-request";
    }
    if (newLeave.leaveType === "Bonus Leave") {                                                                                                   
      endpoint = "/Bonus-leave-request";  
      
    }
    let status="";
    // if(LS.get('position')==="Manager")
    //   {
    //     status="Recommend";
    //   }
    console.log(newLeave);
    Baseaxios.post(endpoint, {
      userid,
      employeeName: LS.get("name"),
      time: time,
      ...newLeave,
      status:status,
    })
      .then((response) => {
        console.log(response);
        console.log(newLeave)
        setIsApplying(false);
        
        // Handle new structured response format
        const responseData = response.data;
        
        // Check if it's the new structured response
        if (responseData.success !== undefined) {
          if (responseData.success) {
            // Successful submission
            toast.success(responseData.message || "Leave request submitted successfully");
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else if (responseData.status === "conflict") {
            // Business logic conflict (not an error)
            toast.warning(`📅 ${responseData.message}`, {
              autoClose: 6000,
              position: "top-center"
            });
            setTimeout(() => {
              toast.info(`💡 ${responseData.suggestion}`, {
                autoClose: 5000,
                position: "top-center"
              });
            }, 1000);
          } else if (responseData.status === "validation_error") {
            // Validation error - show detailed error message
            toast.error(`❌ ${responseData.details || responseData.message}`, {
              autoClose: 5000,
              position: "top-center"
            });
            setTimeout(() => {
              toast.info(`💡 ${responseData.suggestion}`, {
                autoClose: 4000,
                position: "top-center"
              });
            }, 1000);
          }
        } else {
          // Handle legacy response format
          const resultMessage = responseData.result || responseData.message;
          
          if (resultMessage === "Leave request stored successfully" || 
              resultMessage === "Leave request processed" ||
              resultMessage === "Bonus leave request processed" ||
              resultMessage === "Permission request processed" ||
              (typeof resultMessage === "string" && resultMessage.includes("successfully"))) {
            toast.success("Leave request submitted successfully");
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            toast.warning(resultMessage || "Leave request processed with conditions");
          }
        }
        
        console.log("Leave request response:", response);
      })
      .catch((err) => {
        setIsApplying(false);
        console.error("Error:", err);
        
        // Handle different types of errors
        if (err.response && err.response.data) {
          const errorMessage = err.response.data.detail || err.response.data.result || err.response.data.message;
          
          if (errorMessage && typeof errorMessage === 'string') {
            // Check if it's a conflict error
            if (errorMessage.includes('Conflict') || errorMessage.includes('already has')) {
              toast.error(`⚠️ ${errorMessage}`, {
                autoClose: 5000,
                position: "top-center"
              });
              // Show additional helpful message
              setTimeout(() => {
                toast.info("💡 Tip: Check your leave history to view existing requests for this date", {
                  autoClose: 4000,
                  position: "top-center"
                });
              }, 1000);
            } else if (errorMessage.includes('Sunday')) {
              toast.error("❌ Leave requests cannot be made for Sundays", {
                autoClose: 3000
              });
            } else {
              toast.error(`❌ ${errorMessage}`, {
                autoClose: 4000
              });
            }
          } else {
            toast.error("❌ Leave request failed. Please check your inputs and try again.", {
              autoClose: 3000
            });
          }
        } else {
          toast.error("❌ Network error. Please check your connection and try again.", {
            autoClose: 3000
          });
        }
      });
};

const handleApplyButtonClick = () => {
  if (!leaveType) {
    setValidationMessage("Select a leave type");
  } else if (leaveType === "Other Leave" && (!otherFromDate || !otherToDate || !otherReason.trim())) {
    setValidationMessage("Complete all fields for Other Leave");
  } else if (!selectedDate && (leaveType === "Sick Leave" || leaveType === "Casual Leave" || leaveType === "Bonus Leave" )) {
    setValidationMessage("Select a valid date");
  } else if (!reason.trim() && (leaveType === "Sick Leave" || leaveType === "Casual Leave" || leaveType === "Bonus Leave")) {
    setValidationMessage("Enter a valid reason");
  } else if (leaveType === "Permission" && (!selectedDate || !timeSlot || !reason.trim())) {
    setValidationMessage("Complete all fields for Permission");
  } else {
    let newLeave;

    if (leaveType === "Sick Leave" || leaveType === "Casual Leave" || leaveType === "Bonus Leave") {
      let formattedSelectedDate;
      
      // Handle moment objects or Date objects
      if (moment.isMoment(selectedDate)) {
        formattedSelectedDate = selectedDate.format("YYYY-MM-DD");
      } else if (selectedDate instanceof Date) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        formattedSelectedDate = `${year}-${month}-${day}`;
      } else {
        setValidationMessage("Invalid date selected");
        return;
      }

  // Already formatted as YYYY-MM-DD above, no need to reformat

      newLeave = {
        leaveType,
        selectedDate: formattedSelectedDate,
        reason,
        requestDate: new Date().toISOString().split('T')[0],
      };
    } else if (leaveType === "Other Leave") {
      let formattedFromDate, formattedToDate;

      // Convert otherFromDate to a Date object if it's not already
      if (!(otherFromDate instanceof Date)) {
        formattedFromDate = moment(formattedFromDate).format("YYYY-MM-DD");
      }

      // Convert otherToDate to a Date object if it's not already
      if (!(otherToDate instanceof Date)) {
        formattedToDate = moment(formattedToDate).format("YYYY-MM-DD");
      }

      newLeave = {
        leaveType,
        selectedDate: formattedFromDate,
        ToDate: formattedToDate,
        reason: otherReason,
        requestDate: new Date().toISOString().split('T')[0],
      };
    } else if (leaveType === "Permission") {
      let formattedSelectedDate;
      
      // Handle moment objects or Date objects
      if (moment.isMoment(selectedDate)) {
        formattedSelectedDate = selectedDate.format("YYYY-MM-DD");
      } else if (selectedDate instanceof Date) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        formattedSelectedDate = `${year}-${month}-${day}`;
      } else {
        setValidationMessage("Invalid date selected");
        return;
      }

  // Already formatted as YYYY-MM-DD above, no need to reformat

      newLeave = {
        leaveType,
        selectedDate: formattedSelectedDate,
        timeSlot,
        reason,
        requestDate: new Date().toISOString().split('T')[0],
      };
    }

    leaverequestapi(newLeave);
  }
};

const isWeekday = (date) => {
  const day = date.getDay();
  return day !== 0 && date >= new Date(); // 0 = Sunday
};

  const isValidDate = (current, leaveType) => {
    // Convert moment object to Date if necessary
    const date = current instanceof Date ? current : current.toDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if the selected date is a Sunday (getDay() returns 0 for Sunday)
    if (date.getDay() === 0) {
      return false; // Disable Sunday selection
    }

    if (leaveType === "Sick Leave" || leaveType === "Casual Leave" || leaveType === "Permission" || leaveType === "Other Leave" || leaveType === "Bonus Leave") {
      // Allow all days except Sundays and past dates
      return date >= today;
    }

    return false;
  };



  
  // Default: Allow all other dates

  return (
    <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md">
      <h1 className="text-5xl font-semibold font-poppins pb-2 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text border-b-2">
        Leave Management
      </h1>
      <div className="flex justify-between mt-3">
        <h3 className="text-2xl font-semibold font-poppins py-2 text-zinc-500">
          Request a Leave
        </h3>
        <Link to="/User/Leave">
          <div className="">
            <button className=" p-2 bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black  active:bg-white active:text-white">
              Go Back
            </button>
          </div>
        </Link>
      </div>
      <div className="">
        <div className=" mt-6 bg-gradient-to-tr from-white to-blue-100 border-x p-4 rounded-lg shadow-xl">
          <div>
            <h2 className="text-sm font-semibold mb-2 font-poppins">
              Type of Leave
            </h2>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  value="Sick Leave"
                  checked={leaveType === "Sick Leave"}
                  onChange={handleLeaveTypeChange}
                />
                <span className="ml-2 font-poppins text-sm">Sick Leave</span>
              </label>
              <label className="inline-flex items-center ml-4">
                <input
                  type="radio"
                  className="form-radio"
                  value="Casual Leave"
                  checked={leaveType === "Casual Leave"}
                  onChange={handleLeaveTypeChange}
                />
                <span className="ml-2 font-poppins text-sm">Casual Leave</span>
              </label>
              <label className="inline-flex items-center ml-4 mb-2">
                <input
                  type="radio"
                  className="form-radio"
                  value="Other Leave"
                  checked={leaveType === "Other Leave"}
                  onChange={handleLeaveTypeChange}
                />
                <span className="ml-2 font-poppins text-sm">Other Leave</span>
              </label>
              <label className="inline-flex items-center ml-4">
                <input
                  type="radio"
                  className="form-radio"
                  value="Permission"
                  checked={leaveType === "Permission"}
                  onChange={handleLeaveTypeChange}
                />
                <span className="ml-2 font-poppins text-sm">Permission</span>
              </label>
              <label className="inline-flex items-center ml-4">
                <input
                  type="radio"
                  className="form-radio"
                  value="Bonus Leave"
                  checked={leaveType === "Bonus Leave"}
                  onChange={handleLeaveTypeChange}
                />
                <span className="ml-2 font-poppins text-sm">Bonus Leave</span>
              </label>
            </div>
          </div>
          {(leaveType === "Sick Leave" || leaveType === "Casual Leave" || leaveType === "Permission" || leaveType === "Bonus Leave") && (
            <div>
              <h2 className="text-sm font-semibold mb-2 font-poppins">Date</h2>
              <div>
                <Datetime
                  value={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="DD-MM-YYYY"
                  isValidDate={(current) => isValidDate(current, leaveType)}
                  timeFormat={false}
                  closeOnSelect
                  inputProps={{
                    className:
                      "p-2 text-sm border border-gray-300 rounded-md block w-full mb-2",
                    placeholder: "Select date",
                  }}
                />
              </div>
              {leaveType === "Permission" && (
                <div>
                  <h2 className="text-sm font-semibold mb-2 font-poppins">Time Slot</h2>
                  <div className="mb-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        value="Forenoon"
                        checked={timeSlot === "Forenoon"}
                        onChange={handleTimeSlotChange}
                      />
                      <span className="ml-2 font-poppins text-sm">Forenoon</span>
                    </label>
                    <label className="inline-flex items-center ml-4">
                      <input
                        type="radio"
                        className="form-radio"
                        value="Afternoon"
                        checked={timeSlot === "Afternoon"}
                        onChange={handleTimeSlotChange}
                      />
                      <span className="ml-2 font-poppins text-sm">Afternoon</span>
                    </label>
                  </div>
                </div>
              )}
              <h2 className="text-sm font-semibold mb-2 font-poppins">Reason</h2>
              <div>
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full font-poppins rounded-lg text-sm"
                  placeholder="Enter reason"
                  value={reason}
                  onChange={handleReasonChange}
                />
              </div>
            </div>
          )}

          {leaveType === "Other Leave" && (
            <div>
              <h2 className="text-sm font-semibold mb-2 font-poppins">From Date</h2>
              <div>
                <Datetime
                  value={otherFromDate}
                  onChange={handleOtherFromDateChange}
                  dateFormat="DD-MM-YYYY"
                  isValidDate={(current) => isValidDate(current, leaveType)}
                  timeFormat={false}
                  closeOnSelect
                  inputProps={{
                    className:
                      "p-2 text-sm border border-gray-300 rounded-md block w-full mb-2",
                    placeholder: "Select from date",
                  }}
                />
              </div>
              <h2 className="text-sm font-semibold mb-2 font-poppins">To Date</h2>
              <div>
                <Datetime
                  value={otherToDate}
                  onChange={handleOtherToDateChange}
                  dateFormat="DD-MM-YYYY"
                  isValidDate={(current) => isValidDate(current, leaveType)}
                  timeFormat={false}
                  closeOnSelect
                  inputProps={{
                    className:
                      "p-2 text-sm border border-gray-300 rounded-md block w-full mb-2",
                    placeholder: "Select to date",
                  }}
                />
              </div>
              <h2 className="text-sm font-semibold mb-2 font-poppins">Reason</h2>
              <div>
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full font-poppins rounded-lg text-sm"
                  placeholder="Enter reason"
                  value={otherReason}
                  onChange={handleOtherReasonChange}
                />
              </div>
            </div>
          )}

          {validationMessage && (
            <p className="text-red-400 text-xs italic font-poppins mt-2">
              {validationMessage}
            </p>
          )}

          {/* Helpful notice section */}
          <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> You cannot submit multiple leave requests for the same date. 
                  If you see a conflict message, check your leave history to view existing requests.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button
              className={`p-2 mr-2 bg-blue-500  rounded-md text-white hover:bg-[#b7c6df80] hover:text-black  active:bg-white active:text-white ${
                isApplying ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleApplyButtonClick}
              disabled={isApplying}
            >
              {isApplying ? "Applying..." : "Apply"}
            </button>
            <button
              className=" p-2 bg-gray-500  rounded-md hover:text-slate-900 text-white "
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
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
};

export default LeaveRequest;
