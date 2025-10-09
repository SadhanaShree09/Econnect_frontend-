import { comma } from "postcss/lib/list";
import { Baseaxios, LS } from "../Utils/Resuse";
import { toast } from "react-toastify";
export const Apisignup = async ({ email, password, name }) => {
  try {
    const response = await Baseaxios.post("/signup", {
      email: email,
      password: password,
      name: name,
    });

    const Comp = response.data;
    LS.save("userid", Comp.userid);
    LS.save("name", Comp.name);
    LS.save("email", Comp.email)
    LS.save("access_token", Comp.access_token);
    LS.save("id", Comp.id)
    LS.save("Auth", true);

    return Comp;
  } catch (err) {
    // Handle authorization errors
    if (err.response) {
      const errorDetail = err.response.data.detail;
      
      // Check if it's an authorization error (403)
      if (err.response.status === 403) {
        toast.error(errorDetail || "Self-registration is disabled. Please contact administrator.");
      } else {
        toast.error(errorDetail || "Signup failed. Please try again.");
      }
    } else {
      toast.error("Network error. Please check your connection.");
    }
    throw new Error(err.response?.data?.detail || "Signup failed");
  }
};

export const Apisignin = async ({ client_name, email }) => {
  try {
    const response = await Baseaxios.post("https://econnectbackend-production.up.railway.app/Gsignin", {
      client_name: client_name,
      email: email,
    });
    
    const Comp = response.data;
    LS.save("name", Comp.name);
    LS.save("email", Comp.email);
    LS.save("userid", Comp.userid);
    LS.save("position",Comp.position);
    LS.save("department",Comp.department);
    LS.save("personal_email",Comp.personal_email);
    LS.save("date_of_joining",Comp.date_of_joining);
    LS.save("address",Comp.address);
    LS.save("education",Comp.education);
    LS.save("TL",Comp.TL);
    LS.save("personal_email",Comp.personal_email)
    LS.save("phone",Comp.phone);
    LS.save("resume_link",Comp.resume_link);
    LS.save("skills",Comp.skills);
    LS.save("access_token", Comp.access_token);
    LS.save("id", Comp.id);
    LS.save("status",Comp.status);
    LS.save("Auth", true);
    LS.save("isadmin", Comp.isadmin);
    LS.save("isloggedin", Comp.isloggedin);

    //toast.success("Login Successfully");
    return Comp;
  } catch (err) {
    // Handle authorization errors specially
    if (err.response) {
      const errorDetail = err.response.data.detail;
      
      // Check if it's an authorization error (403)
      if (err.response.status === 403) {
        toast.error(errorDetail || "Access denied. Please contact administrator.");
      } else {
        toast.error(errorDetail || "Login failed. Please try again.");
      }
    } else {
      toast.error("Network error. Please check your connection.");
    }
    throw new Error(err.response?.data?.detail || "Login failed");
  }
};