import React from "react";
import "./Modal.css";


export const Modal = ({ onSubmit, onCancel, closeModal, children }) => {
  return (
    <div
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    onClick={(e) => {
      if (e.target.className.includes("modal-overlay"))
        closeModal("Modal was closed");
    }}
  >
    <div className="modal-overlay absolute inset-0"></div>
    <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative animate-fade-in">
      {/* Modal Header */}
      <div className="flex justify-between items-center border-b pb-2">
        {/* <h2 className="text-lg font-semibold text-gray-800">Modal Title</h2> */}
        <button
          className="text-gray-500 hover:text-gray-800 text-xl"
          onClick={() => closeModal("Modal was closed")}
        >
          &times;
        </button>
      </div>
  
      {/* Modal Content */}
      <div className="py-4 text-gray-700">{children}</div>
  
      {/* Modal Footer */}
      <div className="flex justify-end space-x-3 border-t pt-2">
        <button
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
          onClick={() => onCancel("Cancel button was clicked")}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          onClick={() => onSubmit("Submit button was clicked")}
        >
          Submit
        </button>
      </div>
    </div>
  </div>
  
  );
};
