import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login, checkToken } from "../../https/index"; // checkToken ham qo'shildi
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isTokenRequired, setIsTokenRequired] = useState(false);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTokenChange = (e) => {
    setToken(e.target.value);
  };

  const clearAccessToken = () => {
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  const loginMutation = useMutation({
    mutationFn: (reqData) => login(reqData),
    onSuccess: async (res) => {

      if (res.data.data.status === false) {
        setIsTokenRequired(true);
        clearAccessToken();
      } else if (res.data.data.status === true) {
        localStorage.setItem("authToken", res.data.data.token);
        navigate("/");
      }
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Login failed", { variant: "error" });
    },
  });

  const tokenMutation = useMutation({
    mutationFn: (reqData) => checkToken(reqData), // ✅ API chaqiruvi index.js dan olinmoqda
    onSuccess: (res) => {
      console.log("Token verification response:", res.data);

      if (res.status === 200) {
        localStorage.setItem("authToken", res.data.token);
        navigate("/");
      }
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Invalid token", { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isTokenRequired) {
      tokenMutation.mutate({ email: formData.email, token });
    } else {
      loginMutation.mutate(formData);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
            Employee Email
          </label>
          <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter employee email"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
            Password
          </label>
          <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
            />
          </div>
        </div>
        {isTokenRequired && (
          <div>
            <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
              Enter Verification Token
            </label>
            <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
              <input
                type="text"
                value={token}
                onChange={handleTokenChange}
                placeholder="Enter token"
                className="bg-transparent flex-1 text-white focus:outline-none"
                required
              />
            </div>
          </div>
        )}
        <button
          type="submit"
          className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold"
        >
          {isTokenRequired ? "Verify Token" : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default Login;
