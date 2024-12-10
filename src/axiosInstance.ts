import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_BOARDPREP_API
      : "http://20.189.73.26:8000",
  withCredentials: true,
});

export default axiosInstance;
