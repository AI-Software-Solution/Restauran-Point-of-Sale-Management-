import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaShoppingCart, FaPlus } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";
import { getCategories, getProducts } from "../../https/index";

// Unique ID generator
let cartIdCounter = 0;
const generateCartId = () => `cart-${Date.now()}-${++cartIdCounter}`;

const MenuContainer = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const [itemId, setItemId] = useState();
  const [addedItems, setAddedItems] = useState({}); // Quick-add animation tracking
  const dispatch = useDispatch();

  // 🔹 Kategoriyalarni API dan olish
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories(); // ✅ API chaqirish
        // Handle both { data: [...] } and direct array responses
        const data = response?.data || response || [];

        if (Array.isArray(data) && data.length > 0) {
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
        const response = await getProducts(); // ✅ API chaqirish
        // Handle both { data: [...] } and direct array responses
        const data = response?.data || response || [];

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

  // Memoized: Tanlangan kategoriya bo'yicha filtrlangan mahsulotlar
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return [];
    // Support both id and _id, categoryId and category field names
    const categoryId = selectedCategory?.id || selectedCategory?._id;
    return products.filter((product) => {
      const productCategoryId = product.categoryId || product.category;
      return productCategoryId === categoryId;
    });
  }, [products, selectedCategory]);

  const increment = useCallback((id) => {
    setItemId(id);
    setItemCount((prev) => prev >= 4 ? prev : prev + 1);
  }, []);

  const decrement = useCallback((id) => {
    setItemId(id);
    setItemCount((prev) => prev <= 0 ? prev : prev - 1);
  }, []);

  const handleAddToCart = useCallback((item) => {
    if (itemCount === 0) return;

    const { name, price } = item;
    const newObj = {
      id: generateCartId(), // Unique ID
      name,
      pricePerQuantity: price,
      quantity: itemCount,
      price: price * itemCount,
    };

    dispatch(addItems(newObj));
    setItemCount(0);
  }, [dispatch, itemCount]);

  // Quick-add: 1 dona darhol qo'shish
  const handleQuickAdd = useCallback((item, e) => {
    e.stopPropagation();

    const { name, price } = item;
    const newObj = {
      id: generateCartId(), // Unique ID
      name,
      pricePerQuantity: price,
      quantity: 1,
      price: price,
    };

    dispatch(addItems(newObj));

    // Animation feedback
    const itemId = item.id || item._id;
    setAddedItems(prev => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [itemId]: false }));
    }, 300);
  }, [dispatch]);

  return (
    <>
      {/* 🔹 Kategoriya tanlash */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 px-4 sm:px-6 lg:px-10 py-4 w-full">
        {categories.length > 0 ? (
          categories.map((category) => {
            const catId = category.id || category._id;
            const selectedId = selectedCategory?.id || selectedCategory?._id;
            return (
              <div
                key={catId}
                className={`flex flex-col items-start justify-between p-3 sm:p-4 rounded-lg h-[70px] sm:h-[100px] cursor-pointer ${
                  selectedId === catId ? "bg-[#025cca]" : "bg-[#1a1a1a]"
                }`}
                onClick={() => {
                  setSelectedCategory(category);
                  setItemId(0);
                  setItemCount(0);
                }}
              >
                <h1 className="text-[#f5f5f5] text-sm sm:text-lg font-semibold">
                  {category.name}
                </h1>
              </div>
            );
          })
        ) : (
          <p className="text-white text-center col-span-full">No categories found</p>
        )}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      {/* 🔹 Tanlangan kategoriya bo'yicha mahsulotlar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 px-4 sm:px-6 lg:px-10 py-4 w-full overflow-y-auto max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-320px)]">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const prodId = product.id || product._id;
            return (
              <div
                key={prodId}
                className={`relative flex flex-col items-start justify-between p-3 sm:p-4 rounded-lg h-[120px] sm:h-[150px] cursor-pointer transition-all duration-150 ${
                  addedItems[prodId]
                    ? "bg-[#2e4a40] scale-95"
                    : "hover:bg-[#2a2a2a] bg-[#1a1a1a]"
                }`}
              >
                {/* Quick Add Button - katta va ko'zga tashlanadigan */}
                <button
                  onClick={(e) => handleQuickAdd(product, e)}
                  className="absolute top-2 right-2 bg-[#F6B100] hover:bg-yellow-600 text-[#1a1a1a] w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl transition-all hover:scale-110 active:scale-95 shadow-lg"
                  title="Tez qo'shish (+1)"
                >
                  <FaPlus size={16} />
                </button>

                {/* Mahsulot nomi */}
                <h1 className="text-[#f5f5f5] text-sm sm:text-lg font-semibold pr-10 sm:pr-12 line-clamp-2">
                  {product.name}
                </h1>

                {/* Narx va miqdor kontroli */}
                <div className="flex items-center justify-between w-full">
                  <p className="text-[#F6B100] text-base sm:text-xl font-bold">
                    {Number(product.price).toLocaleString()} <span className="text-xs sm:text-sm text-[#ababab]">UZS</span>
                  </p>

                  {/* Miqdor kontroli - faqat tanlanganda ko'rinadi */}
                  {itemId === prodId && itemCount > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-[#1f1f1f] rounded-lg overflow-hidden">
                        <button
                          onClick={() => decrement(prodId)}
                          className="text-yellow-500 text-xl px-3 py-2 hover:bg-[#2a2a2a]"
                        >
                          &minus;
                        </button>
                        <span className="text-white px-3 min-w-[30px] text-center">
                          {itemCount}
                        </span>
                        <button
                          onClick={() => increment(prodId)}
                          className="text-yellow-500 text-xl px-3 py-2 hover:bg-[#2a2a2a]"
                        >
                          &#43;
                        </button>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-[#2e4a40] hover:bg-[#3a5a50] text-[#02ca3a] p-2 rounded-lg transition-colors"
                      >
                        <FaShoppingCart size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setItemId(prodId);
                        setItemCount(1);
                      }}
                      className="text-[#ababab] hover:text-white text-sm px-3 py-1 rounded bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors"
                    >
                      Ko'proq
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-white text-center col-span-full">Mahsulotlar topilmadi</p>
        )}
      </div>
    </>
  );
};

export default MenuContainer;
