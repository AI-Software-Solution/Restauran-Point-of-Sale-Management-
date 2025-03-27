import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";

const Modal = ({ title, closeModal, inputFields, submitFunction }) => {
  const [formData, setFormData] = useState(
    inputFields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  );

  // Input o'zgarishlarini olish
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Formani yuborish
  const handleSubmit = (e) => {
    e.preventDefault();
    submitFunction.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[#262626] p-6 rounded-lg shadow-lg w-96"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#f5f5f5] text-xl font-semibold">{title}</h2>
          <button
            onClick={closeModal}
            className="text-[#f5f5f5] hover:text-red-500"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-10">
          {inputFields.map((field) => (
            <div key={field.name}>
              <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                {field.label}
              </label>
              <div className="flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    className="bg-transparent flex-1 text-white focus:outline-none"
                    required
                  >
                    <option value="" className="text-white p-5 px-4 bg-[#1f1f1f]">
                      Select {field.label}
                    </option>
                    {field.options.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="text-white p-5 px-4 bg-[#1f1f1f]"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    className="bg-transparent flex-1 text-white focus:outline-none"
                    required
                  />
                )}
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full rounded-lg mt-10 mb-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold"
          >
            {title}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Modal;
