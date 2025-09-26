// import { Link } from "react-router-dom";
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Baseaxios, LS ,ipadr} from "../Utils/Resuse";

// const Remote_details = () => {
//   const [RemoteWorkData, setRemoteWorkData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(5);

//   const toggleSort = (column) => {
//     setSortConfig(prevConfig => ({
//       column,
//       direction: 
//         prevConfig.column === column && prevConfig.direction === 'asc' 
//           ? 'desc' 
//           : 'asc'
//     }));
//   };
  

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const userid = LS.get("id");
//         const RemoteWorkResponse = await axios.get(
//           `${ipadr}/Remote-History/${userid}`
//         );
//         console.log("API Response:", RemoteWorkResponse.data);
//         setRemoteWorkData(
//           RemoteWorkResponse.data &&
//             Array.isArray(RemoteWorkResponse.data.Remote_History)
//             ? RemoteWorkResponse.data.Remote_History
//             : []
//         );
//         setLoading(false);
//         setError(null);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setLoading(false);
//         setRemoteWorkData([]);
//         setError("Error fetching data. Please try again later.");
//       }
//     };

//     fetchData();
//   }, []);

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = RemoteWorkData.slice(indexOfFirstItem, indexOfLastItem);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full  shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md">
//       <h1 className="text-5xl font-semibold font-poppins pb-4 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text">
//         Remotework Management
//       </h1>
//       <div className="flex justify-end mb-4">
//         {/* <h3 className="text-2xl font-semibold font-poppins py-2 text-zinc-500">
//           Remotework Details
//         </h3> */}
//         <Link to="/User/LeaveHistory">
//           <div className="">
//             <button className=" mr-3 px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black  active:bg-white active:text-white">
//               Go Back
//             </button>
//           </div>
//         </Link>

//         <Link to="/User/LeaveHistory">
//           <div className="">
//             <button className="px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black  active:bg-white active:text-white">
//               Leave Details
//             </button>
//           </div>
//         </Link>
//       </div>
//       <div className="my-2">
//         <div className=" border p-4 rounded-lg shadow-xl">
//           <h2 className="text-lg font-semibold mb-4 font-poppins">
//             Remotework History
//           </h2>
//           {loading ? (
//             <p>Loading...</p>
//           ) : error ? (
//             <p>{error}</p>
//           ) : RemoteWorkData && RemoteWorkData.length > 0 ? (
//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm text-gray-500">
//                 <thead className="text-xs text-black uppercase bg-[#6d9eeb7a]">
//                   <tr>
//                     <th scope="col" className="p-2 font-poppins text-center">
//                       Date
//                     </th>
//                     <th scope="col" className="p-2 font-poppins text-center">
//                       Employee ID
//                     </th>
//                     <th scope="col" className="p-2 font-poppins text-center">
//                       Employee Name
//                     </th>
//                     <th 
//                 className="p-2 whitespace-nowrap text-start cursor-pointer"
//                 onClick={() => toggleSort('fromDate')}
//               >
//                 FROM DATE {renderSortIcon('fromDate')}
//               </th>
//               <th 
//                 className="p-2 whitespace-nowrap text-start cursor-pointer"
//                 onClick={() => toggleSort('toDate')}
//               >
//                 TO DATE {renderSortIcon('toDate')}
//               </th>
//                     <th scope="col" className="p-2 font-poppins text-center">
//                       Reason
//                     </th>
//                     <th scope="col" className="p-2 font-poppins text-center">
//                       Status
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-sm text-gray-700 bg-white">
//                   {currentItems.map((RemoteWork, index) => (
//                     <tr key={index}>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.requestDate}
//                       </td>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.userid}
//                       </td>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.employeeName}
//                       </td>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.fromDate}
//                       </td>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.toDate}
//                       </td>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.reason}
//                       </td>
//                       {/* {RemoteWork.status?(
//                         <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.status }
//                       </td>
//                       ):(
//                         <td scope="col" className="p-2 font-poppins text-center">
//                         Pending
//                       </td>
//                       )} */}

