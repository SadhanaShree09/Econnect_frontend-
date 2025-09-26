import React from "react";
import { Authdata } from "./Authprovider";
import { Navigate } from "react-router-dom";
import { LS } from "./Resuse";

function Checkauth({ children }) {
  if (LS.get("Auth")) {
    return <main>{children}</main>;
  }
  return <Navigate to="../" replace />;
}

export default Checkauth;
