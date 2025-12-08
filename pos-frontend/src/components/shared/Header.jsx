import React, { useState } from "react";
import { FaUserCircle, FaHome } from "react-icons/fa";
import logo from "../../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOut } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { logout, updateUserData, deleteUserData } from "../../https";
import { removeUser, setUser } from "../../redux/slices/userSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { MdDashboard, MdOutlineReorder, MdTableBar, MdRestaurantMenu, MdOutdoorGrill } from "react-icons/md";
import { TbChartAreaLineFilled } from "react-icons/tb";
import { RiPagesLine } from "react-icons/ri";
import { FiPackage, FiLayers, FiShield, FiTrendingUp, FiLink, FiSettings } from "react-icons/fi";
import Modal from "../shared/Modal";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState(userData.name || "");

  // Check if current route is active
  const isActive = (path) => location.pathname === path;

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
      <header className="flex justify-between items-center py-2 sm:py-4 px-3 sm:px-4 lg:px-8 bg-[#1a1a1a]">
        <div onClick={() => navigate("/home")} className="flex items-center gap-2 cursor-pointer flex-shrink-0">
          <img src={logo} className="h-6 w-6 sm:h-8 sm:w-8" alt="restro logo" />
          <h1 className="hidden sm:block text-lg font-semibold text-[#f5f5f5] tracking-wide">Bobur Mirzo</h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 overflow-x-auto scrollbar-hide">
          {/* POS Navigation - barcha rollar uchun */}
          <div className="flex items-center gap-1 sm:gap-2 mr-2 lg:mr-4 border-r border-[#3a3a3a] pr-2 lg:pr-4 flex-shrink-0">
            <div
              onClick={() => navigate("/home")}
              className={`rounded-[10px] sm:rounded-[15px] p-2 sm:p-3 cursor-pointer transition-colors ${isActive('/home') ? 'bg-[#F6B100]' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a]'}`}
              title="Bosh sahifa"
            >
              <FaHome className={`text-lg sm:text-2xl ${isActive('/home') ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'}`} />
            </div>
            <div
              onClick={() => navigate("/orders")}
              className={`rounded-[10px] sm:rounded-[15px] p-2 sm:p-3 cursor-pointer transition-colors ${isActive('/orders') ? 'bg-[#F6B100]' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a]'}`}
              title="Buyurtmalar"
            >
              <MdOutlineReorder className={`text-lg sm:text-2xl ${isActive('/orders') ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'}`} />
            </div>
            <div
              onClick={() => navigate("/tables")}
              className={`rounded-[10px] sm:rounded-[15px] p-2 sm:p-3 cursor-pointer transition-colors ${isActive('/tables') ? 'bg-[#F6B100]' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a]'}`}
              title="Stollar"
            >
              <MdTableBar className={`text-lg sm:text-2xl ${isActive('/tables') ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'}`} />
            </div>
            <div
              onClick={() => navigate("/menu")}
              className={`rounded-[10px] sm:rounded-[15px] p-2 sm:p-3 cursor-pointer transition-colors ${isActive('/menu') ? 'bg-[#F6B100]' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a]'}`}
              title="Menyu"
            >
              <MdRestaurantMenu className={`text-lg sm:text-2xl ${isActive('/menu') ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'}`} />
            </div>
            <div
              onClick={() => navigate("/kitchen")}
              className={`hidden sm:block rounded-[10px] sm:rounded-[15px] p-2 sm:p-3 cursor-pointer transition-colors ${isActive('/kitchen') ? 'bg-[#F6B100]' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a]'}`}
              title="Oshxona Display (KDS)"
            >
              <MdOutdoorGrill className={`text-lg sm:text-2xl ${isActive('/kitchen') ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'}`} />
            </div>
          </div>

          {/* Admin Navigation - faqat Admin uchun (hidden on mobile) */}
          {userData.role === "Admin" && (
            <div className="hidden md:flex items-center gap-1 lg:gap-2 flex-shrink-0">
              <div onClick={() => navigate("/cms")} className={`rounded-[10px] sm:rounded-[15px] p-2 sm:p-3 cursor-pointer transition-colors ${isActive('/cms') ? 'bg-[#F6B100]' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a]'}`} title="Landing CMS">
                <RiPagesLine className={`text-lg sm:text-2xl ${isActive('/cms') ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'}`} />
              </div>
              <div onClick={() => navigate("/inventory")} className={`rounded-[10px] sm:rounded-[15px] p-2 sm:p-3 cursor-pointer transition-colors ${isActive('/inventory') ? 'bg-[#F6B100]' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a]'}`} title="Ombor">
                <FiPackage className={`text-lg sm:text-2xl ${isActive('/inventory') ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'}`} />
              </div>
              <div onClick={() => navigate("/floor-plan")} className={`hidden lg:block rounded-[15px] p-3 cursor-pointer transition-colors ${isActive('/floor-plan') ? 'bg-[#F6B100]' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a]'}`} title="Floor Plan">
                <FiLayers className={`text-2xl ${isActive('/floor-plan') ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'}`} />
              </div>
              <div onClick={() => navigate("/dashboard")} className={`rounded-[10px] sm:rounded-[15px] p-2 sm:p-3 cursor-pointer transition-colors ${isActive('/dashboard') ? 'bg-[#F6B100]' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a]'}`} title="Dashboard">
                <MdDashboard className={`text-lg sm:text-2xl ${isActive('/dashboard') ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'}`} />
              </div>
              <div onClick={() => navigate("/admin-pro")} className={`rounded-[10px] sm:rounded-[15px] p-2 sm:p-3 cursor-pointer transition-colors ${isActive('/admin-pro') ? 'bg-[#F6B100]' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a]'}`} title="Admin Panel Pro">
                <FiShield className={`text-lg sm:text-2xl ${isActive('/admin-pro') ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'}`} />
              </div>
              <div onClick={() => navigate("/analytics")} className={`hidden lg:block rounded-[15px] p-3 cursor-pointer transition-colors ${isActive('/analytics') ? 'bg-[#F6B100]' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a]'}`} title="AI Analytics">
                <FiTrendingUp className={`text-2xl ${isActive('/analytics') ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'}`} />
              </div>
              <div onClick={() => navigate("/integrations")} className={`hidden xl:block rounded-[15px] p-3 cursor-pointer transition-colors ${isActive('/integrations') ? 'bg-[#F6B100]' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a]'}`} title="Integratsiyalar">
                <FiLink className={`text-2xl ${isActive('/integrations') ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'}`} />
              </div>
              <div onClick={() => navigate("/bi-dashboard")} className={`hidden xl:block rounded-[15px] p-3 cursor-pointer transition-colors ${isActive('/bi-dashboard') ? 'bg-[#F6B100]' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a]'}`} title="BI Dashboard (AI)">
                <TbChartAreaLineFilled className={`text-2xl ${isActive('/bi-dashboard') ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'}`} />
              </div>
            </div>
          )}
          <div onClick={() => navigate("/settings")} className={`rounded-[10px] sm:rounded-[15px] p-2 sm:p-3 cursor-pointer transition-colors flex-shrink-0 ${isActive('/settings') ? 'bg-[#F6B100]' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a]'}`} title="Sozlamalar">
            <FiSettings className={`text-lg sm:text-2xl ${isActive('/settings') ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'}`} />
          </div>
          <div className="flex items-center gap-1 sm:gap-3 cursor-pointer flex-shrink-0">
            <FaUserCircle className="text-[#f5f5f5] text-2xl sm:text-4xl" />
            <div className="hidden sm:flex flex-col items-start" onClick={() => setIsModalOpen(true)}>
              <h1 className="text-sm sm:text-md text-[#f5f5f5] font-semibold tracking-wide">
                {userData.name || "TEST USER"}
              </h1>
              <p className="text-xs text-[#ababab] font-medium">
                {userData.role || "Role"}
              </p>
            </div>
            <IoLogOut onClick={handleLogout} className="text-[#f5f5f5] ml-1 sm:ml-2" size={28} />
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
