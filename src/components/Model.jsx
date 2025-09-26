import React from "react";
import "./model.css";


export const Model = ({ onSubmit, onCancel, closeModal, children }) => {
  return (
    <div
      className="model-container"
      onClick={(e) => {
        if (e.target.className === "model-container")
          closeModal("Model was closed");
      }}
    >
      <div className="model">
        <div
          className="model-header"
          onClick={() => closeModal("Model was closed")}
        >
          <p className="close">&times;</p>
        </div>
        <div className="model-content">{children}</div>
        <div className="model-footer">
          <button
            type="submit"
            className="btn btn-submit"
            onClick={() => onSubmit("Submit button was clicked")}
          >
            Submit
          </button>
          <button
            type="submit"
            className="btn btn-cancel"
            onClick={() => onCancel("Cancel button was clicked")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
