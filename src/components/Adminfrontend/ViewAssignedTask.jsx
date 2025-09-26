import React ,{useState,useEffect} from "react";
import axios from "axios";
import { ipadr,LS } from "../Utils/Resuse";
import { Link } from "react-router-dom";
const ViewAssignedTask=()=>{
    const [taskData, settaskData] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const [searchTerm, setSearchTerm] = useState("");
        const [currentPage, setCurrentPage] = useState(1);
        const [itemsPerPage, setItemsPerPage] = useState(5);

     useEffect(()=>{

       const getdata=async()=>{
        try{
            setLoading(true);
            const response=await axios.get(`${ipadr}/get_assigned_task?TL=${LS.get("name")}`);
            const tasks=response.data && Array.isArray(response.data)?response.data : [];
            settaskData(tasks);
            setLoading(false);
        }
        catch(error)
        {
            setLoading(false);
            settaskData([]);
            setError("error while fetching");
        }
       }
        
        getdata();

     },[])

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const taskItems = taskData.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);


     return(
         <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full  shadow-black rounded-xl justify-center items-center relative jsonback  ml-10 rounded-md ">
                    <div className="">
                        <h1 className="text-5xl font-semibold font-inter pb-2 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text border-b-2">
                            Tasks you have assigned
                        </h1>
                         <Link to={`/User/taskassgn`}>
                                 <div className="">
                                    <button className="bg-blue-500 hover:bg-blue-400 hover:text-slate-900 text-white text-sm font-inter px-4 py-2 rounded-full shadow-lg absolute top-[95px] right-[10px] ">
                                        Back
                                    </button>                                                           
                                 </div>
                         </Link> 
                        <div className="w-full bg-gradient-to-b from-white to-blue-50 shadow-lg rounded-xl border border-gray-200 my-2 mt-10">
                            {/* <header className="px-4 py-4 border-b border-gray-200 flex justify-between">
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
                            </header> */}
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
                                                    <div className="font-semibold text-center">User Id</div>
                                                </th>
                                                <th scope="col" className="p-2 whitespace-nowrap">
                                                    <div className="font-semibold text-center">Date</div>
                                                </th>
                                                <th scope="col" className="p-2 whitespace-nowrap">
                                                    <div className="font-semibold text-center">Task</div>
                                                </th>
                                                <th scope="col" className="p-2 whitespace-nowrap">
                                                    <div className="font-semibold text-center">Status</div>
                                                </th>
                                                <th scope="col" className="p-2 whitespace-nowrap">
                                                    <div className="font-semibold text-center">Due Date</div>
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
                                            ) : taskItems.length > 0 ? (
                                                taskItems.map((row, index) => (
                                                    <tr key={index}>
                                                        <td scope="col" className="p-2 whitespace-nowrap">
                                                            <div className="font-medium text-center">
                                                                {index + 1 + (currentPage - 1) * itemsPerPage}.
                                                            </div>
                                                        </td>
                                                        <td scope="col" className="p-2 whitespace-nowrap">
                                                            <div className="font-medium text-center">
                                                                {row.userid || "N/A"}
                                                            </div>
                                                        </td>
                                                        <td scope="col" className="p-2 whitespace-nowrap">
                                                            <div className="font-medium text-center">
                                                                {row.date || "N/A"}
                                                            </div>
                                                        </td>
                                                        <td scope="col" className="p-2 whitespace-nowrap">
                                                            <div className="font-medium text-center">
                                                                {row.task || "N/A"}
                                                            </div>
                                                        </td>
                                                        <td scope="col" className="p-2 whitespace-nowrap">
                                                            <div className="font-medium text-center">
                                                                {row.status || "N/A"}
                                                            </div>
                                                        </td>
                                                        <td scope="col" className="p-2 whitespace-nowrap">
                                                            <div className="font-medium text-center">
                                                                {row.due_date || "N/A"}
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
                                disabled={indexOfLastItem >= taskData.length}
                            >
                                Next
                            </button>
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                Page {taskData.length > 0 ? currentPage : 0} of{" "}
                                {taskData.length > 0
                                    ? Math.ceil(taskData.length / itemsPerPage)
                                    : 0}
                            </div>
                        </div>
                        {/* <div className="mt-4 flex justify-end">
                            <button className="py-1 px-3 bg-[#3B82F6] hover:bg-[#3EBF76] text-white text-sm font-inter rounded-full shadow-lg" onClick={downloadExcel}>
                                <FontAwesomeIcon icon={faDownload} /> Download Excel
                            </button>
                        </div> */}
                    </div>
                </div>
     )
}

export default ViewAssignedTask;