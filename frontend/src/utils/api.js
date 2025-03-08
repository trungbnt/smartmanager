// Xóa các interceptors log
axios.interceptors.request.use(
    (config) => {
        // Xóa console.log về request
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => {
        // Xóa console.log về response
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
); 