// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { AiOutlineEdit } from "react-icons/ai";
// import { LS,ipadr } from "../Utils/Resuse";

// const API_BASE_URL = `${ipadr}`; // Backend URL

// const UserProfile = () => {
//     const navigate = useNavigate();
//     const userid = LS.get("userid"); // Get the user ID from local storage

//     const [userInfo, setUserInfo] = useState({
//         name: "",
//         email: "",
//         phone: "",
//         position: "",
//         dateOfJoining: "",
//         department: "",
//         address: "",
//         education: [],
//         skills: [],
//     });

//     useEffect(() => {
//         const fetchData = async () => {
//             if (!userid) {
//                 console.error("User ID is not available.");
//                 return;
//             }
//             try {
//                 const response = await fetch(`${API_BASE_URL}/get_user/${userid}`);
//                 const contentType = response.headers.get("content-type");

//                 if (response.ok && contentType?.includes("application/json")) {
//                 const data = await response.json();

//                 if (!data) {
//                     console.error("User not found");
//                     return;
//                 }

//                 setUserInfo({
//                     name: data.name || "John Doe",
//                     email: data.email || "johndoe@example.com",
//                     phone: data.phone || "(123) 456-7890",
//                     position: data.position || "Software Engineer",
//                     dateOfJoining: data.date_of_joining || "01 Jan 2023",
//                     department: data.department || "IT",
//                     address: data.address || "123 Main St, City, Country",
//                     education: data.education || [],
//                     skills: data.skills || [],
//                 });
//                 } else {
//                 console.error("Response was not JSON:", await response.text());
//                 }
//             } catch (error) {
//                 console.error("Error fetching user data:", error);
//             }
//         };

//         fetchData();
//     }, [userid]);

//     const handleEditProfileClick = () => {
//         navigate("/User/EditProfile");
//     };


//     return (
//         <div className="mr-8 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-lg justify-center items-center relative ml-10 rounded-md">
//             <div className="flex flex-col justify-between items-left w-full relative p-6">
//                 <div className="flex flex-col ">
//                     <div className="p-4 border mb-4 rounded-md shadow-sm bg-gray-50">
//                         <h2 className="text-2xl font-medium text-zinc-700 mb-4">Employee profile</h2>
//                         <div className="">
//                             <img
//                                 src="https://static.vecteezy.com/system/resources/previews/023/402/601/original/man-avatar-free-vector.jpg"
//                                 alt="User Profile"
//                                 className="rounded-full w-32 h-32 object-cover border-2 border-gray-300"
//                             />
//                         </div>

//                     </div>  
//                 </div>

//                 <div className="px-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
//                     <div className="p-4 border rounded-md shadow-sm bg-gray-50">
//                         <h2 className="text-2xl font-medium text-zinc-700 mb-4">Personal Information</h2>
//                         <p className="text-lg font-medium text-zinc-600">
//                             <strong>Name: </strong>{userInfo.name}
//                         </p>
//                         <p className="text-lg font-medium text-zinc-600">
//                             <strong>Email: </strong>{userInfo.email}
//                         </p>
//                         <p className="text-lg font-medium text-zinc-600">
//                             <strong>Phone: </strong>{userInfo.phone}
//                         </p>
//                         <p className="text-lg font-medium text-zinc-600">
//                             <strong>Address: </strong>{userInfo.address}
//                         </p>
//                     </div>
//                     <div className="p-4 border rounded-md shadow-sm bg-gray-50">
//                         <h2 className="text-2xl font-medium text-zinc-700 mb-4">Work Details</h2>
//                         <p className="text-lg font-medium text-zinc-600">
//                             <strong>Position: </strong>{userInfo.position}
//                         </p>
//                         <p className="text-lg font-medium text-zinc-600">
//                             <strong>Department: </strong>{userInfo.department}
//                         </p>
//                         <p className="text-lg font-medium text-zinc-600">
//                             <strong>Date of Joining: </strong>{userInfo.dateOfJoining}
//                         </p>
//                     </div>
//                 </div>

//                 <div className="px-10 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
//                     <div className="p-4 border rounded-md shadow-sm bg-gray-50">
//                         <h2 className="text-2xl font-medium text-zinc-700 mb-4">Education</h2>
//                         {userInfo.education.map((edu, index) => (
//                             <p key={index} className="text-lg font-medium text-zinc-600">
//                                 <strong>{edu.degree}</strong> at {edu.institution} ({edu.year})
//                             </p>
//                         ))}
//                     </div>
//                     <div className="p-4 border rounded-md shadow-sm bg-gray-50">
//                         <h2 className="text-2xl font-medium text-zinc-700 mb-4">Skills</h2>
//                         {userInfo.skills.map((skill, index) => (
//                             <div key={index} className="mb-2">
//                                 <p className="text-lg font-medium text-zinc-600">{skill.name}</p>
//                                 <div className="w-full bg-gray-200 rounded-full h-2.5">
//                                     <div
//                                         className="bg-blue-500 h-2.5 rounded-full"
//                                         style={{ width: `${skill.level}%` }}
//                                     ></div>
//                                 </div>
//                             </div>
                            
