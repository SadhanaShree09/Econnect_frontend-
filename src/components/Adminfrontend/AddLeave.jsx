import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faTrash, faSave, faPlus, faCalendarAlt, faExclamationTriangle, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LS, ipadr } from '../../Utils/Resuse';

const AddLeave = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState([]);
  const [workingDays, setWorkingDays] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workingDaysLoading, setWorkingDaysLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
  const [selectedHolidays, setSelectedHolidays] = useState([]);
  const [workingDaysError, setWorkingDaysError] = useState(null);

  const API_BASE_URL = `${ipadr}`;
  const isAdmin = LS.get('isadmin');

  // If not admin, redirect or show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-6xl mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page. Only administrators can manage holidays.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get year options (current year and next 3 years)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 4; i++) {
      years.push(currentYear + i);
    }
    return years;
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
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/holidays/${year}`);
      if (response.ok) {
        const data = await response.json();
        const sortedHolidays = sortHolidays(data.holidays || []);
        setHolidays(sortedHolidays);
      } else if (response.status === 404) {
        setHolidays([]);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch holidays: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error(err.message);
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

  // Add new holiday
  const addHoliday = async () => {
    if (!newHoliday.date || !newHoliday.name.trim()) {
      toast.error('Please fill in both date and holiday name');
      return;
    }

    setSaving(true);

    try {
      const updatedHolidays = [...holidays, { date: newHoliday.date, name: newHoliday.name.trim() }];
      const sortedHolidays = sortHolidays(updatedHolidays);
      
      const payload = {
        year: selectedYear,
        holidays: sortedHolidays
      };

      const response = await fetch(`${API_BASE_URL}/api/holidays/${selectedYear}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Holiday added successfully!');
        setNewHoliday({ date: '', name: '' });
        setShowAddForm(false);
        fetchHolidays(selectedYear);
        // Refetch working days as holidays might affect working day calculation
        fetchWorkingDays(selectedYear);
      } else {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || 'Failed to add holiday';
        } catch {
          errorMessage = `Server error: ${response.status} - ${errorText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Add error:', err);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete selected holidays
  const deleteSelectedHolidays = async () => {
    if (selectedHolidays.length === 0) {
      toast.error('Please select holidays to delete');
      return;
    }

    setSaving(true);

    try {
      const remainingHolidays = holidays.filter((_, index) => !selectedHolidays.includes(index));
      const sortedRemainingHolidays = sortHolidays(remainingHolidays);
      
      const payload = {
        year: selectedYear,
        holidays: sortedRemainingHolidays
      };

      const response = await fetch(`${API_BASE_URL}/api/holidays/${selectedYear}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(`${selectedHolidays.length} holiday(s) deleted successfully!`);
        setSelectedHolidays([]);
        setShowDeleteMode(false);
        fetchHolidays(selectedYear);
        // Refetch working days as holidays might affect working day calculation
        fetchWorkingDays(selectedYear);
      } else {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || 'Failed to delete holidays';
        } catch {
          errorMessage = `Server error: ${response.status} - ${errorText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle checkbox selection
  const handleHolidaySelection = (index) => {
    setSelectedHolidays(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Select all holidays
  const selectAllHolidays = () => {
    if (selectedHolidays.length === holidays.length) {
      setSelectedHolidays([]);
    } else {
      setSelectedHolidays(holidays.map((_, index) => index));
    }
  };

  useEffect(() => {
    fetchHolidays(selectedYear);
    fetchWorkingDays(selectedYear);
    setSelectedHolidays([]);
    setShowDeleteMode(false);
  }, [selectedYear]);

  return (
    <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md">
      {/* Header */}
      <h1 className="text-5xl font-semibold font-poppins pb-4 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text border-b-2">
        Holiday Management
      </h1>

      {/* Year Selector and Action Buttons */}
      <div className="flex justify-between items-center mt-3 mb-6">
        <h3 className="text-2xl font-semibold font-poppins py-2 text-zinc-500">
          Holidays for {selectedYear}
        </h3>
        <div className="flex items-center gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getYearOptions().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowDeleteMode(false);
            }}
            className="px-4 py-2 text-base bg-green-500 rounded-md text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add
          </button>
          <button
            onClick={() => {
              if (showDeleteMode) {
                setShowDeleteMode(false);
                setSelectedHolidays([]);
              } else {
                setShowDeleteMode(true);
                setShowAddForm(false);
              }
            }}
            className={`px-4 py-2 text-base rounded-md text-white focus:outline-none focus:ring-2 flex items-center gap-2 ${
              showDeleteMode 
                ? 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500' 
                : 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
            }`}
          >
            <FontAwesomeIcon icon={showDeleteMode ? faTimes : faTrash} />
            {showDeleteMode ? 'Cancel' : 'Delete'}
          </button>
          {showDeleteMode && selectedHolidays.length > 0 && (
            <button
              onClick={deleteSelectedHolidays}
              disabled={saving}
              className="px-4 py-2 text-base bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faTrash} />
              Delete Selected ({selectedHolidays.length})
            </button>
          )}
        </div>
      </div>

      {/* Add Holiday Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gradient-to-r from-white to-blue-100 border rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 font-poppins">Add New Holiday</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins"
                min={`${selectedYear}-01-01`}
                max={`${selectedYear}-12-31`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                Holiday Name
              </label>
              <input
                type="text"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Independence Day"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addHoliday}
              disabled={saving}
              className="px-4 py-2 text-base bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 font-poppins"
            >
              <FontAwesomeIcon icon={faSave} />
              {saving ? 'Adding...' : 'Save Holiday'}
            </button>
            <button
              onClick={() => setNewHoliday({ date: '', name: '' })}
              className="px-4 py-2 text-base bg-gray-500 hover:bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 font-poppins"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 font-poppins">Loading holidays...</span>
        </div>
      ) : (
        <>
          {/* No Holidays State */}
          {holidays.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-300 text-6xl mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2 font-poppins">No holidays found for {selectedYear}</h3>
              <p className="text-gray-500 mb-4 font-poppins">Click "Add" to start adding holidays for {selectedYear}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All Checkbox - Only show in delete mode */}
              {showDeleteMode && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border rounded-lg shadow-md p-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedHolidays.length === holidays.length && holidays.length > 0}
                      onChange={selectAllHolidays}
                      className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-red-800 font-poppins">
                      Select All ({holidays.length} holidays)
                    </label>
                  </div>
                </div>
              )}

              {/* Holiday List - Two Column Layout */}
              <div className="flex justify-between space-x-6">
                <div className="w-1/2">
                  <div className="holiday-list-container">
                    {holidays.slice(0, Math.ceil(holidays.length / 2)).map((holiday, index) => (
                      <div key={index} className="bg-gradient-to-r from-white to-blue-100 border rounded-lg shadow-md p-3 my-3 text-gray-800 font-poppins">
                        <div className="flex items-center gap-3">
                          {showDeleteMode && (
                            <input
                              type="checkbox"
                              checked={selectedHolidays.includes(index)}
                              onChange={() => handleHolidaySelection(index)}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            />
                          )}
                          <div className="flex-1">
                            <span className="text-sm font-normal mr-2">{holiday.date}</span>
                            <span className="text-sm font-bold">{holiday.name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="w-1/2">
                  <div className="holiday-list-container">
                    {holidays.slice(Math.ceil(holidays.length / 2)).map((holiday, index) => {
                      const actualIndex = Math.ceil(holidays.length / 2) + index;
                      return (
                        <div key={actualIndex} className="bg-gradient-to-r from-white to-blue-100 border rounded-lg shadow-md p-3 my-3 text-gray-800 font-poppins">
                          <div className="flex items-center gap-3">
                            {showDeleteMode && (
                              <input
                                type="checkbox"
                                checked={selectedHolidays.includes(actualIndex)}
                                onChange={() => handleHolidaySelection(actualIndex)}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                              />
                            )}
                            <div className="flex-1">
                              <span className="text-sm font-normal mr-2">{holiday.date}</span>
                              <span className="text-sm font-bold">{holiday.name}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <small className='italic'><span className='font-bold'>Note:</span> (G) - Gazetted Holiday</small>
            </div>
          )}
        </>
      )}

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

      {/* Toast Container */}
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
};

export default AddLeave;