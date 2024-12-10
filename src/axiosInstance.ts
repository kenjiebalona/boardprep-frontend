import axios from "axios";

console.log("Environment:", process.env.NODE_ENV);
console.log(
  "API Base URL:",
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_BOARDPREP_API
    : "http://20.189.73.26:8000"
);

const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_BOARDPREP_API
      : "http://20.189.73.26:8000",
  withCredentials: true,
});

export default axiosInstance;
