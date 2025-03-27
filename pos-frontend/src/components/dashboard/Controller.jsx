import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCategory, deleteDish, deleteTable, getCategories, getProducts, getTables } from "../../https/index";
import { enqueueSnackbar } from "notistack";

export const Controller = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [activeTab, setActiveTab] = useState("tables");

  // Fetch data
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const { data: tables = [] } = useQuery({ queryKey: ["tables"], queryFn: getTables });

  // Mutations
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      enqueueSnackbar("Category deleted successfully!", { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
    },
  });

  const deleteDishMutation = useMutation({
    mutationFn: deleteDish,
    onSuccess: () => {
      enqueueSnackbar("Dish deleted successfully!", { variant: "success" });
      queryClient.invalidateQueries(["products"]);
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      enqueueSnackbar("Table deleted successfully!", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
    },
  });

  // Modal control
  const handleOpenModal = (type, id) => {
    setDeleteType(type);
    setDeleteId(id);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteType === "category") deleteCategoryMutation.mutate(deleteId);
    else if (deleteType === "product") deleteDishMutation.mutate(deleteId);
    else if (deleteType === "table") deleteTableMutation.mutate(deleteId);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">Manage Data</h2>
      <div className="flex gap-4 mb-4">
        {['tables', 'categories', 'dishes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-[#262626]' : 'bg-[#1a1a1a]'} text-white`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tables */}
      {activeTab === "tables" && (
        <ul>
          {tables.map((table) => (
            <li key={table._id} className="flex justify-between bg-[#262626] p-3 mb-2 rounded-lg">
              <span className="text-white">Table {table.tableNo} - {table.seats} seats</span>
              <button onClick={() => handleOpenModal("table", table._id)} className="bg-red-600 px-3 py-1 rounded text-white">Delete</button>
            </li>
          ))}
        </ul>
      )}

      {/* Categories */}
      {activeTab === "categories" && (
        <ul>
          {categories.map((category) => (
            <li key={category._id} className="flex justify-between bg-[#262626] p-3 mb-2 rounded-lg">
              <span className="text-white">{category.name}</span>
              <button onClick={() => handleOpenModal("category", category._id)} className="bg-red-600 px-3 py-1 rounded text-white">Delete</button>
            </li>
          ))}
        </ul>
      )}

      {/* Dishes */}
      {activeTab === "dishes" && (
        <ul>
          {products.map((product) => (
            <li key={product._id} className="flex justify-between bg-[#262626] p-3 mb-2 rounded-lg">
              <span className="text-white">{product.name} - ${product.price}</span>
              <button onClick={() => handleOpenModal("product", product._id)} className="bg-red-600 px-3 py-1 rounded text-white">Delete</button>
            </li>
          ))}
        </ul>
      )}

      {/* Confirm Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#1f1f1f] p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-white text-lg mb-4">Are you sure you want to delete this {deleteType}?</h3>
            <div className="flex justify-center gap-4">
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-500 px-4 py-2 rounded text-white">Cancel</button>
              <button onClick={handleDelete} className="bg-red-600 px-4 py-2 rounded text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
