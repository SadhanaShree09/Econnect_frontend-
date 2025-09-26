// src/components/Fileuploader.jsx
import { useState, useRef } from "react";
import { Upload, X, Trash2 } from "lucide-react";
import axios from "axios";

export default function Fileuploader({ userid, docName, onUpload, onClose }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Select file handler
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Upload handler
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("userid", userid);
    formData.append("docName", docName);
    formData.append("file", selectedFile);

    try {
      const res = await axios.post(
        "http://localhost:8000/upload_document",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      onUpload({
        docName,
        fileUrl: `/files/${res.data.file_id}`, // adjust according to backend route
        fileId: res.data.file_id,
      });
    } catch (err) {
      console.error(err);
      alert("❌ Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-700 font-medium">Uploading for: {docName}</p>

      <div className="flex items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
        >
          <Upload size={16} /> Choose File
        </button>
        {selectedFile && (
          <span className="text-gray-600 flex items-center gap-2">
            {selectedFile.name}{" "}
            <Trash2
              size={16}
              className="cursor-pointer hover:text-red-600"
              onClick={() => setSelectedFile(null)}
            />
          </span>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
