import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const ToDoList = () => {
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate(); // Hook for navigation

  // Helper function to format the date to dd-mm-yyyy
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleDateClick = () => {
    const formattedDate = formatDate(date); // Ensure date is in dd-mm-yyyy format
    navigate(`/User/task?date=${formattedDate}`);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 mt-32">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-md overflow-hidden">
        <header className="bg-blue-600 text-white text-center py-6">
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="mt-2">Stay organized with your tasks</p>
        </header>

        <div className="flex flex-col sm:flex-row gap-6 p-6">
          <div className="flex-1">
            <Calendar
              onChange={handleDateChange}
              value={date}
              className="rounded-lg shadow-md border border-gray-300"
            />
          </div>

          <div className="flex-1 bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Selected Date: {formatDate(date)}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Click "View Tasks" to see tasks for the selected date.
            </p>
            <button
              onClick={handleDateClick}
              className="block w-full bg-blue-600 text-white text-lg py-3 rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              View Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToDoList;