import { useState } from "react";
import bot1 from "../assets/login.gif.gif";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify"
import { Apisignin, Apisignup } from "../Api/Loginauth";
import { useNavigate } from "react-router-dom";
import { Authdata } from "../Utils/Authprovider";
import { LS } from "../Utils/Resuse";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function Largepc({ log }) {
  const navigate = useNavigate();
  const { SetStatedata } = Authdata();
  const [Signupdata, setSignupdata] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignup = async () => {
    try {
      const res = await Apisignup({
        email: Signupdata.email,
        password: Signupdata.password,
        name: Signupdata.name,
      });
      navigate("User/Dashboard", {
        state: { id: res.id, token: res.access_token },
      });
    } catch (err) {
      console.log(err.toString().split(":")[1]);
      // Handle error, show message to user, etc.
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      let userDecode = jwtDecode(credentialResponse.credential);
      console.log(userDecode);
      const res = await Apisignin({
        client_name: userDecode.name,
        email: userDecode.email,
      });
      LS.save("userid", res.id);
      navigate("User/Clockin_int", {
        state: { id: res.id, token: res.access_token },
      });
    } catch (err) {
      console.log(err);
      
    }
  };

  return (
    <div className="h-full w-full flex items-start">
      <div className="h-full w-full bg-white flex items-center flex-col justify-center">
        <img className="h-5/6 w-auto" src={bot1} alt="Login GIF" />
      </div>
      <div className="h-full w-full bg-[#ffffff] items-center justify-center flex">
        {log ? (
          <div className="max-w-4xl text-start rounded-lg bg-[#e6eaf0] flex-col items-center justify-center px-8 py-8">
            <h1 className="text-center text-4xl font-bold font-Merriweather mb-[2rem]">Signup</h1>
            <p className="font-Domine text-sm mb-[1.5rem] md:text-lg">Enter your details to create a new account</p>
            <div className="mb-[1rem] md:mb-[2rem]">
              <p className="text-[0.7rem] md:text-[1rem] font-bold text-start md:font-Merriweather mb-[0.9rem]">Email</p>
              <input
                onChange={(e) => setSignupdata({ ...Signupdata, email: e.target.value })}
                className="w-full rounded-md py-1.5 placeholder:pl-[2rem] placeholder:text-[0.8rem] placeholder:tracking-wide pl-5 font-Merriweather outline-none border-2 border-black"
                placeholder="Email"
              />
            </div>
            {/* Other input fields for name, password */}
            <button
              onClick={handleSignup}
              className="w-52 text-white bg-[#6d9eeb;] px-2 py-2 rounded-lg font-Merriweather font-bold md:text-[1.1rem] uppercase md:py-3 mb-[1rem] "
            >
              Create User
            </button>
          </div>
        ) : (
          <div className="max-w-8xl text-start rounded-3xl bg-gradient-to-b from-blue-400 to-indigo-800 flex-col items-center justify-center px-8 py-8 md:px-[4rem] md:py-[5rem] ">
            <div className="text-center text-4xl text-white font-bold font-poppins mb-[2rem]">
              RBG EConnect
              <p className='mb-3 mt-4 font-poppins text-base text-center text-zinc-300 '>Use your Google account to continue with RBG EConnect!</p>
            </div>
            <div className="flex justify-center">
              <GoogleOAuthProvider clientId="333036008565-7qkpcqr080na6l9fpcn492kc00ea2bv1.apps.googleusercontent.com">
                <GoogleLogin
                  className="w-full h-full"
                  onSuccess={handleGoogleLogin}
                  useOneTap
                  
                />
              </GoogleOAuthProvider>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        position="bottom-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* <Toaster position="bottom-center" reverseOrder={false} /> */}
    </div>
  );
}

export default Largepc;

