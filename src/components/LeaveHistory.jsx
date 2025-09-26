import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LS, ipadr } from "../Utils/Resuse";
import axios from "axios";
import { format, isWithinInterval, parseISO,isEqual, startOfDay } from 'date-fns';
import { ArrowUp, ArrowDown, ArrowUpDown, RotateCw } from "lucide-react";
import { DateRangePicker } from "react-date-range";

const LeaveHistory = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedOption, setSelectedOption] = useState("Leave");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    column: null,
    direction: 'asc'
  });
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  useEffect(() => {
    fetchData();
  }, [selectedOption]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userid = LS.get("userid");
      let endpoint = "";

      switch (selectedOption) {
        case "Leave":
          endpoint = `${ipadr}/leave-History/${userid}/?selectedOption=Leave`;
          break;
        case "LOP":
          endpoint = `${ipadr}/Other-leave-history/${userid}/?selectedOption=LOP`;
          break;
        case "Permission":
          endpoint = `${ipadr}/Permission-history/${userid}/?selectedOption=Permission`;
          break;
        default:
          break;
      }

      const leaveResponse = await axios.get(endpoint);
      const responseData = leaveResponse.data && Array.isArray(leaveResponse.data.leave_history)
        ? leaveResponse.data.leave_history
        : [];
      
      setLeaveData(responseData);
      if (dateRange[0].startDate && dateRange[0].endDate) {
        const filtered = responseData.filter(item => {
          const itemDate = new Date(item.selectedDate || item.requestDate);
          const start = new Date(dateRange[0].startDate);
          const end = new Date(dateRange[0].endDate);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          return itemDate >= start && itemDate <= end;
        });
        setFilteredData(filtered);
      } else {
        setFilteredData(responseData);
      }
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setLeaveData([]);
      setFilteredData([]);
      setError("Error fetching data. Please try again later.");
    }
  };

  const convertDateFormat = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  };

  const filterDataByDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
      setFilteredData(leaveData);
      return;
    }

    const filtered = leaveData.filter(item => {
      const itemDate = parseISO(convertDateFormat(item.selectedDate || item.requestDate));
      return isWithinInterval(itemDate, {
        start: startDate,
        end: endDate
      });
    });

    const sortedData = sortConfig.column 
      ? sortData(filtered, sortConfig.column) 
      : filtered;
    
    setFilteredData(sortedData);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRange([ranges.selection]);
    filterDataByDateRange(startDate, endDate);
  };

  const handleReset = () => {
    setDateRange([{
      startDate: null,
      endDate: null,
      key: "selection"
    }]);
    setFilteredData(leaveData);
    setCurrentPage(1);
    setSortConfig({ column: null, direction: 'asc' });
    setShowDatePicker(false);
  };

  const sortData = (data, column) => {
    return [...data].sort((a, b) => {
      let compareA, compareB;

      switch (column) {
        case 'date':
        case 'selectedDate':
        case 'requestDate':
          compareA = new Date(convertDateFormat(a[column] || a.selectedDate || a.requestDate)).getTime();
          compareB = new Date(convertDateFormat(b[column] || b.selectedDate || b.requestDate)).getTime();
          break;
        default:
          compareA = a[column];
          compareB = b[column];
      }

      if (compareA < compareB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (compareA > compareB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const toggleSort = (column) => {
    setSortConfig(prevConfig => {
      const newConfig = {
        column,
        direction: 
          prevConfig.column === column && prevConfig.direction === 'asc' 
            ? 'desc' 
            : 'asc'
      };
      
      const newSortedData = sortData(filteredData, column);
      setFilteredData(newSortedData);
      
      return newConfig;
    });
  };

  const renderSortIcon = (column) => {
    if (sortConfig.column !== column) {
      return <ArrowUpDown className="inline ml-1 w-4 h-4" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="inline ml-1 w-4 h-4" />
      : <ArrowDown className="inline ml-1 w-4 h-4" />;
  };

  const renderTableHeader = () => {
    switch (selectedOption) {
      case "Leave":
        return (
          <thead className="text-sm font-semibold uppercase text-black bg-[#6d9eeb7a]">
            <tr>
              <th className="p-2 whitespace-nowrap text-start">S.No</th>
              <th className="p-2 whitespace-nowrap text-start">Employee ID</th>
              <th className="p-2 whitespace-nowrap text-start">Name</th>
              <th className="p-2 whitespace-nowrap text-start">Leave Type</th>
              <th 
                className="p-2 whitespace-nowrap text-start cursor-pointer" 
                onClick={() => toggleSort('date')}
              >
                Date {renderSortIcon('date')}
              </th>
              <th className="p-2 whitespace-nowrap text-start" style={{ width: "30%" }}>
                Reason
              </th>
              <th className="p-2 whitespace-nowrap text-start">Status</th>
            </tr>
          </thead>
        );
      case "LOP":
        return (
          <thead className="text-sm font-semibold uppercase text-black bg-[#6d9eeb7a]">
            <tr>
              <th className="p-2 whitespace-nowrap text-start">S.No</th>
              <th className="p-2 whitespace-nowrap text-start">EMPLOYEE ID</th>
              <th className="p-2 whitespace-nowrap text-start">NAME</th>
              <th 
                className="p-2 whitespace-nowrap text-start cursor-pointer"
                onClick={() => toggleSort('fromDate')}
              >
                FROM DATE {renderSortIcon('fromDate')}
              </th>
              <th 
                className="p-2 whitespace-nowrap text-start cursor-pointer"
                onClick={() => toggleSort('toDate')}
              >
                TO DATE {renderSortIcon('toDate')}
              </th>
              <th className="p-2 whitespace-nowrap text-start" style={{ width: "30%" }}>
                REASON
              </th>
              <th className="p-2 whitespace-nowrap text-start">STATUS</th>
            </tr>
          </thead>
        );
      case "Permission":
        return (
          <thead className="text-sm font-semibold uppercase text-black bg-[#6d9eeb7a]">
            <tr>
              <th className="p-2 whitespace-nowrap text-start">S.No</th>
              <th className="p-2 whitespace-nowrap text-start">EMPLOYEE ID</th>
              <th className="p-2 whitespace-nowrap text-start">NAME</th>
              <th 
                className="p-2 whitespace-nowrap text-start cursor-pointer"
                onClick={() => toggleSort('date')}
              >
                DATE {renderSortIcon('date')}
              </th>
              <th className="p-2 whitespace-nowrap text-start">TIME</th>
              <th className="p-2 whitespace-nowrap text-start" style={{ width: "30%" }}>
                REASON
              </th>
              <th className="p-2 whitespace-nowrap text-start">STATUS</th>
            </tr>
          </thead>
        );
      default:
        return null;
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-lg rounded-xl relative">
      <div className="flex flex-col md:flex-row md:justify-between border-b-2 pb-4">
        <h1 className="text-3xl md:text-5xl font-semibold font-poppins text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text mb-4 md:mb-0">
          Leave Management
        </h1>
        <div className="flex gap-3">
          <Link to="/User/Leave">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              Go Back
            </button>
          </Link>
          <Link to="/User/Remote_details">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              Remote Details
            </button>
          </Link>
        </div>
      </div>

      <div className="w-full bg-gradient-to-b from-white to-blue-50 shadow-md rounded-xl border border-gray-200 mt-10">
        <header className="flex flex-col md:flex-row md:justify-between p-4 border-b border-gray-200 gap-4">
          <select
            className="border border-gray-300 rounded-md w-32 px-2 py-1 text-sm"
            onChange={(e) => setSelectedOption(e.target.value)}
            value={selectedOption}
          >
            <option value="Leave">Leave</option>
            <option value="LOP">LOP</option>
            <option value="Permission">Permission</option>
          </select>

<div className="flex items-center space-x-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                Reset
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {showDatePicker ? 'Hide Date Range' : 'Show Date Range'}
                </button>
                {showDatePicker && (
                  <div className="absolute right-0 top-12 z-50 bg-white shadow-lg rounded-md border">
                    <DateRangePicker
                     ranges={dateRange}
                     onChange={handleDateRangeChange}
                     moveRangeOnFirstSelection={false}
                     months={2}
                     direction="horizontal"
                     preventSnapRefocus={true}
                     calendarFocus="backwards"
                    />
                  </div>
                )}
              </div>
            </div>
        </header>
        
        <div className="p-3">
          <div>
            <table className="table-auto w-full overflow-y-auto">
              {/* Table Header */}
              {renderTableHeader()}
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-2 whitespace-nowrap font-inter text-center"
                    >
                      <div className="font-medium text-center">Loading...</div>
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((row, index) => (
                    <tr key={index}>
                      <td className="p-2 whitespace-nowrap w-fit">
                        <div className="font-medium text-start w-fit">
                          {(currentPage - 1) * itemsPerPage + index + 1}.
                        </div>
                      </td>
                      {selectedOption === "Leave" ? (
                        <>
                          <td className="p-2 whitespace-nowrap w-fit">
                            <div className="font-medium text-start w-fit">
                              {row.Employee_ID}
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="font-medium text-start w-fit">
                              {row.employeeName}
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap w-fit">
                            <div className="font-medium text-start w-fit">
                              {row.leaveType}
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap w-fit">
                            <div className="font-medium text-start w-fit">
                              {row.selectedDate}
                            </div>
                          </td>
                        </>
                      ) : selectedOption === "LOP" ? (
                        <>
                          <td className="p-2 whitespace-nowrap w-fit">
                            <div className="font-medium text-start w-fit">
                              {row.Employee_ID}
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="font-medium text-start w-fit">
                              {row.employeeName}
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap w-fit">
                            <div className="font-medium text-start w-fit">
                              {row.selectedDate}
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap w-fit">
                            <div className="font-medium text-start w-fit">
                              {row.ToDate}
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-2 whitespace-nowrap w-fit">
                            <div className="font-medium text-start w-fit">
                              {row.Employee_ID}
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="font-medium text-start w-fit">
                              {row.employeeName}
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap w-fit">
                            <div className="font-medium text-start w-fit">
                              {row.requestDate}
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap w-fit">
                            <div className="font-medium text-start w-fit">
                              {row.timeSlot}
                            </div>
                          </td>
                        </>
                      )}
                      <td className="p-2 whitespace-normal w-fit">
                        <div className="font-medium text-start w-fit">
                          {row.reason}
                        </div>
                      </td>
                      {row.status? (
                        <td className="p-2 whitespace-normal w-fit">
                        <div className="font-medium text-start w-fit">
                          {row.status}
                        </div>
                      </td>
                      ):(
                        <td className="p-2 whitespace-normal w-fit">
                        <div className="font-medium text-start w-fit">
                          Pending
                        </div>
                      </td>
                      )}

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-2 whitespace-nowrap">
                      <div className="font-medium text-center">
                        No data available
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Pagination */}
      <div className="mt-2 flex justify-between items-center">
        <div>
          <button
            className="py-1 px-3 bg-blue-500 hover:bg-[#b7c6df80] hover:text-black text-white text-sm font-inter rounded-md shadow-lg mr-2"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="py-1 px-3 bg-blue-500 hover:bg-[#b7c6df80] hover:text-black text-white text-sm font-inter rounded-md shadow-lg"
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastItem >= filteredData.length}
          >
            Next
          </button>
        </div>
        <div className="text-sm font-semibold text-gray-800">
        Page {filteredData.length > 0 ? currentPage : 0} of{" "}
          {Math.ceil(filteredData.length / itemsPerPage)}
        </div>
      </div>
    </div>
  );
};

export default LeaveHistory;