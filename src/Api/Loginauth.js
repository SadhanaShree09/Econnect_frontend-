import { comma } from "postcss/lib/list";
import { Baseaxios, LS } from "../Utils/Resuse";
import { toast } from "react-hot-toast";
export const Apisignup = async ({ email, password, name }) => {
  const response = await Baseaxios.post("/signup", {
    email: email,
    password: password,
    name: name,
  }).catch((err) => {
    const a = err.response.data.detail;
    toast.error(a);
    throw new Error(a);
  });

  const Comp = response.data;
  LS.save("userid", Comp.userid);
  LS.save("name", Comp.name);
  LS.save("email", Comp.email)
  LS.save("access_token", Comp.access_token);
  LS.save("id", Comp.id)
  LS.save("Auth", true);
  // LS.save("isManager",)

  return Comp;
};

export const Apisignin = async ({ client_name, email }) => {
  const response = await Baseaxios.post("/Gsignin", {
    client_name: client_name,
    email: email,
  }).catch((err) => {
    const a = err.response.data.detail;
    toast.error(a);
    throw new Error(a);
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

  toast.success("Login Successfully");
  return Comp;
};