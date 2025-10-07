

import React from "react";
import logo from "../assets/logo.png";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { Authdata } from "../Utils/Authprovider";
import { Apisignin } from "../Api/Loginauth";
import { jwtDecode } from "jwt-decode";
import { LS } from "../Utils/Resuse";

export default function LoginPage() {
  const navigate = useNavigate();
  const { SetStatedata } = Authdata();

  // Only fetch IP info, do not use credentialResponse here
  const getIpInfo = async () => {
    try {
      // Example: fetch public IP from an API
      const publicIpRes = await fetch("https://api64.ipify.org?format=json");
      const publicIpData = await publicIpRes.json();
      // For local IP, you may use a placeholder or a library if needed
      return { publicIp: publicIpData.ip, localIp: null };
    } catch (err) {
      console.error("Error fetching IP info:", err);
      return { publicIp: null, localIp: null };
    }
  }
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

    // Call backend - this will throw an error if user is not authorized
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
      toast.success("Welcome Admin!");
      navigate("/admin/time", {
        state: { userid: res._id || res.id, token: res.access_token },
      });
    } else if (loggedIn && !isAdmin) {
      toast.success("Welcome!");
      navigate("/User/Clockin_int", {
        state: { userid: res._id || res.id, token: res.access_token },
      });
    } else {
      toast.error("Login failed. Please contact administrator.");
    }
  } catch (err) {
    console.error("Login error:", err);
    // Ensure a toast is shown in the UI for denied access or other login errors
    try {
      const raw = (err && err.response && err.response.data && err.response.data.detail) || (err && err.message) || "Login failed. Contact admin.";
      const concise = raw && raw.length > 60 ? raw.split('.').slice(0,1).join('.') : raw;
      // Show a concise toast for denied access
      toast.error(concise || "Access denied. Contact admin.", { autoClose: 4000, position: 'top-right' });
    } catch (e) {
      toast.error("Access denied. Contact admin.", { autoClose: 4000, position: 'top-right' });
    }
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
  //             <GoogleOAuthProvider clientId="152946581457-15hbl22a667fe0le1mkt5e6d14kisrtd.apps.googleusercontent.com">
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
      <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-sm">
        <div className="flex flex-col items-center justify-center p-8">
          <img src={logo} alt="Company Logo" className="h-32 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-700 mb-6">Welcome to E-Connect</h1>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin onSuccess={handleGoogleLogin} />
          </GoogleOAuthProvider>
        </div>
      </div>
    </div>
  );
}