// {RemoteWork.status ? (
//   <td
//     scope="col"
//     className={`p-2 font-poppins text-center ${
//       RemoteWork.status === "Approved"
//         ? "text-green-500"
//         : RemoteWork.status === "Rejected"
//         ? "text-red-500"
//         : ""
//     }`}
//   >
//     {RemoteWork.status}
//   </td>
// ) : (
//   <td scope="col" className="p-2 font-poppins text-center">
//     Pending
//   </td>
// )}

                      
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <p className="text-sm italic font-poppins">No records found</p>
//           )}
//         </div>
//         <div className="mt-2 flex justify-between items-center">
//           <div>
//             <button
//               className="py-1 px-3 bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black  active:bg-white active:text-white mr-2"
//               onClick={() => paginate(currentPage - 1)}
//               disabled={currentPage === 1}
//             >
//               Previous
//             </button>
//             <button
//               className="py-1 px-3 bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black  active:bg-white active:text-white"
//               onClick={() => paginate(currentPage + 1)}
//               disabled={indexOfLastItem >= RemoteWorkData.length}
//             >
//               Next
//             </button>
//           </div>
//           <div className="text-sm font-semibold text-gray-800">
//             {/* Page {currentPage} of {Math.ceil(filteredAttendanceData.length / itemsPerPage)} */}
//             Page {RemoteWorkData.length > 0 ? currentPage : 0} of{" "}
//             {RemoteWorkData.length > 0
//               ? Math.ceil(RemoteWorkData.length / itemsPerPage)
//               : 0}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Remote_details;


// import { Link } from "react-router-dom";
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Baseaxios, LS, ipadr } from "../Utils/Resuse";
// import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
// import { DateRangePicker } from "react-date-range";
// import { format, isWithinInterval, parseISO } from 'date-fns';

// const Remote_details = () => {
//   const [RemoteWorkData, setRemoteWorkData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [filteredData, setFilteredData] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(5);
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [selectedYear, setSelectedYear] = useState("");
//   const [dateRange, setDateRange] = useState([
//     {
//       startDate: null,
//       endDate: null,
//       key: "selection",
//     },
//   ]);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [sortConfig, setSortConfig] = useState({
//     column: null,
//     direction: 'asc'
//   });

//   const handleDateRangeChange = (ranges) => {
//     setDateRange([ranges.selection]);
//     setSelectedMonth("");
//     setSelectedYear("");
//     setCurrentPage(1);
//   };

//   const sortData = (data, column) => {
//     return [...data].sort((a, b) => {
//       let compareA, compareB;

//       // Handle different date column types
//       switch (column) {
//         case 'requestDate':
//           compareA = new Date(a.requestDate).getTime();
//           compareB = new Date(b.requestDate).getTime();
//           break;
//         case 'fromDate':
//           compareA = new Date(a.fromDate).getTime();
//           compareB = new Date(b.fromDate).getTime();
//           break;
//         case 'toDate':
//           compareA = new Date(a.toDate).getTime();
//           compareB = new Date(b.toDate).getTime();
//           break;
//         default:
//           compareA = a[column];
//           compareB = b[column];
//       }

//       if (compareA < compareB) {
//         return sortConfig.direction === 'asc' ? -1 : 1;
//       }
//       if (compareA > compareB) {
//         return sortConfig.direction === 'asc' ? 1 : -1;
//       }
//       return 0;
//     });
//   };

//   const toggleSort = (column) => {
//     setSortConfig(prevConfig => ({
//       column,
//       direction: 
//         prevConfig.column === column && prevConfig.direction === 'asc' 
//           ? 'desc' 
//           : 'asc'
//     }));
//   };

