import React, { createContext, useContext, useState } from "react";
import App from "../App";
const Authcontext = createContext("");
export const Authdata = () => useContext(Authcontext);
export function Authprovider() {
  const [Statedata, SetStatedata] = useState({
    userid: "",
    isauth: false,
    name: "",
  });

  return (
    <>
      <Authcontext.Provider value={{ Statedata, SetStatedata }}>
        <App />;
      </Authcontext.Provider>
    </>
  );
}
