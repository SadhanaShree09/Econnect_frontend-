// import localstorageEncrypt from "localstorage-encrypt";
// import axios from "axios";
// var ip = import.meta.env.BACKEND_HOST || "localhost";
// var host = import.meta.env.BACKEND_PORT || "8000";
// export const LS = localstorageEncrypt.init("Quillbot", "RGBQUILLBOT");
// export const Baseaxios = axios.create({
//   baseURL: `https://${ip}:${host}/`,
//   headers: { Authorization: `Bearer ${LS.get("access_token")}` },
// });

import localstorageEncrypt from "localstorage-encrypt";
import axios from "axios";
var ip = import.meta.env.VITE_BACKEND_HOST 
var host = import.meta.env.VITE_BACKEND_PORT 

//export const ipadr=import.meta.env.VITE_HOST_IP;
export const ipadr = import.meta.env.VITE_HOST_IP;
console.log(import.meta.env.VITE_HOST_IP); // Debugging step
console.log("j",import.meta.env.VITE_BACKEND_HOST)
console.log("a",import.meta.env.VITE_BACKEND_PORT)
export const LS = {
  save: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  get: (key) => {
    const val = localStorage.getItem(key);
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  },
  remove: (key) => localStorage.removeItem(key),
};

export const Baseaxios = axios.create({
  baseURL: `${ip}:${host}/`,
  headers: { Authorization: `Bearer ${LS.get("access_token")}` },
});