//   const renderSortIcon = (column) => {
//     if (sortConfig.column !== column) {
//       return <ArrowUpDown className="inline ml-1 w-4 h-4" />;
//     }
//     return sortConfig.direction === 'asc' 
//       ? <ArrowUp className="inline ml-1 w-4 h-4" />
//       : <ArrowDown className="inline ml-1 w-4 h-4" />;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const userid = LS.get("id");
//         const RemoteWorkResponse = await axios.get(
//           `${ipadr}/Remote-History/${userid}`
//         );
//         console.log("API Response:", RemoteWorkResponse.data);
        
//         let data = RemoteWorkResponse.data && Array.isArray(RemoteWorkResponse.data.Remote_History)
//           ? RemoteWorkResponse.data.Remote_History
//           : [];
        
//         // Apply sorting if there's a sort configuration
//         if (sortConfig.column) {
//           data = sortData(data, sortConfig.column);
//         }
        
//         setRemoteWorkData(data);
//         setLoading(false);
//         setError(null);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setLoading(false);
//         setRemoteWorkData([]);
//         setError("Error fetching data. Please try again later.");
//       }
//     };

//     fetchData();
//   }, [sortConfig]); // Add sortConfig as dependency

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = RemoteWorkData.slice(indexOfFirstItem, indexOfLastItem);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md">
//       <h1 className="text-5xl font-semibold font-poppins pb-4 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text">
//         Remotework Management
//       </h1>
//       <div className="flex justify-end mb-4">
//         <Link to="/User/LeaveHistory">
//           <div className="">
//             <button className="mr-3 px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white">
//               Go Back
//             </button>
//           </div>
//         </Link>

//         <Link to="/User/LeaveHistory">
//           <div className="">
//             <button className="px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white">
//               Leave Details
//             </button>
//           </div>
//         </Link>
//       </div>
//       <div className="my-2">
//         <div className="border p-4 rounded-lg shadow-xl">
//         <header className="flex justify-between px-5 py-4 border-b border-gray-200">
//           <h2 className="text-lg font-semibold mb-4 font-poppins">
//             Remotework History
//           </h2>
//           <div className="flex items-center gap-4">
//       <div className="relative">
//         <button
//           onClick={() => setShowDatePicker(!showDatePicker)}
//           className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//         >
//           {showDatePicker ? 'Hide Date Range' : 'Show Date Range'}
//         </button>
//         {showDatePicker && (
//           <div className="absolute right-0 top-12 z-50 bg-white shadow-lg rounded-md border">
//             <DateRangePicker
//               ranges={dateRange}
//               onChange={handleDateRangeChange}
//               moveRangeOnFirstSelection={false}
//             />
//           </div>
//         )}
//       </div>
     
