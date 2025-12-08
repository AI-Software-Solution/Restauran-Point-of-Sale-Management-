import { useDispatch } from "react-redux";
import { getUserData } from "../https";
import { useEffect, useState } from "react";
import { removeUser, setUser } from "../redux/slices/userSlice";
import { useLocation } from "react-router-dom";

const useLoadData = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // Token mavjudligini avval tekshirish
      const token = localStorage.getItem("authToken");
      if (!token) {
        dispatch(removeUser());
        setIsLoading(false);
        return;
      }

      try {
        const response = await getUserData();

        // Response strukturasini tekshirish (304 va boshqa holatlar uchun)
        if (response?.data?.data) {
          const { _id, name, email, phone, role } = response.data.data;
          dispatch(setUser({ _id, name, email, phone, role }));
        } else if (response?.data?.success && response?.data) {
          // Alternative response structure
          const userData = response.data.data || response.data;
          if (userData._id || userData.id) {
            dispatch(setUser({
              _id: userData._id || userData.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              role: userData.role
            }));
          } else {
            console.warn("Invalid user data structure:", response);
            dispatch(removeUser());
          }
        } else {
          console.warn("Invalid user data response:", response);
          dispatch(removeUser());
        }
      } catch (error) {
        console.error("Auth check failed:", error?.message || error);
        // 401 da token tozalash
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
        }
        dispatch(removeUser());
        // Don't redirect - let ProtectedRoutes handle it
        // Landing page "/" should be accessible without auth
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [dispatch, location.pathname]);

  return isLoading;
};

export default useLoadData;
