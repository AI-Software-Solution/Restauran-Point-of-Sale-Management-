import React, { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar, MdRestaurant, MdTakeoutDining, MdAdminPanelSettings } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "./Modal";
import { useDispatch } from "react-redux";
import { setCustomer, setOrderType } from "../../redux/slices/customerSlice";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Modal states
  const [orderTypeModalOpen, setOrderTypeModalOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      try {
        const parsedToken = JSON.parse(atob(authToken.split(".")[1]));
        if (parsedToken.role === "Admin") {
          setIsAdmin(true);
        }
      } catch {
        // Invalid token format - ignore
      }
    }
  }, []);

  const openOrderTypeModal = () => setOrderTypeModalOpen(true);
  const closeOrderTypeModal = () => setOrderTypeModalOpen(false);
  const closePhoneModal = () => {
    setPhoneModalOpen(false);
    setPhone("");
  };

  const isActive = (path) => location.pathname === path;

  // Dine-in tanlanganda
  const handleDineIn = () => {
    dispatch(setOrderType("dine-in"));
    closeOrderTypeModal();
    navigate("/tables");
  };

  // Olib ketish tanlanganda - telefon so'rash
  const handleTakeawaySelect = () => {
    closeOrderTypeModal();
    setPhoneModalOpen(true);
  };

  // Telefon kiritilgandan keyin
  const handleTakeawayConfirm = () => {
    dispatch(setCustomer({ phone, orderType: "takeaway" }));
    closePhoneModal();
    navigate("/menu");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#262626] p-1 sm:p-2 h-14 sm:h-16 flex justify-around gap-1">
      <button
        onClick={() => navigate("/home")}
        className={`flex items-center justify-center font-bold text-xs sm:text-base ${
          isActive("/home") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        } flex-1 max-w-[200px] sm:max-w-[300px] rounded-[15px] sm:rounded-[20px] px-2 sm:px-4`}
      >
        <FaHome className="inline mr-1 sm:mr-2" size={18} /> <p className="hidden sm:inline">Home</p>
      </button>
      <button
        onClick={() => navigate("/orders")}
        className={`flex items-center justify-center font-bold text-xs sm:text-base ${
          isActive("/orders") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        } flex-1 max-w-[200px] sm:max-w-[300px] rounded-[15px] sm:rounded-[20px] px-2 sm:px-4`}
      >
        <MdOutlineReorder className="inline mr-1 sm:mr-2" size={18} /> <p className="hidden sm:inline">Orders</p>
      </button>
      <button
        onClick={() => navigate("/tables")}
        className={`flex items-center justify-center font-bold text-xs sm:text-base ${
          isActive("/tables") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        } flex-1 max-w-[200px] sm:max-w-[300px] rounded-[15px] sm:rounded-[20px] px-2 sm:px-4`}
      >
        <MdTableBar className="inline mr-1 sm:mr-2" size={18} /> <p className="hidden sm:inline">Tables</p>
      </button>

      <button
        onClick={() => navigate("/admin-pro")}
        className={`flex items-center justify-center font-bold text-xs sm:text-base ${
          isActive("/admin-pro")
            ? "text-[#f5f5f5] bg-[#343434]"
            : "text-[#ababab]"
        } flex-1 max-w-[200px] sm:max-w-[300px] rounded-[15px] sm:rounded-[20px] px-2 sm:px-4`}
      >
        <MdAdminPanelSettings className="inline mr-1 sm:mr-2" size={18} /> <p className="hidden sm:inline">Admin</p>
      </button>

      {/* New Order Button */}
      <button
        disabled={isActive("/tables") || isActive("/menu")}
        onClick={openOrderTypeModal}
        className="absolute bottom-16 sm:bottom-20 left-3 sm:left-6 bg-[#F6B100] text-[#f5f5f5] rounded-full p-3 sm:p-4 flex items-center hover:bg-yellow-600 transition-colors disabled:opacity-50 shadow-lg"
      >
        <BiSolidDish size={30} className="sm:w-10 sm:h-10" />
      </button>

      {/* Order Type Selection Modal */}
      <Modal
        isOpen={orderTypeModalOpen}
        onClose={closeOrderTypeModal}
        title="Buyurtma turi"
      >
        <p className="text-[#ababab] text-sm mb-4 text-center">
          Buyurtma turini tanlang
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Dine-in Button */}
          <button
            onClick={handleDineIn}
            className="flex-1 bg-[#1f1f1f] hover:bg-[#2a2a2a] border-2 border-transparent hover:border-[#F6B100] rounded-xl p-4 sm:p-6 flex flex-col items-center gap-2 sm:gap-3 transition-all"
          >
            <MdRestaurant className="text-[#F6B100]" size={36} />
            <span className="text-white font-semibold text-base sm:text-lg">Dine-in</span>
            <span className="text-[#ababab] text-xs">Stolda ovqatlanish</span>
          </button>

          {/* Takeaway Button */}
          <button
            onClick={handleTakeawaySelect}
            className="flex-1 bg-[#1f1f1f] hover:bg-[#2a2a2a] border-2 border-transparent hover:border-[#F6B100] rounded-xl p-4 sm:p-6 flex flex-col items-center gap-2 sm:gap-3 transition-all"
          >
            <MdTakeoutDining className="text-[#22c55e]" size={36} />
            <span className="text-white font-semibold text-base sm:text-lg">Olib ketish</span>
            <span className="text-[#ababab] text-xs">Takeaway</span>
          </button>
        </div>
      </Modal>

      {/* Phone Number Modal (for Takeaway) */}
      <Modal
        isOpen={phoneModalOpen}
        onClose={closePhoneModal}
        title="Olib ketish - Telefon"
      >
        <p className="text-[#ababab] text-sm mb-4">
          Buyurtmani olish uchun telefon raqamingizni kiriting
        </p>
        <div>
          <label className="block text-[#ababab] mb-2 text-sm font-medium">
            Telefon raqami
          </label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
            <span className="text-[#ababab] mr-2">+998</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="90 123 45 67"
              className="bg-transparent flex-1 text-white focus:outline-none"
              autoFocus
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={closePhoneModal}
            className="flex-1 bg-[#3a3a3a] text-[#f5f5f5] rounded-lg py-3 hover:bg-[#4a4a4a]"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleTakeawayConfirm}
            disabled={!phone || phone.length < 9}
            className="flex-1 bg-[#F6B100] text-[#f5f5f5] rounded-lg py-3 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Davom etish
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BottomNav;
