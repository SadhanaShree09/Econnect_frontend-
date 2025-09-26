import React, { useState } from "react";
import { Apisignup } from "../Api/Loginauth";
import { LS } from "../Utils/Resuse";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [Signupdata, SetSignupdata] = useState({
    name: "",
    email: "",
    password: "",
  });
  const Signup = async () => {
    let a = await Apisignup({
      email: Signupdata.email,
      password: Signupdata.password,
      name: Signupdata.name,
    })
      .then((res) => {
        navigate("User/Dashboard", {
          state: { id: res.id, token: res.access_token },
        });
      })
      .catch((err) => {
        console.log(err.toString().split(":")[1]);
      });
  };
  return (
    <div className="h-full w-full flex items-center justify-center lg:hidden">
      <div className="max-w-xs md:max-w-md text-center  border-2 shadow-xl  rounded-lg card   bg-white flex-col items-center justify-center px-8 py-8 md:px-15 md:py-[4rem]">
        <h1 className=" text-[1.5rem] md:text-3xl text-bold font-Noticia mb-[0.8rem] ">
          New Employee
        </h1>
        <p className="font-Domine text-sm mb-[1.5rem] md:text-lg">
          Enter your details to get Create to ur account
        </p>
        <div className="mb-[1rem] md:mb-[2rem]">
          <p className="text-[0.7rem] md:text-[1rem] font-bold text-start md:font-Merriweather mb-[0.4rem]">
            Email
          </p>
          <input
            onChange={(e) => {
              SetSignupdata({ ...Signupdata, email: e.target.value });
            }}
            placeholder="Email"
            className="placeholder:pl-[1rem] placeholder:text-[0.8rem] w-full  border-black border-2 rounded-md py-1.5  px-[3rem]"
          />{" "}
        </div>
        <div className="mb-[1rem] md:mb-[2rem]">
          <p className=" text-[0.7rem] md:text-[1rem] font-bold text-start md:font-Merriweather mb-[0.4rem]">
            Username
          </p>
          <input
            onChange={(e) => {
              SetSignupdata({ ...Signupdata, name: e.target.value });
            }}
            placeholder="Username"
            className="placeholder:pl-[1rem] placeholder:text-[0.8rem] w-full  border-black border-2 rounded-md py-1.5 px-[3rem]"
          />{" "}
        </div>
        <div className="mb-[1rem] md:mb-[2rem]">
          <p className="text-[0.7rem] md:text-[1rem] md:font-Merriweather text-start font-bold mb-[0.4rem] ">
            {" "}
            Password
          </p>
          <input
            onChange={(e) => {
              SetSignupdata({ ...Signupdata, password: e.target.value });
            }}
            type="password"
            placeholder="Password"
            className="placeholder:pl-[1rem] placeholder:text-[0.8rem] w-full border-black border-2 rounded-md py-1.5 px-[3rem]"
          />{" "}
        </div>
        <div className="mb-[1rem] md:mb-[2rem]">
          <p className="text-[0.7rem] md:text-[1rem] md:font-Merriweather text-start font-bold mb-[0.4rem] placeholder:pl-[1rem] placeholder:text-[0.8rem]">
            {" "}
            Confirm Password
          </p>
          <input
            placeholder="Confirm Password"
            className="placeholder:pl-[1rem] placeholder:text-[0.8rem] w-full border-black border-2 rounded-md py-1.5"
          />{" "}
        </div>
        <button
          onClick={(e) => {
            Signup();
          }}
          className="w-full text-white bg-black px-2 py-2 rounded-lg font-Merriweather font-bold md:text-[1.1rem] uppercase md:py-3 mb-[1rem]"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
