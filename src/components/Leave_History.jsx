import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faDownload } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { LS, ipadr } from "../../Utils/Resuse";
import { ArrowUp, ArrowDown } from "lucide-react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format, isWithinInterval, parseISO } from 'date-fns';

const Leavehistory = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const isadmin = LS.get('isadmin');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [sortConfig, setSortConfig] = useState({
    column: 'date',
    direction: 'desc'
  });
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${ipadr}/approved-leave-history/${LS.get("name")}`);
        
        if (response.data && response.data.leave_history) {
          const transformedData = Array.isArray(response.data.leave_history) 
            ? response.data.leave_history 
            : [response.data.leave_history];
          setAttendanceData(transformedData);
          setFilteredData(transformedData);
        } else {
          console.error("Invalid data format:", response.data);
          setError("Invalid data format received");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setLoading(false);
        setError("Error fetching data. Please try again.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!attendanceData.length) return;

    let filtered = [...attendanceData];

    // Apply name search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter if single date is selected
    if (selectedDate) {
      filtered = filtered.filter(item => {
        const itemDate = convertDateFormat(item.selectedDate || item.requestDate);
        return itemDate === selectedDate;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedDate, attendanceData]);

  const handleDateRangeChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRange([ranges.selection]);
  
    if (!startDate || !endDate) {
      setFilteredData(attendanceData);
      return;
    }
  
    // If startDate and endDate are the same, treat it as a single-date selection
    if (startDate.toDateString() === endDate.toDateString()) {
      const filtered = attendanceData.filter(item => {
        const itemDate = new Date(convertDateFormat(item.selectedDate || item.requestDate));
        return itemDate.toDateString() === startDate.toDateString();
      });
  
      setFilteredData(filtered);
    } else {
      // Handle the proper range including both start and end dates
      const filtered = attendanceData.filter(item => {
        const itemDate = new Date(convertDateFormat(item.selectedDate || item.requestDate));
        return itemDate >= startDate && itemDate <= endDate;
      });
  
      setFilteredData(filtered);
    }
  
    setCurrentPage(1);
  };  
  

  const convertDateFormat = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleSort = () => {
    const newDirection = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ column: 'date', direction: newDirection });

    const sorted = [...filteredData].sort((a, b) => {
      const dateA = new Date(convertDateFormat(a.selectedDate || a.requestDate));
      const dateB = new Date(convertDateFormat(b.selectedDate || b.requestDate));
      return newDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredData(sorted);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LeaveHistoryData");
    XLSX.writeFile(workbook, "leave_history_data.xlsx");
  };

  return (
    <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10">
      <div className="">
        <div className="flex justify-between border-b-2">
          <h1 className="text-5xl font-semibold font-inter pb-2 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text">
            Leave History
          </h1>
          {isadmin ? (
            <Link to="/admin/leave">
              <button className="bg-blue-500 hover:bg-blue-400 hover:text-slate-900 text-white text-sm font-inter px-4 py-2 rounded-full shadow-lg">
                Back
              </button>
            </Link>
          ) : (
            <Link to="/User/LeaveManage">
              <button className="bg-blue-500 hover:bg-blue-400 hover:text-slate-900 text-white text-sm font-inter px-4 py-2 rounded-full shadow-lg">
                Back
              </button>
            </Link>
          )}
        </div>

        <div className="bg-gradient-to-b from-white to-blue-50 shadow-lg rounded-xl border border-gray-200 my-2 mt-10">
          <header className="px-4 py-4 border-b border-gray-200 flex justify-between">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                className="px-2 py-1 rounded-md border text-sm pl-8 border-gray-300 w-40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute top-0 left-0 mt-1 ml-2 text-gray-400 cursor-text">
                <FontAwesomeIcon icon={faSearch} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
              
              <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  onClick={() => {
                    setSelectedDate("");
                    setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
                    setFilteredData(attendanceData);
                    setCurrentPage(1);
                  }}
                >
                  Reset
                </button>
                {"\t"}
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
                    />
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="p-3">
            <div>
              {error && <p className="text-red-500">{error}</p>}
              <table className="table-auto w-full">
                <thead className="text-sm font-semibold uppercase text-black bg-[#6d9eeb7a]">
                  <tr>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">S.No</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Employee ID</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Name</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Leave Type</div>
                    </th>
                    <th 
                      className="p-2 whitespace-nowrap cursor-pointer"
                      onClick={toggleSort}
                    >
                      <div className="font-semibold text-center flex items-center justify-center">
                        Date
                        {sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 w-4 h-4" />
                          : <ArrowDown className="ml-1 w-4 h-4" />
                        }
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-2 text-center">Loading...</td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-2 whitespace-nowrap">
                          <div className="text-center">
                            {index + 1 + (currentPage - 1) * itemsPerPage}
                          </div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="text-center">{row.Employee_ID}</div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="text-center">{row.employeeName}</div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="text-center">{row.leaveType}</div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="text-center">{row.selectedDate}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-2 text-center">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-between items-center">
          <div>
            <button
              className="py-1 px-3 bg-blue-500 hover:bg-blue-400 hover:text-slate-900 text-white text-sm font-inter rounded-full shadow-lg mr-2"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="py-1 px-3 bg-blue-500 hover:bg-blue-400 hover:text-slate-900 text-white text-sm font-inter rounded-full shadow-lg"
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

        <div className="mt-4 flex justify-end">
          <button
            className="py-1 px-3 bg-blue-500 hover:bg-blue-400 text-white text-sm font-inter rounded-full shadow-lg"
            onClick={downloadExcel}
          >
            <FontAwesomeIcon icon={faDownload} /> Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leavehistory;