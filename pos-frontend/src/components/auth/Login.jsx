import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isTokenRequired, setIsTokenRequired] = useState(false);
  const [token, setToken] = useState("");
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTokenChange = (e) => {
    setToken(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const loginMutation = useMutation({
    mutationFn: (reqData) => login(reqData),
    onSuccess: (res) => {
      if (res.status === 200) {
        if (res.data.status === false) {
          setIsTokenRequired(true);
        }else(
          navigate("/")
        )
      }
    },
    onError: (error) => {
      enqueueSnackbar(error.response.data.message, { variant: "error" });
    },
  });

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
        <button type="submit" className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold">
          Sign in
        </button>
      </form>
    </div>
  );
};

export default Login;
