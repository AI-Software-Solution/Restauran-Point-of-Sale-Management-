import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import logo from "../../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOut } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { logout, updateUserData, deleteUserData } from "../../https";
import { removeUser, setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import Modal from "../shared/Modal"; 

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState(userData.name || "");

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      dispatch(removeUser());
      navigate("/auth");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: () => updateUserData({ name: newName }),
    onSuccess: (updatedUser) => {
      dispatch(setUser(updatedUser));
      setIsModalOpen(false);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: () => deleteUserData(),
    onSuccess: () => {
      dispatch(removeUser());
      navigate("/auth");
    },
  });

  const handleLogout = () => logoutMutation.mutate();
  const handleUpdate = () => updateUserMutation.mutate();
  const handleDelete = () => {
    if (window.confirm("Haqiqatan ham hisobingizni o‘chirmoqchimisiz?")) {
      deleteUserMutation.mutate();
    }
  };

  return (
    <>
      <header className="flex justify-between items-center py-4 px-8 bg-[#1a1a1a]">
        <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
          <img src={logo} className="h-8 w-8" alt="restro logo" />
          <h1 className="text-lg font-semibold text-[#f5f5f5] tracking-wide">Bobur Mirzo</h1>
        </div>

        <div className="flex items-center gap-4">
          {userData.role === "Admin" && (
            <div onClick={() => navigate("/dashboard")} className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer">
              <MdDashboard className="text-[#f5f5f5] text-2xl" />
            </div>
          )}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <FaUserCircle className="text-[#f5f5f5] text-4xl" />
            <div className="flex flex-col items-start">
              <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
                {userData.name || "TEST USER"}
              </h1>
              <p className="text-xs text-[#ababab] font-medium">
                {userData.role || "Role"}
              </p>
            </div>
            <IoLogOut onClick={handleLogout} className="text-[#f5f5f5] ml-2" size={40} />
          </div>
        </div>
      </header>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Profile Settings">
        <div>
          <label className="block text-[#ababab] mb-2 text-sm font-medium">New Name</label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              type="text"
              placeholder="Enter new name"
              className="bg-transparent flex-1 text-white focus:outline-none"
            />
          </div>
        </div>
        <button onClick={handleUpdate} className="w-full bg-[#F6B100] text-[#f5f5f5] rounded-lg py-3 mt-4 hover:bg-yellow-700">
          Save Changes
        </button>
        <button onClick={handleDelete} className="w-full bg-red-600 text-[#f5f5f5] rounded-lg py-3 mt-2 hover:bg-red-800">
          Delete Account
        </button>
      </Modal>
    </>
  );
};

export default Header;
