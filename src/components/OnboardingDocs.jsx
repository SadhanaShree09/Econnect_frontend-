// src/components/EmployeeDashboard.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  RefreshCcw,
   CheckCircle ,
  Trash2,
  Eye,
  Upload,
  FileClock,
  FileCheck,
  FileUp,
   Clock, 
   
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

import axios from "axios";
import { LS } from "../Utils/Resuse";
import Fileuploader from "./Fileuploader"; // <-- import the modal uploader

export default function EmployeeDashboard() {
  const userid = LS.get("userid");
  const [assignedDocs, setAssignedDocs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [openUploader, setOpenUploader] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { docName } = location.state || {}; 
  
  


  const pageSize = 5;

  /** Fetch assigned documents */
  const fetchAssignedDocs = useCallback(async () => {
    if (!userid) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8000/documents/assigned/${encodeURIComponent(userid)}`
      );

      const docsArray = Array.isArray(res.data.assigned_docs)
        ? res.data.assigned_docs
        : Array.isArray(res.data)
        ? res.data
        : [];

      const mappedDocs = docsArray.map((doc) => ({
        docName: doc.docName,
        assignedAt: doc.assignedAt ? doc.assignedAt.replace(/\.\d+/, "") : null,
        fileUrl: doc.fileUrl || null,
        fileId: doc.fileId || null,
        status: doc.status ? doc.status.toLowerCase() : "pending",
      }));

      const sorted = mappedDocs.sort(
        (a, b) => new Date(b.assignedAt || 0) - new Date(a.assignedAt || 0)
      );

      setAssignedDocs(sorted);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch documents");
      setAssignedDocs([]);
    } finally {
      setLoading(false);
    }
  }, [userid]);

  useEffect(() => {
    fetchAssignedDocs();
    const interval = setInterval(fetchAssignedDocs, 30000);
    return () => clearInterval(interval);
  }, [fetchAssignedDocs]);

  /** Filter documents by search */
  const filteredDocs = useMemo(() => {
    if (!searchTerm) return assignedDocs;
    return assignedDocs.filter((doc) =>
      doc.docName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assignedDocs, searchTerm]);

  /** Pagination */
  const totalPages = Math.ceil(filteredDocs.length / pageSize);
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocs.slice(start, start + pageSize);
  }, [filteredDocs, currentPage]);

  /** Status summary counts */
  const statusCounts = useMemo(() => {
    return assignedDocs.reduce(
      (acc, doc) => {
        if (doc.status === "verified") acc.verified++;
        else if (doc.fileUrl) acc.uploaded++;
        else acc.pending++;
        return acc;
      },
      { pending: 0, uploaded: 0, verified: 0 }
    );
  }, [assignedDocs]);

  /** Status badge component */
  const StatusBadge = ({ status, fileUrl }) => {
    if (status === "verified")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-green-100 text-green-700">
          <CheckCircle size={14} />  Verified
        </span>
      );
    if (fileUrl)
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-700">
          <Upload size={14} /> Uploaded
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-yellow-100 text-yellow-700">
        <Clock size={14} />  Pending
      </span>
    );
  };

  /** Action buttons component */
  const ActionButtons = ({ doc }) => {
  if (doc.fileUrl) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <a
          href={`http://localhost:8000${doc.fileUrl}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <Eye size={16} /> View
        </a>
        
        <button
          onClick={async () => {
            try {
              await axios.delete(
                `http://localhost:8000/documents/delete/${doc.fileId}`
              );
              setAssignedDocs((prev) =>
                prev.map((d) =>
                  d.docName === doc.docName
                    ? { ...d, fileUrl: null, fileId: null, status: "pending" }
                    : d
                )
              );
              toast.success("File deleted successfully");
            } catch {
              toast.error("Failed to delete file");
            }
          }}
          className="flex items-center gap-1 text-red-600 hover:underline"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setSelectedDoc(doc);
        setOpenUploader(true);
      }}
      className="flex items-center gap-1 text-blue-600 hover:underline"
    >
      <Upload size={16} /> Upload
    </button>
  );
};

  return (
    <div className="p-6 min-h-screen w-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">📄 My Documentation</h1>
        <button
          onClick={fetchAssignedDocs}
          disabled={loading || !userid}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCcw size={18} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow flex flex-col items-center">
          <FileClock className="text-yellow-500 mb-2" size={28} />
          <p className="text-yellow-600 font-bold text-xl">{statusCounts.pending}</p>
          <p className="text-gray-600">Pending</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow flex flex-col items-center">
          <FileUp className="text-blue-600 mb-2" size={28} />
          <p className="text-blue-600 font-bold text-xl">{statusCounts.uploaded}</p>
          <p className="text-gray-600">Uploaded</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow flex flex-col items-center">
          <FileCheck className="text-green-600 mb-2" size={28} />
          <p className="text-green-600 font-bold text-xl">{statusCounts.verified}</p>
          <p className="text-gray-600">Verified</p>
        </div>
      </div>

      {/* Search */}
      <div className="sticky top-0 z-10 bg-gray-50 pb-4">
        <input
          type="text"
          placeholder="🔍 Search documents..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full max-w-md px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 shadow-sm"
        />
      </div>

      {/* Documents Table */}
      <div className="overflow-hidden flex-1 flex flex-col">
    {/* Table Header */}
    <table className="w-full border-collapse table-fixed">
      <thead className="bg-gray-100 text-sm sticky top-0 z-10">
        <tr className="text-left text-gray-600">
          <th className="p-4">Document</th>
          <th className="p-4">Status</th>
          <th className="p-4">Actions</th>
          <th className="p-4">Assigned At</th>
        </tr>
      </thead>
    </table>

    {/* Scrollable Table Body */}
    <div className="overflow-y-auto flex-1 max-h-[60vh]">
      <table className="w-full border-collapse table-fixed">
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="p-6 text-center text-gray-400">
                <div className="flex justify-center items-center gap-2">
                  <span className="animate-spin border-2 border-gray-300 border-t-blue-600 rounded-full w-5 h-5"></span>
                  Loading documents...
                </div>
              </td>
            </tr>
          ) : paginatedDocs.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-6 text-center text-gray-400">
                No documents found.
              </td>
            </tr>
          ) : (
            paginatedDocs.map((doc, index) => (
              <tr
                key={`${doc.fileId || index}-${doc.docName}`}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-4 font-medium text-gray-800">{doc.docName}</td>
                <td className="p-4">
                  <StatusBadge status={doc.status} fileUrl={doc.fileUrl} />
                </td>
                <td className="p-4">
                  <ActionButtons doc={doc} />
                </td>
                <td className="p-4 text-gray-500">
                  {doc.assignedAt
                    ? new Date(doc.assignedAt).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

        {/* Pagination */}
         {/* Pagination (fixed under table) */}
    {totalPages > 1 && (
      <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 text-sm">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
        >
          Previous
        </button>
        <span className="px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
        >
          Next
        </button>
      </div>
   

        )}
      </div>

      {/* Modal File Uploader */}
      {openUploader && selectedDoc && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        onClick={() => setOpenUploader(false)}
      >
        <X size={20} />
      </button>
      <Fileuploader
  userid={userid}
  docName={selectedDoc.docName}
  onUpload={(uploadedFile) => {
    setAssignedDocs((prev) =>
      prev.map((doc) =>
        doc.docName === uploadedFile.docName
          ? {
              ...doc,
              fileUrl: uploadedFile.fileUrl,
              fileId: uploadedFile.fileId,
              status: "uploaded",
            }
          : doc
      )
    );
    setOpenUploader(false);
    toast.success("File uploaded and sent to admin!");
  }}
  onClose={() => setOpenUploader(false)}
/>
    </div>
  </div>
)}
    </div>
  );
}