//     </div>
//     </header>
//           {loading ? (
//             <p>Loading...</p>
//           ) : error ? (
//             <p>{error}</p>
//           ) : RemoteWorkData && RemoteWorkData.length > 0 ? (
//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm text-gray-500">
//                 <thead className="text-xs text-black uppercase bg-[#6d9eeb7a]">
//                   <tr>
//                     <th 
//                       scope="col" 
//                       className="p-2 font-poppins text-center cursor-pointer"
//                       onClick={() => toggleSort('requestDate')}
//                     >
//                       Date {renderSortIcon('requestDate')}
//                     </th>
//                     <th scope="col" className="p-2 font-poppins text-center">
//                       Employee ID
//                     </th>
//                     <th scope="col" className="p-2 font-poppins text-center">
//                       Employee Name
//                     </th>
//                     <th 
//                       scope="col"
//                       className="p-2 font-poppins text-center cursor-pointer"
//                       onClick={() => toggleSort('fromDate')}
//                     >
//                       From Date {renderSortIcon('fromDate')}
//                     </th>
//                     <th 
//                       scope="col"
//                       className="p-2 font-poppins text-center cursor-pointer"
//                       onClick={() => toggleSort('toDate')}
//                     >
//                       To Date {renderSortIcon('toDate')}
//                     </th>
//                     <th scope="col" className="p-2 font-poppins text-center">
//                       Reason
//                     </th>
//                     <th scope="col" className="p-2 font-poppins text-center">
//                       Status
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-sm text-gray-700 bg-white">
//                   {currentItems.map((RemoteWork, index) => (
//                     <tr key={index}>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.requestDate}
//                       </td>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.userid}
//                       </td>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.employeeName}
//                       </td>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.fromDate}
//                       </td>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.toDate}
//                       </td>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.reason}
//                       </td>
//                       {RemoteWork.status ? (
//                         <td
//                           scope="col"
//                           className={`p-2 font-poppins text-center ${
//                             RemoteWork.status === "Approved"
//                               ? "text-green-500"
//                               : RemoteWork.status === "Rejected"
//                               ? "text-red-500"
//                               : ""
//                           }`}
//                         >
//                           {RemoteWork.status}
//                         </td>
//                       ) : (
//                         <td scope="col" className="p-2 font-poppins text-center">
//                           Pending
//                         </td>
//                       )}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <p className="text-sm italic font-poppins">No records found</p>
//           )}
//         </div>
//         <div className="mt-2 flex justify-between items-center">
//           <div>
//             <button
//               className="py-1 px-3 bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white mr-2"
//               onClick={() => paginate(currentPage - 1)}
//               disabled={currentPage === 1}
//             >
//               Previous
//             </button>
//             <button
//               className="py-1 px-3 bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white"
//               onClick={() => paginate(currentPage + 1)}
//               disabled={indexOfLastItem >= RemoteWorkData.length}
//             >
//               Next
//             </button>
//           </div>
//           <div className="text-sm font-semibold text-gray-800">
//             Page {RemoteWorkData.length > 0 ? currentPage : 0} of{" "}
//             {RemoteWorkData.length > 0
//               ? Math.ceil(RemoteWorkData.length / itemsPerPage)
//               : 0}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Remote_details;


// import { Link } from "react-router-dom";
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { LS, ipadr } from "../Utils/Resuse";
// import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
// import { DateRangePicker } from "react-date-range";
// import { format, isWithinInterval, parseISO } from 'date-fns';

// const Remote_details = () => {
//   const [RemoteWorkData, setRemoteWorkData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(5);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [dateRange, setDateRange] = useState([
//     {
//       startDate: null,
//       endDate: null,
//       key: "selection",
//     },
//   ]);
//   const [sortConfig, setSortConfig] = useState({
//     column: null,
//     direction: 'asc'
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const userid = LS.get("id");
//         const response = await axios.get(`${ipadr}/Remote-History/${userid}`);
        
//         const responseData = response.data && Array.isArray(response.data.Remote_History)
//           ? response.data.Remote_History
//           : [];
        
//         setRemoteWorkData(responseData);
//         filterDataByDateRange(responseData);
//         setLoading(false);
//         setError(null);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setLoading(false);
//         setRemoteWorkData([]);
//         setFilteredData([]);
//         setError("Error fetching data. Please try again later.");
//       }
//     };

//     fetchData();
//   }, []);

//   // Convert date from DD-MM-YYYY to YYYY-MM-DD for parsing
//   const convertDateFormat = (dateString) => {
//     if (!dateString) return '';
//     const [day, month, year] = dateString.split('-');
//     return `${year}-${month}-${day}`;
//   };

//   // Function to filter data based on date range
//   const filterDataByDateRange = (data) => {
//     if (!dateRange[0].startDate || !dateRange[0].endDate) {
//       setFilteredData(data);
//       return;
//     }

//     const filtered = data.filter(item => {
//       const fromDate = parseISO(convertDateFormat(item.fromDate));
//       const toDate = parseISO(convertDateFormat(item.toDate));
      
