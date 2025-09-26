import React, { useState } from "react";
import { Apisignin } from "../Api/Loginauth";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { LS } from "../Utils/Resuse";

export default function Signin() {
  const navigate = useNavigate();
  const [Login, Setlogin] = useState({
    email: "",
    password: "",
  });

  const Loginfunc = async () => {
    console.log(Login);
    let a = await Apisignin({
      email: Login.email,
      password: Login.password,
    })
      .then((res) => {
        console.log(res.id);
        toast.success("Login SuccessFull");
        //  LS.save('id',res.id)
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
          Employee Login
        </h1>
        <p className="font-Domine text-sm mb-[1.5rem] md:text-lg">
          Enter your details to get Sign in to ur account
        </p>
        <div className="mb-[1rem] md:mb-[2rem] w-full">
          <p className="text-[0.7rem] md:text-[1rem] font-bold text-start md:font-Merriweather mb-[0.4rem]">
            Username
          </p>
          <input
            onChange={(e) => {
              Setlogin({ ...Login, email: e.target.value });
            }}
            placeholder="Username"
            className="placeholder:pl-[1rem] placeholder:text-[0.8rem] w-full  border-black border-2 rounded-md py-1.5 px-[3rem]"
          />{" "}
        </div>
        <div className="mb-[1rem] md:mb-[2rem] w-full">
          <p className="text-[0.7rem] md:text-[1rem] md:font-Merriweather text-start font-bold mb-[0.4rem]">
            {" "}
            Password
          </p>
          <input
            onChange={(e) => {
              Setlogin({ ...Login, password: e.target.value });
            }}
            type="password"
            placeholder="Password"
            className="placeholder:pl-[1rem] placeholder:text-[0.8rem] w-full border-black border-2 rounded-md py-1.5 px-[3rem]"
          />{" "}
        </div>

        <button
          onClick={(e) => {
            Loginfunc();
          }}
          className="w-full text-white bg-black px-2 py-2 rounded-lg font-Merriweather font-bold md:text-[1.1rem] uppercase md:py-3 mb-[1rem]"
        >
          Sign in
        </button>
      </div>
      <Toaster position="bottom-center" reverseOrder={false} />
    </div>
  );
}