//                         ))}
//                     </div>
//                 </div>
//             </div>
            
//         </div>
//     );
// }

// export default UserProfile;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { BarChart3 } from "lucide-react";
import { LS, ipadr } from "../Utils/Resuse";
import AttendanceStats from "./AttendanceStats"; // Import the new component

const API_BASE_URL = `${ipadr}`; // Backend URL

const UserProfile = () => {
  const navigate = useNavigate();
  const userid = LS.get("userid"); // Get the user ID from local storage

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    dateOfJoining: "",
    department: "",
    address: "",
    education: [],
    skills: [],
  });

  const [showAttendance, setShowAttendance] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userid) {
        console.error("User ID is not available.");
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/get_user/${userid}`);
        const contentType = response.headers.get("content-type");

        if (response.ok && contentType?.includes("application/json")) {
          const data = await response.json();
          console.log("Fetched user data:", data); // 👈 check actual response shape

          if (!data) {
            console.error("User not found");
            return;
          }

          setUserInfo({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            position: data.position || "",
            dateOfJoining: data.date_of_joining || "", // 👈 make sure snake_case here
            department: data.department || "",
            address: data.address || "",
            education: data.education || [],
            skills: data.skills || [],
          });
        } else {
          console.error("Response was not JSON:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [userid]);

  const handleEditProfileClick = () => {
    navigate("/User/EditProfile");
  };

  const handleAttendanceClick = () => {
    setShowAttendance(true);
  };

  const handleCloseAttendance = () => {
    setShowAttendance(false);
  };

  return (
    <>
      <div className="mr-8 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-lg justify-center items-center relative ml-10 rounded-md">
        <div className="flex flex-col justify-between items-left w-full relative p-6">
          <div className="flex flex-col ">
            <div className="p-4 border mb-4 rounded-md shadow-sm bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-medium text-zinc-700">
                  Employee profile
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={handleAttendanceClick}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>View Attendance</span>
                  </button>
                  {/* <button
                    onClick={handleEditProfileClick}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-sm"
                  >
                    <AiOutlineEdit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button> */}
                </div>
              </div>
              <div>
                <img
                  src="https://static.vecteezy.com/system/resources/previews/023/402/601/original/man-avatar-free-vector.jpg"
                  alt="User Profile"
                  className="rounded-full w-32 h-32 object-cover border-2 border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="px-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-4 border rounded-md shadow-sm bg-gray-50">
              <h2 className="text-2xl font-medium text-zinc-700 mb-4">
                Personal Information
              </h2>
              <p className="text-lg font-medium text-zinc-600">
                <strong>Name: </strong>
                {userInfo.name}
              </p>
              <p className="text-lg font-medium text-zinc-600">
                <strong>Email: </strong>
                {userInfo.email}
              </p>
              <p className="text-lg font-medium text-zinc-600">
                <strong>Phone: </strong>
                {userInfo.phone}
              </p>
              <p className="text-lg font-medium text-zinc-600">
                <strong>Address: </strong>
                {userInfo.address}
              </p>
            </div>
            <div className="p-4 border rounded-md shadow-sm bg-gray-50">
              <h2 className="text-2xl font-medium text-zinc-700 mb-4">
                Work Details
              </h2>
              <p className="text-lg font-medium text-zinc-600">
                <strong>Position: </strong>
                {userInfo.position}
              </p>
              <p className="text-lg font-medium text-zinc-600">
                <strong>Department: </strong>
                {userInfo.department}
              </p>
              <p className="text-lg font-medium text-zinc-600">
                <strong>Date of Joining: </strong>
                {userInfo.dateOfJoining}
              </p>
            </div>
          </div>

          <div className="px-10 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-4 border rounded-md shadow-sm bg-gray-50">
              <h2 className="text-2xl font-medium text-zinc-700 mb-4">Education</h2>
              {userInfo.education.length > 0 ? (
                userInfo.education.map((edu, index) => (
                  <p key={index} className="text-lg font-medium text-zinc-600">
                    <strong>{edu.degree}</strong> at {edu.institution} ({edu.year})
                  </p>
                ))
              ) : (
                <p className="text-lg text-zinc-400">No education details</p>
              )}
            </div>
            <div className="p-4 border rounded-md shadow-sm bg-gray-50">
              <h2 className="text-2xl font-medium text-zinc-700 mb-4">Skills</h2>
              {userInfo.skills.length > 0 ? (
                userInfo.skills.map((skill, index) => (
                  <div key={index} className="mb-2">
                    <p className="text-lg font-medium text-zinc-600">{skill.name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-lg text-zinc-400">No skills added</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Modal */}
      {showAttendance && (
        <AttendanceStats onClose={handleCloseAttendance} />
      )}
    </>
  );
};

export default UserProfile;
