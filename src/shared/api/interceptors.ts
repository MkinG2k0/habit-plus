import axios from "axios";

export const $api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

$api.interceptors.request.use((config) => {
  // const token = useUserStore.getState().accessToken;
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

$api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      try {
        // const originalRequest = error.config || {};
        // const { data: newToken } = await refreshTokensRequest();
        // if (newToken) {
        //   useUserStore.getState().setAccessToken(newToken);
        //   originalRequest.headers.Authorization = `Bearer ${newToken}`;
        //   return $api(originalRequest);
        // }
        return Promise.reject(error);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  },
);
