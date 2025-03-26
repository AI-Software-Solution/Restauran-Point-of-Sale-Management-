import React, { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";
import { getCategories, getProducts } from "../../https/index"; // ✅ API chaqirish

const MenuContainer = () => {
  const [products, setProducts] = useState([]); // Mahsulotlar
  const [categories, setCategories] = useState([]); // Kategoriyalar
  const [selectedCategory, setSelectedCategory] = useState(null); // Tanlangan kategoriya
  const [itemCount, setItemCount] = useState(0);
  const [itemId, setItemId] = useState();
  const dispatch = useDispatch();

  // 🔹 Kategoriyalarni API dan olish
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories(); // ✅ API chaqirish

        if (Array.isArray(data)) {
          setCategories(data);
          setSelectedCategory(data[0] || null); // Birinchi kategoriyani tanlash
        } else {
          setCategories([]);
        }
      } catch (error) {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // 🔹 Mahsulotlarni API dan olish
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts(); // ✅ API chaqirish

        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const increment = (id) => {
    setItemId(id);
    if (itemCount >= 4) return;
    setItemCount((prev) => prev + 1);
  };

  const decrement = (id) => {
    setItemId(id);
    if (itemCount <= 0) return;
    setItemCount((prev) => prev - 1);
  };

  const handleAddToCart = (item) => {
    if (itemCount === 0) return;

    const { name, price } = item;
    const newObj = {
      id: new Date(),
      name,
      pricePerQuantity: price,
      quantity: itemCount,
      price: price * itemCount,
    };

    dispatch(addItems(newObj));
    setItemCount(0);
  };

  return (
    <>
      {/* 🔹 Kategoriya tanlash */}
      <div className="grid grid-cols-4 gap-4 px-10 py-4 w-[100%]">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div
              key={category._id}
              className={`flex flex-col items-start justify-between p-4 rounded-lg h-[100px] cursor-pointer ${
                selectedCategory?._id === category._id ? "bg-[#025cca]" : "bg-[#1a1a1a]"
              }`}
              onClick={() => {
                setSelectedCategory(category);
                setItemId(0);
                setItemCount(0);
              }}
            >
              <h1 className="text-[#f5f5f5] text-lg font-semibold">
                {category.name}
              </h1>
            </div>
          ))
        ) : (
          <p className="text-white text-center col-span-4">No categories found</p>
        )}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      {/* 🔹 Tanlangan kategoriya bo‘yicha mahsulotlar */}
      <div className="grid grid-cols-4 gap-4 px-10 py-4 w-[100%]">
        {products.length > 0 ? (
          products
            .filter((product) => product.category === selectedCategory?._id) // 🔹 To‘g‘rilangan filter
            .map((product) => (
              <div
                key={product._id}
                className="flex flex-col items-start justify-between p-4 rounded-lg h-[150px] cursor-pointer hover:bg-[#2a2a2a] bg-[#1a1a1a]"
              >
                <div className="flex items-start justify-between w-full">
                  <h1 className="text-[#f5f5f5] text-lg font-semibold">
                    {product.name}
                  </h1>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-[#2e4a40] text-[#02ca3a] p-2 rounded-lg"
                  >
                    <FaShoppingCart size={20} />
                  </button>
                </div>
                <div className="flex items-center justify-between w-full">
                  <p className="text-[#f5f5f5] text-xl font-bold">
                    UZS {product.price}
                  </p>
                  <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-3 rounded-lg gap-6 w-[50%]">
                    <button
                      onClick={() => decrement(product._id)}
                      className="text-yellow-500 text-2xl"
                    >
                      &minus;
                    </button>
                    <span className="text-white">
                      {itemId === product._id ? itemCount : "0"}
                    </span>
                    <button
                      onClick={() => increment(product._id)}
                      className="text-yellow-500 text-2xl"
                    >
                      &#43;
                    </button>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <p className="text-white text-center col-span-4">No products found</p>
        )}
      </div>
    </>
  );
};

export default MenuContainer;