//       // Check if either fromDate or toDate falls within the selected range
//       return (
//         isWithinInterval(fromDate, {
//           start: dateRange[0].startDate,
//           end: dateRange[0].endDate
//         }) ||
//         isWithinInterval(toDate, {
//           start: dateRange[0].startDate,
//           end: dateRange[0].endDate
//         })
//       );
//     });

//     // Apply sorting if there's a sort configuration
//     const sortedData = sortConfig.column 
//       ? sortData(filtered, sortConfig.column) 
//       : filtered;
    
//     setFilteredData(sortedData);
//     setCurrentPage(1); // Reset to first page when filtering
//   };

//   const handleDateRangeChange = (ranges) => {
//     setDateRange([ranges.selection]);
//     filterDataByDateRange(RemoteWorkData);
//   };

//   const sortData = (data, column) => {
//     return [...data].sort((a, b) => {
//       let compareA, compareB;

//       switch (column) {
//         case 'requestDate':
//         case 'fromDate':
//         case 'toDate':
//           compareA = new Date(convertDateFormat(a[column])).getTime();
//           compareB = new Date(convertDateFormat(b[column])).getTime();
//           break;
//         default:
//           compareA = a[column];
//           compareB = b[column];
//       }

//       if (compareA < compareB) {
//         return sortConfig.direction === 'asc' ? -1 : 1;
//       }
//       if (compareA > compareB) {
//         return sortConfig.direction === 'asc' ? 1 : -1;
//       }
//       return 0;
//     });
//   };

//   const toggleSort = (column) => {
//     setSortConfig(prevConfig => {
//       const newConfig = {
//         column,
//         direction: 
//           prevConfig.column === column && prevConfig.direction === 'asc' 
//             ? 'desc' 
//             : 'asc'
//       };
      
//       // Apply new sorting to filtered data
//       const newSortedData = sortData(filteredData, column);
//       setFilteredData(newSortedData);
      
//       return newConfig;
//     });
//   };

//   const renderSortIcon = (column) => {
//     if (sortConfig.column !== column) {
//       return <ArrowUpDown className="inline ml-1 w-4 h-4" />;
//     }
//     return sortConfig.direction === 'asc' 
//       ? <ArrowUp className="inline ml-1 w-4 h-4" />
//       : <ArrowDown className="inline ml-1 w-4 h-4" />;
//   };

//   // Pagination calculations
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md">
//       <div className="flex justify-between border-b-2">
//         <h1 className="text-5xl font-semibold font-poppins pb-4 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text">
//           Remotework Management
//         </h1>
//         <div className="flex justify-end my-4">
//           <Link to="/User/LeaveHistory">
//             <button className="mr-3 px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white">
//               Go Back
//             </button>
//           </Link>
//           <Link to="/User/LeaveHistory">
//             <button className="px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white">
//               Leave Details
//             </button>
//           </Link>
//         </div>
//       </div>

//       <div className="w-full bg-gradient-to-b from-white to-blue-50 shadow-lg rounded-xl border border-gray-200 my-2 mt-10">
//         <header className="flex justify-between px-5 py-4 border-b border-gray-200">
//           <h2 className="text-lg font-semibold font-poppins">
//             Remotework History
//           </h2>
//           <div className="relative">
//             <button
//               onClick={() => setShowDatePicker(!showDatePicker)}
//               className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//             >
//               {showDatePicker ? 'Hide Date Range' : 'Show Date Range'}
//             </button>
//             {showDatePicker && (
//               <div className="absolute right-0 top-12 z-50 bg-white shadow-lg rounded-md border">
//                 <DateRangePicker
//                   ranges={dateRange}
//                   onChange={handleDateRangeChange}
//                   moveRangeOnFirstSelection={false}
//                 />
//               </div>
//             )}
//           </div>
//         </header>

