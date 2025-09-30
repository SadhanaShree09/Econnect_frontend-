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

// FORCE HTTPS - Production fix for Mixed Content Error
const envUrl = import.meta.env.VITE_HOST_IP;
const defaultUrl = "https://econnectbackend-production.up.railway.app";

// Ensure HTTPS protocol regardless of environment variable value
export const ipadr = envUrl ? envUrl.replace(/^http:/, "https:") : defaultUrl;

console.log("API Base URL (Production Safe):", ipadr);
console.log("Original Env Value:", envUrl);

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
  baseURL: `${ipadr}/`,
  headers: { Authorization: `Bearer ${LS.get("access_token")}` },
});