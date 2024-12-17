import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "https://20.189.73.26:8000",
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
});

export default axiosInstance;
