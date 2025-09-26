import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faDownload, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { Link,Outlet } from "react-router-dom";
import { LS } from "../../Utils/Resuse";

const EmployeeList = () => {
    const [employeeData, setEmployeeData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [show, setShow] = useState(false);
    const Admin = LS.get('isadmin');
    
    const ip = import.meta.env.VITE_HOST_IP;
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${ip}/get_all_users`);
                const filteredData =
                    response.data && Array.isArray(response.data)
                        ? response.data.filter((item) =>
                            item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        : [];
                setEmployeeData(filteredData);
                setLoading(false);
                setError(null);
            } catch (error) {
                setLoading(false);
                setEmployeeData([]);
                setError("Error fetching data");
            }
        };

        fetchData();
    }, [searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = employeeData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(employeeData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "EmployeeData");
        XLSX.writeFile(workbook, "employee_data.xlsx");
    };

    return (
        (Admin) ? (
            <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full  shadow-black rounded-xl justify-center items-center relative jsonback  ml-10 rounded-md ">
                <div className="">
                    <h1 className="text-5xl font-semibold font-inter pb-2 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text border-b-2">
                        Employee List
                    </h1>
                    <div className="w-full bg-gradient-to-b from-white to-blue-50 shadow-lg rounded-xl border border-gray-200 my-2 mt-10">
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
                        </header>
                        <div className="p-3">
                            <div>
                                {error && <p className="text-red-500">{error}</p>}
                                <table className="table-auto w-full overflow-y-auto">
                                    <thead className="text-sm font-semibold uppercase text-black bg-[#6d9eeb7a]">
                                        <tr>
                                            <th scope="col" className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-center">S.No</div>
                                            </th>
                                            <th scope="col" className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-center">Name</div>
                                            </th>
                                            <th scope="col" className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-center">Email</div>
                                            </th>
                                            <th scope="col" className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-center">Department</div>
                                            </th>
                                            <th scope="col" className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-center">Position</div>
                                            </th>
                                            <th scope="col" className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-center">Status</div>
                                            </th>
                                            <th scope="col" className="p-2 whitespace-nowrap">
                                                <div className="font-semibold text-center">Action</div>
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="text-sm">
                                        {loading ? (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    className="p-2 whitespace-nowrap font-inter text-center"
                                                >
                                                    <div className="font-medium text-center">
                                                        Loading...
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : currentItems.length > 0 ? (
                                            currentItems.map((row, index) => (
                                                <tr key={index}>
                                                    <td scope="col" className="p-2 whitespace-nowrap">
                                                        <div className="font-medium text-center">
                                                            {index + 1 + (currentPage - 1) * itemsPerPage}.
                                                        </div>
                                                    </td>
                                                    <td scope="col" className="p-2 whitespace-nowrap">
                                                        <div className="font-medium text-center">
                                                            {row.name || "N/A"}
                                                        </div>
                                                    </td>
                                                    <td scope="col" className="p-2 whitespace-nowrap">
                                                        <div className="font-medium text-center">
                                                            {row.email || "N/A"}
                                                        </div>
                                                    </td>
                                                    <td scope="col" className="p-2 whitespace-nowrap">
                                                        <div className="font-medium text-center">
                                                            {row.department || "N/A"}
                                                        </div>
                                                    </td>
                                                    <td scope="col" className="p-2 whitespace-nowrap">
                                                        <div className="font-medium text-center">
                                                            {row.position || "N/A"}
                                                        </div>
                                                    </td>
                                                    <td scope="col" className="p-2 whitespace-nowrap">
                                                        <div className="font-medium text-center">
                                                            {row.status || "N/A"}
                                                        </div>
                                                    </td>
                                                    <td scope="col" className="p-2 whitespace-nowrap">
                                                        <div className="font-medium text-center">
                                                            <Link to={`/admin/employee/${row.id}`}>
                                                                <div className="">
                                                                    <button className="bg-blue-500 hover:bg-blue-400 hover:text-slate-900 text-white text-sm font-inter px-4 py-2 rounded-full shadow-lg">
                                                                        Details
                                                                    </button>
                                                                </div>
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="p-2 whitespace-nowrap">
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
                    <div className="mt-2 flex justify-between items-center">
                    <div>
                                <button
                                                className="py-1 px-3 bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black  active:bg-white active:text-white mr-2"
                                                onClick={() => paginate(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </button>
                                            <button
                                                className="py-1 px-3 bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black  active:bg-white active:text-white"
                                                onClick={() => paginate(currentPage + 1)}
                                                disabled={indexOfLastItem >= employeeData.length}
                                            >
                                                Next
                                            </button>
                    </div>
                        <div className="text-sm font-semibold text-gray-800">
                            Page {employeeData.length > 0 ? currentPage : 0} of{" "}
                            {employeeData.length > 0
                                ? Math.ceil(employeeData.length / itemsPerPage)
                                : 0}
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button className="py-1 px-3 bg-[#3B82F6] hover:bg-[#3EBF76] text-white text-sm font-inter rounded-full shadow-lg" onClick={downloadExcel}>
                            <FontAwesomeIcon icon={faDownload} /> Download Excel
                        </button>
                    </div>
                </div>
            </div> 
        ) : (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
                <div className="text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-6xl mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-600">You don't have permission to access this page. Only administrators can manage holidays.</p>
                </div>
                </div>
            </div>
        )
    );
};

export default EmployeeList;
