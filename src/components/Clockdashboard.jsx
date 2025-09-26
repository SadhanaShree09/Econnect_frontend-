import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Baseaxios, LS, ipadr } from "../Utils/Resuse";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format ,isEqual, startOfDay} from "date-fns";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export default function Clockdashboard() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortDirection, setSortDirection] = useState("desc");
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
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };

    try {
      const userId = LS.get("userid");
      const response = await fetch(`${ipadr}/clock-records/${userId}`, requestOptions);
      const data = await response.json();
      
      setAttendanceData(
        data && Array.isArray(data.clock_records)
          ? data.clock_records
          : []
      );
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setError(error);
      setAttendanceData([]);
    }
  };

  const handleDateRangeChange = (ranges) => {
    const selection = ranges.selection;
    
    // If end date is not selected, make it same as start date for single date selection
    if (selection.startDate && !selection.endDate) {
      selection.endDate = selection.startDate;
    }
    
    setDateRange([{
      startDate: selection.startDate,
      endDate: selection.endDate,
      key: "selection"
    }]);
    
    setSelectedMonth("");
    setSelectedYear("");
    setCurrentPage(1);
  };

  // const toggleSortDirection = () => {
  //   setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  // };

  const handleSort = (column) => {
    setSortConfig((prev) => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
  };
  
  const sortData = (data) => {
    if (!sortConfig.column) return data;
  
    return [...data].sort((a, b) => {
      let valA = a[sortConfig.column];
      let valB = b[sortConfig.column];
  
      if (sortConfig.column === "date") {
        valA = new Date(valA);
        valB = new Date(valB);
      }
  
      return sortConfig.direction === "asc" ? valA - valB : valB - valA;
    });
  };
  
  const renderSortIcon = (column) => {
    if (sortConfig.column === column) {
      return sortConfig.direction === "asc" ? (
        <ArrowUp className="inline ml-1 w-4 h-4" />
      ) : (
        <ArrowDown className="inline ml-1 w-4 h-4" />
      );
    }
    return <ArrowUpDown className="inline ml-1 w-4 h-4" />;
  };
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  };

  
  const filteredAttendanceData = attendanceData.filter((row) => {
    const rowDate = startOfDay(new Date(row.date));

    if (dateRange[0].startDate) {
      const start = startOfDay(dateRange[0].startDate);
      const end = dateRange[0].endDate ? startOfDay(dateRange[0].endDate) : start;

      // If it's a single date selection (start date equals end date or end date is null)
      if (isEqual(start, end) || !dateRange[0].endDate) {
        return isEqual(rowDate, start);
      }
      
      // For date range selection
      return rowDate >= start && rowDate <= end;
    }

    if (!selectedMonth && !selectedYear) {
      return true; // Show all records if no filter is applied
    }

    const monthMatch = !selectedMonth || rowDate.getMonth() === months.indexOf(selectedMonth);
    const yearMatch = !selectedYear || rowDate.getFullYear() === parseInt(selectedYear);
    return monthMatch && yearMatch;
  });


  const sortedData = sortData(filteredAttendanceData);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  

  return (


<div className="rounded-md w-full px-[7rem] my-4">
<div className="w-full h-full bg-whte shadow-lg rounded-md border border-gray-200">
  <header className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
    <h2 className="font-semibold text-gray-800">Timing</h2>
    <div className="flex items-center gap-4">
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
            />
          </div>
        )}
      </div>
     
    </div>
  </header>

        <div className="p-3">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">Error loading data</div>
          ) : (
            <div>
              <table className="table-auto w-full overflow-y-auto">
                <thead className="text-xs font-semibold uppercase text-black bg-[#6d9eeb7a]">
                  <tr>
                  <th className="p-2 whitespace-nowrap">
  <div
    className="font-semibold text-center flex items-center justify-center cursor-pointer"
    onClick={() => handleSort("date")}
  >
    Date {renderSortIcon("date")}
  </div>
</th>

                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Login Time</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Logout Time</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Total hours of working</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Status</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Remark</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {currentItems.map((row, index) => (
                    <tr key={index}>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-center">{formatDate(row.date)}</div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-center">{row.clockin}</div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-center">{row.clockout}</div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-center">{row.total_hours_worked}</div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-center">{row.status}</div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-center">{row.remark}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 flex justify-between items-center">
        <div>
          <button
            className="py-1 px-3 bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white mr-2"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="py-1 px-3 bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white"
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastItem >= sortedData.length}
          >
            Next
          </button>
        </div>
        <div className="text-sm font-semibold text-gray-800">
          Page {sortedData.length > 0 ? currentPage : 0} of{" "}
          {sortedData.length > 0
            ? Math.ceil(sortedData.length / itemsPerPage)
            : 0}
        </div>
      </div>
    </div>
  );
}