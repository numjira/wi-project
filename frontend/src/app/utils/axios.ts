import axios,{AxiosRequestConfig} from "axios";
import environment from "@/app/utils/environment";

const axiosInstance = axios.create({
  baseURL: environment.API_URL,
});

axiosInstance.interceptors.request.use((config: any) => {
  config.headers = {
    ...config.headers,
    Authorization:"xxx",
    "X-API-Key": environment.API_KEY,
  };
  return config;
});

axiosInstance.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    switch (error?.response?.status) {
      default:
        console.log(error.message);
        break;
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;