

import React from "react";
import logo from "../assets/logo.png";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { Authdata } from "../Utils/Authprovider";
import { Apisignin } from "../Api/Loginauth";
import { jwtDecode } from "jwt-decode";
import { LS } from "../Utils/Resuse";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const { SetStatedata } = Authdata();

 const getIpInfo = async () => {
    
    
    try {
      console.log("Starting Google login process...");

      // Decode Google JWT
      let userDecode = jwtDecode(credentialResponse.credential);
      console.log("Google credentials decoded:", {
        name: userDecode.name,
        email: userDecode.email
      });

      // Call backend
      const res = await Apisignin({
        client_name: userDecode.name,
        email: userDecode.email,
      });
      console.log("API signin response:", res);

      // Store user data in localStorage
      localStorage.setItem("userid", res._id || res.id);
      localStorage.setItem("name", res.name);
      localStorage.setItem("email", res.email);
      localStorage.setItem("isloggedin", res.isloggedin.toString());
      localStorage.setItem("isadmin", res.isadmin.toString());
      localStorage.setItem("access_token", res.access_token);

      // Also save using LS utility
      LS.save("userid", res._id || res.id);
      LS.save("name", res.name);
      LS.save("email", res.email);
      LS.save("access_token", res.access_token);
      LS.save("Auth", true);

      // Navigation based on user role
      const loggedIn = res.isloggedin;
      const isAdmin = res.isadmin;

      console.log("Navigation check:", { loggedIn, isAdmin });

      if (loggedIn && isAdmin) {
        console.log("Navigating to admin dashboard");
        navigate("admin/time", {
          state: { userid: res._id || res.id, token: res.access_token },
        });
      } else if (loggedIn && !isAdmin) {
        console.log("Navigating to user dashboard");
        navigate("User/Clockin_int", {
          state: { userid: res._id || res.id, token: res.access_token },
        });
      } else {
        toast.error("Login failed. Please contact administrator.");
      }

      // Show success message
      toast.success("Login successful!");
      
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An error occurred during login. Please try again.");
    }
  };
  const validateIp = (userIp, currentIps) => {
    if (!userIp) {
      console.log("No IP validation needed - IP not present in response");
      return true;
    }
    
    console.log("Performing IP validation:");
    console.log("User IP from response:", userIp);
    console.log("Current Public IP:", currentIps.publicIp);
    console.log("Current Local IP:", currentIps.localIp);
    
    const matchesPublic = currentIps.publicIp === userIp;
    const matchesLocal = currentIps.localIp === userIp;
    
    console.log("Matches public IP:", matchesPublic);
    console.log("Matches local IP:", matchesLocal);
    
    return matchesPublic || matchesLocal;
  };

const handleGoogleLogin = async (credentialResponse) => {
  try {
    console.log("Starting Google login process...");

    // First get the current IP information
    const currentIps = await getIpInfo();
    console.log("Retrieved current IPs:", currentIps);

    // Decode Google JWT
    let userDecode = jwtDecode(credentialResponse.credential);
    console.log("Google credentials decoded:", {
      name: userDecode.name,
      email: userDecode.email
    });

    // Call backend
    const res = await Apisignin({
      client_name: userDecode.name,
      email: userDecode.email,
    });
    console.log("API signin response:", res);

    // ✅ Store userid correctly
    localStorage.setItem("userid", res._id || res.id);
    LS.save("userid", res._id || res.id);

    localStorage.setItem("name", res.name);
    localStorage.setItem("email", res.email);
    localStorage.setItem("isloggedin", res.isloggedin.toString());
    localStorage.setItem("isadmin", res.isadmin.toString());
    localStorage.setItem("access_token", res.access_token);

    // IP validation
    if (res.ip) {
      console.log("IP validation required. Response IP:", res.ip);
      if (!validateIp(res.ip, currentIps)) {
        console.log("IP validation failed!");
        toast.error("Remote work IP is mismatched. Please connect from an authorized network.");
        return;
      }
      console.log("IP validation successful!");
    } else {
      console.log("No IP validation required");
    }

    // Navigation
    const loggedIn = res.isloggedin;
    const isAdmin = res.isadmin;

    console.log("Navigation check:", { loggedIn, isAdmin });

    if (loggedIn && isAdmin) {
      navigate("admin/time", {
        state: { userid: res._id || res.id, token: res.access_token },
      });
    } else if (loggedIn && !isAdmin) {
      navigate("User/Clockin_int", {
        state: { userid: res._id || res.id, token: res.access_token },
      });
    } else {
      toast.error("Login failed. Please contact administrator.");
    }
  } catch (err) {
    console.error("Login error:", err);
    toast.error("An error occurred during login. Please try again.");
  }
};

  // return (
  //   <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
  //     <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-lg">
  //       <div className="flex flex-col items-center justify-center p-8">
  //         <div className="text-center mb-6">
  //           <img src={logo} alt="Company Logo" className="h-32 mx-auto" />
  //           <h1 className="text-2xl font-bold text-gray-700 mt-4">
  //             Welcome to E-Connect
  //           </h1>
  //         </div>
  //         <div className="w-full">
  //           <h2 className="text-xl font-semibold text-gray-600 mb-4 text-center">
  //             Sign in with Google
  //           </h2>
  //           <div className="flex justify-center">
  //             <GoogleOAuthProvider clientId="616660088488-17nrc3n7j9ibd7f29680qorv56442nd8.apps.googleusercontent.com">
  //               <GoogleLogin
  //                 onSuccess={handleGoogleLogin}
  //                 useOneTap
  //               />
  //             </GoogleOAuthProvider>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-lg">
        <div className="flex flex-col items-center justify-center p-8">
          {/* Logo + Title */}
          <div className="text-center mb-6">
            <img src={logo} alt="Company Logo" className="h-32 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-700 mt-4">
              Welcome to E-Connect
            </h1>
          </div>

          {/* Google Login */}
          <div className="w-full">
            <h2 className="text-xl font-semibold text-gray-600 mb-4 text-center">
              Sign in with Google
            </h2>
            <div className="flex justify-center">
              <GoogleOAuthProvider clientId="616660088488-17nrc3n7j9ibd7f29680qorv56442nd8.apps.googleusercontent.com">
                <GoogleLogin onSuccess={handleGoogleLogin} />
              </GoogleOAuthProvider>
            </div>
          </div>

          {/* OR Divider */}
          <div className="flex items-center my-6 w-full">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-3 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Links to normal login/signup */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Prefer Email/Password?{" "}
              <Link to="/signin" className="text-blue-500 font-medium hover:underline">
                Sign In
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              New here?{" "}
              <Link to="/signup" className="text-blue-500 font-medium hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
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
    </div>
  );
}
