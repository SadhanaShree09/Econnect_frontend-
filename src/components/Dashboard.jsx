import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Baseaxios, LS ,ipadr} from "../Utils/Resuse";
import { format } from "date-fns";

export default function Clockdashboard() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userid = LS.get("userid");
        const attendanceResponse = await axios.get(`${ipadr}/clock-records/${userid}`);
        console.log("API Response:", attendanceResponse.data);
        setAttendanceData(attendanceResponse.data && Array.isArray(attendanceResponse.data.clock_records) ? attendanceResponse.data.clock_records : []);
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
        setAttendanceData([]);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return timeString;
      return format(date, 'hh:mm:ss a');
    } catch (error) {
      return timeString;
    }
  };

  return (
    <div className="rounded-md  w-full px-[7rem]">
      <div className="w-full h-full bg-whte shadow-lg rounded-sm border border-gray-200">
        <header className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Timing</h2>
        </header>
        <div className="p-3">
          <div>
            <table className="table-auto w-full overflow-y-auto">
              <thead className="text-xs font-semibold uppercase text-black bg-[#6d9eeb7a]">
                <tr>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-center">
                      Date
                    </div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-center">
                      Login Time
                    </div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-center">
                      Logout Time
                    </div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-center">
                      Total hours of working
                    </div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-center">
                      Status
                    </div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-center">
                      Remark
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {attendanceData.map((row, index) => (
                  <tr key={index}>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-center">{formatDate(row.date)}</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-center">{formatTime(row.clockin)}</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-center">{formatTime(row.clockout)}</div>
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
        </div>
      </div>
    </div>
  );
}