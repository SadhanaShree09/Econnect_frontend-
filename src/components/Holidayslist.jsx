import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ipadr } from '../Utils/Resuse'; // Adjust the import path as needed

const Holidayslist = () => {
  const [showAllHolidays, setShowAllHolidays] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [workingDays, setWorkingDays] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workingDaysLoading, setWorkingDaysLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workingDaysError, setWorkingDaysError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const API_BASE_URL = `${ipadr}`;

  // Get year options (current year and next 3 years)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 4; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  // Format date to display format (e.g., "Monday, 15 Jan")
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Sort holidays by date (January to December)
  const sortHolidays = (holidaysArray) => {
    return [...holidaysArray].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
  };

  // Fetch holidays for selected year
  const fetchHolidays = async (year) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/holidays/${year}`);
      if (response.ok) {
        const data = await response.json();
        const sortedHolidays = sortHolidays(data.holidays || []);
        
        // Format holidays for display
        const formattedHolidays = sortedHolidays.map(holiday => ({
          date: formatDateForDisplay(holiday.date),
          name: holiday.name
        }));
        
        setHolidays(formattedHolidays);
      } else if (response.status === 404) {
        setHolidays([]);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch holidays: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch working days for selected year
  const fetchWorkingDays = async (year) => {
    setWorkingDaysLoading(true);
    setWorkingDaysError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/working-days/${year}`);
      if (response.ok) {
        const data = await response.json();
        setWorkingDays(data);
      } else if (response.status === 404) {
        setWorkingDays(null);
        setWorkingDaysError('Working days data not found for this year');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch working days: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('Working days fetch error:', err);
      setWorkingDaysError(err.message);
      setWorkingDays(null);
    } finally {
      setWorkingDaysLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays(selectedYear);
    fetchWorkingDays(selectedYear);
  }, [selectedYear]);

  //| Variable     | What's inside?                  |
  //| ------------ | ------------------------------- |
  //| `firstHalf`  | First 5 holidays (`0 to 4`)     |
  //| `secondHalf` | Remaining holidays (`5 to end`) |

  const firstHalf = holidays.slice(0, Math.ceil(holidays.length / 2));
  const secondHalf = holidays.slice(Math.ceil(holidays.length / 2));

  return (
    <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md">
      <h1 className="text-5xl font-semibold font-poppins pb-4 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text border-b-2">
        Leave Management
      </h1>
      
      <div className="flex justify-between mt-3">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-semibold font-poppins py-2 text-zinc-500">
            Holidays Calendar
          </h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-1 text-sm bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getYearOptions().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <Link to="/User/Leave">
          <div className="">
            <button className="px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white">
              Go Back
            </button>
          </div>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 font-poppins">Loading holidays...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 text-lg font-poppins mb-4">
            Error loading holidays: {error}
          </div>
          <button
            onClick={() => fetchHolidays(selectedYear)}
            className="px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      ) : holidays.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 mb-2 font-poppins">No holidays found for {selectedYear}</h3>
          <p className="text-gray-500 mb-4 font-poppins">Contact administrator to add holidays for {selectedYear}</p>
        </div>
      ) : (
        <div className="flex justify-between space-x-6">
          <div className="w-1/2">
            <div className="holiday-list-container">
              {firstHalf.map((holiday, index) => (
                <p key={index} className="bg-gradient-to-r from-white to-blue-100 border-x rounded-lg shadow-md p-2 my-3 text-gray-800 font-poppins px-6">
                  <span className="text-sm font-normal mr-1">{holiday.date}</span>
                  <span className="text-sm font-bold">{holiday.name}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="w-1/2">
            <div className="holiday-list-container">
              {secondHalf.map((holiday, index) => (
                <p key={index} className="bg-gradient-to-r from-white to-blue-100 border-x rounded-lg shadow-md p-2 my-3 text-gray-800 font-poppins px-6">
                  <span className="text-sm font-normal mr-1">{holiday.date}</span> 
                  <span className="text-sm font-bold">{holiday.name}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className='text-sm font-poppins text-gray-800 italic pt-2'>
        <span className='font-semibold'>Note: </span>(G) - Gazetted Holiday
      </p>
      
      {/* Working Days Section */}
      <div className="mt-6">
        {workingDaysLoading ? (
          <div className="bg-gradient-to-r from-white to-blue-100 border-x rounded-lg shadow-md p-4 my-3 text-gray-800 font-poppins px-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading working days...</span>
            </div>
          </div>
        ) : workingDaysError ? (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg shadow-md p-4 my-3 text-red-800 font-poppins px-6">
            <h2 className="text-xl font-bold mb-2">Working Days - {selectedYear}</h2>
            <p className="text-sm">Error: {workingDaysError}</p>
            <button
              onClick={() => fetchWorkingDays(selectedYear)}
              className="mt-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Retry
            </button>
          </div>
        ) : workingDays ? (
          <div className="bg-gradient-to-r from-white to-blue-100 border-x rounded-lg shadow-md p-4 my-3 text-gray-800 font-poppins px-6">
            <h2 className="text-xl font-bold mb-2">Working Days - {selectedYear}</h2>
            <p className="text-lg">Total Working Days: <span className="font-semibold text-blue-600">{workingDays.totalWorkingDays}</span></p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg shadow-md p-4 my-3 text-gray-600 font-poppins px-6">
            <h2 className="text-xl font-bold mb-2">Working Days - {selectedYear}</h2>
            <p>No working days data available for this year</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Holidayslist;