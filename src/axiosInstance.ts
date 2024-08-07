import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_BOARDPREP_API
      : "http://127.0.0.1:8000",
  withCredentials: true,
});

export default axiosInstance;
