import axios from "axios";

const api = axios.create({
  baseURL: "https://fuelbilling.svg.lk/api",
});

export default api;