//         <div className="p-3">
//           {loading ? (
//             <p className="text-center">Loading...</p>
//           ) : error ? (
//             <p className="text-center text-red-500">{error}</p>
//           ) : currentItems.length > 0 ? (
//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm text-gray-500">
//                 <thead className="text-xs text-black uppercase bg-[#6d9eeb7a]">
//                   <tr>
//                     <th 
//                       scope="col" 
//                       className="p-2 font-poppins text-center cursor-pointer"
//                       onClick={() => toggleSort('requestDate')}
//                     >
//                       Date {renderSortIcon('requestDate')}
//                     </th>
//                     <th scope="col" className="p-2 font-poppins text-center">
//                       Employee ID
//                     </th>
//                     <th scope="col" className="p-2 font-poppins text-center">
//                       Employee Name
//                     </th>
//                     <th 
//                       scope="col"
//                       className="p-2 font-poppins text-center cursor-pointer"
//                       onClick={() => toggleSort('fromDate')}
//                     >
//                       From Date {renderSortIcon('fromDate')}
//                     </th>
//                     <th 
//                       scope="col"
//                       className="p-2 font-poppins text-center cursor-pointer"
//                       onClick={() => toggleSort('toDate')}
//                     >
//                       To Date {renderSortIcon('toDate')}
//                     </th>
//                     <th scope="col" className="p-2 font-poppins text-center">
//                       Reason
//                     </th>
//                     <th scope="col" className="p-2 font-poppins text-center">
//                       Status
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-sm text-gray-700 bg-white">
//                   {currentItems.map((RemoteWork, index) => (
//                     <tr key={index}>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.requestDate}
//                       </td>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.userid}
//                       </td>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.employeeName}
//                       </td>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.fromDate}
//                       </td>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.toDate}
//                       </td>
//                       <td scope="col" className="p-2 font-poppins text-center">
//                         {RemoteWork.reason}
//                       </td>
//                       <td
//                         scope="col"
//                         className={`p-2 font-poppins text-center ${
//                           RemoteWork.status === "Approved"
//                             ? "text-green-500"
//                             : RemoteWork.status === "Rejected"
//                             ? "text-red-500"
//                             : ""
//                         }`}
//                       >
//                         {RemoteWork.status || "Pending"}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <p className="text-sm italic font-poppins text-center">No records found</p>
//           )}
//         </div>

//         <div className="mt-4 px-3 pb-3 flex justify-between items-center">
//           <div>
//             <button
//               className="py-1 px-3 bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white mr-2"
//               onClick={() => paginate(currentPage - 1)}
//               disabled={currentPage === 1}
//             >
//               Previous
//             </button>
//             <button
//               className="py-1 px-3 bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white"
//               onClick={() => paginate(currentPage + 1)}
//               disabled={indexOfLastItem >= filteredData.length}
//             >
//               Next
//             </button>
//           </div>
//           <div className="text-sm font-semibold text-gray-800">
//             Page {filteredData.length > 0 ? currentPage : 0} of{" "}
//             {Math.ceil(filteredData.length / itemsPerPage)}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Remote_details;



import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { LS, ipadr } from "../Utils/Resuse";
import { ArrowUp, ArrowDown, ArrowUpDown, RotateCw } from "lucide-react";
import { DateRangePicker } from "react-date-range";
import { format, isWithinInterval, parseISO } from 'date-fns';

