import React, { useState, useEffect } from "react";
import { MdTableBar, MdCategory } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import Modal from "../components/dashboard/Modal";
import { addCategory, addTable, addDish } from "../https/index"; // ✅ API chaqirish
import { Controller } from "../components/dashboard/Controller";

const buttons = [
  { label: "Add Table", icon: <MdTableBar />, action: "table" },
  { label: "Add Category", icon: <MdCategory />, action: "category" },
  { label: "Add Dishes", icon: <BiSolidDish />, action: "dishes" },
];

const tabs = ["Metrics", "Orders", "Controller"];

const Dashboard = () => {
  useEffect(() => {
    document.title = "POS | Admin Dashboard";
  }, []);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDishesModalOpen, setIsDishesModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Metrics");

  // 🔹 Kategoriyalarni olish
  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("http://localhost:4000/api/category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // 🔹 Modal ochish funktsiyasi
  const handleOpenModal = (action) => {
    if (action === "table") setIsTableModalOpen(true);
    if (action === "category") setIsCategoryModalOpen(true);
    if (action === "dishes") setIsDishesModalOpen(true);
  };

  // 🔹 Stol qo‘shish
  const addTableMutation = useMutation({
    mutationFn: addTable, // ✅ `https/index.js` dagi API
    onSuccess: () => {
      enqueueSnackbar("Table added successfully!", { variant: "success" });
      setIsTableModalOpen(false);
    },
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: "error" });
    },
  });

  // 🔹 Kategoriya qo‘shish
  const addCategoryMutation = useMutation({
    mutationFn: addCategory, // ✅ `https/index.js` dagi API
    onSuccess: () => {
      enqueueSnackbar("Category added successfully!", { variant: "success" });
      setIsCategoryModalOpen(false);
      refetchCategories();
    },
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: "error" });
    },
  });

  // 🔹 Ovqat qo‘shish
  const addDishMutation = useMutation({
    mutationFn: addDish, // ✅ `https/index.js` dagi API
    onSuccess: () => {
      enqueueSnackbar("Dish added successfully!", { variant: "success" });
      setIsDishesModalOpen(false);
    },
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: "error" });
    },
  });

  return (
    <div className="bg-[#1f1f1f] h-[calc(100vh-5rem)]">
      <div className="container mx-auto flex items-center justify-between py-14 px-6 md:px-4">
        <div className="flex items-center gap-3">
          {buttons.map(({ label, icon, action }) => (
            <button
              key={action}
              onClick={() => handleOpenModal(action)}
              className="bg-[#1a1a1a] hover:bg-[#262626] px-8 py-3 rounded-lg text-[#f5f5f5] font-semibold text-md flex items-center gap-2"
            >
              {label} {icon}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-8 py-3 rounded-lg text-[#f5f5f5] font-semibold text-md flex items-center gap-2 ${
                activeTab === tab ? "bg-[#262626]" : "bg-[#1a1a1a] hover:bg-[#262626]"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Metrics" && <Metrics />}
      {activeTab === "Orders" && <RecentOrders />}
      {activeTab === "Controller" && <Controller />}

      {/* Table qo'shish modal */}
      {isTableModalOpen && (
        <Modal
          title="Add Table"
          closeModal={() => setIsTableModalOpen(false)}
          inputFields={[
            { name: "tableNumber", label: "Table Number", type: "number" },
            { name: "seatNumber", label: "Seat Number", type: "number" },
          ]}
          submitFunction={addTableMutation}
        />
      )}

      {/* Category qo'shish modal */}
      {isCategoryModalOpen && (
        <Modal
          title="Add Category"
          closeModal={() => setIsCategoryModalOpen(false)}
          inputFields={[{ name: "name", label: "Category Name" }]}
          submitFunction={addCategoryMutation}
        />
      )}

      {/* Dish qo'shish modal */}
      {isDishesModalOpen && (
        <Modal
          title="Add Dishes"
          closeModal={() => setIsDishesModalOpen(false)}
          inputFields={[
            { name: "name", label: "Dish Name" },
            { name: "price", label: "Price", type: "number" },
            {
              name: "category",
              label: "Category",
              type: "select",
              options: categories.map((cat) => ({ label: cat.name, value: cat._id })),
            },
          ]}
          submitFunction={addDishMutation}
        />
      )}
    </div>
  );
};

export default Dashboard;
