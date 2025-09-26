import React from "react";
import { Navigate } from "react-router-dom";
import { LS } from "./Resuse";

function AdminAuth({ children }) {
  const isAdmin = LS.get("isadmin");
  
  // Check if user has admin privileges - only actual admins, not HR
  const hasAdminAccess = isAdmin === true || isAdmin === "true";
  
  if (hasAdminAccess) {
    return <>{children}</>;
  }
  
  // Redirect to user dashboard if not admin
  return <Navigate to="/User/Clockin_int" replace />;
}

export default AdminAuth;