const Remote_details = () => {
  const [RemoteWorkData, setRemoteWorkData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);
  const [sortConfig, setSortConfig] = useState({
    column: null,
    direction: 'asc'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userid = LS.get("userid");
      const response = await axios.get(`${ipadr}/Remote-History/${userid}`);
      
      const responseData = response.data && Array.isArray(response.data.Remote_History)
        ? response.data.Remote_History
        : [];
      
      setRemoteWorkData(responseData);
      setFilteredData(responseData);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setRemoteWorkData([]);
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
      setFilteredData(RemoteWorkData);
      return;
    }

    const filtered = RemoteWorkData.filter(item => {
      const fromDate = parseISO(convertDateFormat(item.fromDate));
      const toDate = parseISO(convertDateFormat(item.toDate));
      
      return (
        isWithinInterval(fromDate, { start: startDate, end: endDate }) ||
        isWithinInterval(toDate, { start: startDate, end: endDate })
      );
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
    setFilteredData(RemoteWorkData);
    setCurrentPage(1);
    setSortConfig({ column: null, direction: 'asc' });
  };

  const sortData = (data, column) => {
    return [...data].sort((a, b) => {
      let compareA, compareB;

      switch (column) {
        case 'requestDate':
        case 'fromDate':
        case 'toDate':
          compareA = new Date(convertDateFormat(a[column])).getTime();
          compareB = new Date(convertDateFormat(b[column])).getTime();
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md">
      <div className="flex justify-between border-b-2">
        <h1 className="text-5xl font-semibold font-poppins pb-4 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text">
          Remotework Management
        </h1>
        <div className="flex justify-end my-4">
          <Link to="/User/LeaveHistory">
            <button className="mr-3 px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white">
              Go Back
            </button>
          </Link>
          <Link to="/User/LeaveHistory">
            <button className="px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white">
              Leave Details
            </button>
          </Link>
        </div>
      </div>

      <div className="w-full bg-gradient-to-b from-white to-blue-50 shadow-lg rounded-xl border border-gray-200 my-2 mt-10">
        <header className="flex justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold font-poppins">
            Remotework History
          </h2>
          <div className="relative flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Reset
            </button>
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
        </header>

        <div className="p-3">
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : currentItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="text-xs text-black uppercase bg-[#6d9eeb7a]">
                  <tr>
                    <th 
                      scope="col" 
                      className="p-2 font-poppins text-center cursor-pointer"
                      onClick={() => toggleSort('requestDate')}
                    >
                      Date {renderSortIcon('requestDate')}
                    </th>
                    <th scope="col" className="p-2 font-poppins text-center">
                      Employee ID
                    </th>
                    <th scope="col" className="p-2 font-poppins text-center">
                      Employee Name
                    </th>
                    <th 
                      scope="col"
                      className="p-2 font-poppins text-center cursor-pointer"
                      onClick={() => toggleSort('fromDate')}
                    >
                      From Date {renderSortIcon('fromDate')}
                    </th>
                    <th 
                      scope="col"
                      className="p-2 font-poppins text-center cursor-pointer"
                      onClick={() => toggleSort('toDate')}
                    >
                      To Date {renderSortIcon('toDate')}
                    </th>
                    <th scope="col" className="p-2 font-poppins text-center">
                      Reason
                    </th>
                    <th scope="col" className="p-2 font-poppins text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700 bg-white">
                  {currentItems.map((RemoteWork, index) => (
                    <tr key={index}>
                      <td scope="col" className="p-2 font-poppins text-center">
                        {RemoteWork.requestDate}
                      </td>
                      <td scope="col" className="p-2 font-poppins text-center">
                        {RemoteWork.userid}
                      </td>
                      <td scope="col" className="p-2 font-poppins text-center">
                        {RemoteWork.employeeName}
                      </td>
                      <td scope="col" className="p-2 font-poppins text-center">
                        {RemoteWork.fromDate}
                      </td>
                      <td scope="col" className="p-2 font-poppins text-center">
                        {RemoteWork.toDate}
                      </td>
                      <td scope="col" className="p-2 font-poppins text-center">
                        {RemoteWork.reason}
                      </td>
                      <td
                        scope="col"
                        className={`p-2 font-poppins text-center ${
                          RemoteWork.status === "Approved"
                            ? "text-green-500"
                            : RemoteWork.status === "Rejected"
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        {RemoteWork.status || "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm italic font-poppins text-center">No records found</p>
          )}
        </div>

        <div className="mt-4 px-3 pb-3 flex justify-between items-center">
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
    </div>
  );
};

export default Remote_details;