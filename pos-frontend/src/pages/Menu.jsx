import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  HiOutlineSearch,
  HiOutlineArrowLeft,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineAnnotation,
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlinePrinter,
  HiOutlineCheckCircle,
  HiOutlineShoppingCart,
  HiOutlineViewBoards,
  HiOutlineSwitchHorizontal,
  HiOutlineRefresh,
  HiOutlineGift,
  HiOutlineHeart,
} from "react-icons/hi";
import { MdRestaurantMenu, MdTakeoutDining, MdTableBar } from "react-icons/md";
import { enqueueSnackbar } from "notistack";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, Badge, Modal, Input, Textarea } from "../components/ui";
import { addItems, removeItem, removeAllItems, getTotalPrice, updateQuantity, updateItemNote } from "../redux/slices/cartSlice";
import { removeCustomer } from "../redux/slices/customerSlice";
import { getCategories, getProducts, addOrder, updateTable, getTableById, createBillSplit } from "../https/index";
import Invoice from "../components/invoice/Invoice";

// Yangi POS komponentlar
import {
  BillSplitModal,
  TipInput,
  LoyaltyCard,
  KitchenNotesInput
} from "../components/pos";

// Unique ID generator
let cartIdCounter = 0;
const generateCartId = () => `cart-${Date.now()}-${++cartIdCounter}`;

const Menu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const userData = useSelector((state) => state.user);

  // Local state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedItemForNote, setSelectedItemForNote] = useState(null);
  const [itemNote, setItemNote] = useState("");
  const [tableInfo, setTableInfo] = useState(null);

  // Yangi POS state'lar
  const [showBillSplit, setShowBillSplit] = useState(false);
  const [loyaltyMember, setLoyaltyMember] = useState(null);
  const [tipAmount, setTipAmount] = useState(0);
  const [kitchenNotes, setKitchenNotes] = useState([]);

  const cartRef = useRef(null);
  const timeoutRefs = useRef([]);

  // Tax rate va hisoblashlar
  const taxRate = 12;
  const tax = (total * taxRate) / 100;
  const totalWithTax = total + tax + tipAmount;

  // Loyalty chegirmasi
  const loyaltyDiscount = loyaltyMember?.appliedDiscount || 0;
  const finalTotal = totalWithTax - loyaltyDiscount;

  // Get table ID from URL params
  const tableIdFromUrl = searchParams.get('table');

  useEffect(() => {
    document.title = "POS | Menu";
  }, []);

  // Fetch table info if coming from floor plan
  useEffect(() => {
    const fetchTableInfo = async () => {
      if (tableIdFromUrl) {
        try {
          const response = await getTableById(tableIdFromUrl);
          const data = response?.data || response;
          setTableInfo(data);
        } catch (error) {
          console.error("Failed to fetch table info:", error);
        }
      }
    };
    fetchTableInfo();
  }, [tableIdFromUrl]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        const data = response?.data || response || [];
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          setSelectedCategory(data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        const data = response?.data || response || [];
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Auto scroll cart
  useEffect(() => {
    if (cartRef.current) {
      cartRef.current.scrollTo({
        top: cartRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [cartData]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by category
    if (selectedCategory) {
      const categoryId = selectedCategory?.id || selectedCategory?._id;
      result = result.filter(product => {
        const productCategoryId = product.categoryId || product.category;
        return productCategoryId === categoryId;
      });
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product =>
        product.name?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [products, selectedCategory, searchQuery]);

  // Add to cart
  const handleAddToCart = useCallback((product) => {
    const newItem = {
      id: generateCartId(),
      productId: product.id || product._id,
      name: product.name,
      pricePerQuantity: product.price,
      quantity: 1,
      price: product.price,
      note: "",
    };
    dispatch(addItems(newItem));
  }, [dispatch]);

  // Update quantity
  const handleQuantityChange = useCallback((itemId, delta) => {
    const item = cartData.find(i => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      dispatch(removeItem(itemId));
    } else {
      dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
    }
  }, [cartData, dispatch]);

  // Remove from cart
  const handleRemoveItem = useCallback((itemId) => {
    dispatch(removeItem(itemId));
  }, [dispatch]);

  // Clear cart
  const handleClearCart = useCallback(() => {
    dispatch(removeAllItems());
  }, [dispatch]);

  // Add note to item
  const openNoteModal = (item) => {
    setSelectedItemForNote(item);
    setItemNote(item.note || "");
    setShowNoteModal(true);
  };

  const saveItemNote = () => {
    if (selectedItemForNote) {
      dispatch(updateItemNote({ id: selectedItemForNote.id, note: itemNote }));
    }
    setShowNoteModal(false);
    setSelectedItemForNote(null);
    setItemNote("");
    enqueueSnackbar("Izoh qo'shildi", { variant: "success" });
  };

  // Loyalty handlers
  const handleLoyaltyMemberFound = (member) => {
    setLoyaltyMember(member);
    enqueueSnackbar(`Xush kelibsiz, ${member.name}!`, { variant: "success" });
  };

  const handleEarnPoints = (data) => {
    // API call to earn points
    enqueueSnackbar(`${data.points} ball qo'shildi!`, { variant: "success" });
  };

  const handleRedeemPoints = (data) => {
    setLoyaltyMember(prev => ({
      ...prev,
      appliedDiscount: data.discountValue
    }));
    enqueueSnackbar(`${data.points} ball sarflandi! Chegirma: ${data.discountValue.toLocaleString()} so'm`, { variant: "success" });
  };

  // Tip handler
  const handleAddTip = (tipData) => {
    setTipAmount(tipData.amount);
    enqueueSnackbar(`Tip qo'shildi: ${tipData.amount.toLocaleString()} so'm`, { variant: "success" });
  };

  // Kitchen notes handler
  const handleAddKitchenNote = (note) => {
    setKitchenNotes(prev => [...prev, note]);
    if (note.noteType === 'allergy') {
      enqueueSnackbar('Allergiya izohi qo\'shildi!', { variant: 'warning' });
    } else {
      enqueueSnackbar('Oshxona izohi qo\'shildi!', { variant: 'success' });
    }
  };

  // Bill split handler
  const handleBillSplitConfirm = async (splitData) => {
    try {
      // API call to create bill split
      if (orderInfo?.id || orderInfo?._id) {
        const orderId = orderInfo.id || orderInfo._id;
        await createBillSplit(orderId, {
          splitType: splitData.splitType || 'equal',
          totalGuests: splitData.guests?.length || 2,
          guestAssignments: splitData.guestAssignments
        });
        enqueueSnackbar(`Hisob ${splitData.guests?.length || 2} qismga bo'lindi`, { variant: "success" });
      } else {
        enqueueSnackbar("Avval buyurtmani joylashtiring", { variant: "warning" });
      }
    } catch (error) {
      console.error("Bill split error:", error);
      enqueueSnackbar("Hisobni bo'lishda xatolik", { variant: "error" });
    }
    setShowBillSplit(false);
  };

  // Order mutation
  const orderMutation = useMutation({
    mutationFn: (data) => addOrder(data),
    onSuccess: (resData) => {
      const data = resData?.data?.data || resData?.data || resData;
      setOrderInfo(data);

      if (data.table) {
        const tableData = {
          status: "Booked",
          orderId: data._id || data.id,
          tableId: data.table,
        };
        const timeoutId = setTimeout(() => {
          tableUpdateMutation.mutate(tableData);
        }, 1000);
        timeoutRefs.current.push(timeoutId);
      } else {
        dispatch(removeCustomer());
        dispatch(removeAllItems());
      }

      enqueueSnackbar("Buyurtma muvaffaqiyatli joylandi!", { variant: "success" });
      setShowInvoice(true);
    },
    onError: (error) => {
      enqueueSnackbar("Buyurtma joylanmadi. Qayta urinib ko'ring.", { variant: "error" });
    },
  });

  const tableUpdateMutation = useMutation({
    mutationFn: (data) => updateTable(data),
    onSuccess: () => {
      dispatch(removeCustomer());
      dispatch(removeAllItems());
    },
  });

  // Place order
  const handlePlaceOrder = () => {
    if (!paymentMethod) {
      enqueueSnackbar("To'lov usulini tanlang!", { variant: "warning" });
      return;
    }

    if (!cartData || cartData.length === 0) {
      enqueueSnackbar("Savat bo'sh! Mahsulot qo'shing.", { variant: "warning" });
      return;
    }

    const tableId = customerData.orderType === 'takeaway'
      ? null
      : (tableIdFromUrl || customerData.table?.tableId || null);

    const orderData = {
      customerDetails: {
        name: customerData.customerName || "Mehmon",
        phone: customerData.customerPhone || "",
        guests: customerData.guests || 1,
        orderType: customerData.orderType || "dine-in",
      },
      orderStatus: "In Progress",
      bills: {
        total: total,
        tax: tax,
        tip: tipAmount,
        loyaltyDiscount: loyaltyDiscount,
        totalWithTax: finalTotal,
      },
      items: cartData.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        pricePerQuantity: item.pricePerQuantity,
        note: item.note || "",
      })),
      kitchenNotes: kitchenNotes,
      loyaltyMember: loyaltyMember ? {
        id: loyaltyMember.id,
        name: loyaltyMember.name,
        cardNumber: loyaltyMember.cardNumber,
        pointsToEarn: Math.floor(total * 0.01)
      } : null,
      table: tableId,
      paymentMethod: paymentMethod,
      waiter: userData?.name || "Staff",
    };

    orderMutation.mutate(orderData);
  };

  // Get display info
  const displayTableNo = tableInfo?.tableNo || customerData.table?.tableNo || "—";
  const displayCustomerName = customerData.customerName || "Mehmon";
  const displayGuests = customerData.guests || 1;
  const orderType = customerData.orderType || "dine-in";

  return (
    <div className="h-[calc(100vh-3.5rem)] flex bg-background">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-surface border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Back & Title */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                icon={<HiOutlineArrowLeft className="w-5 h-5" />}
                onClick={() => navigate('/floor-plan')}
              />
              <div>
                <h1 className="text-lg font-semibold text-text-primary">Point of Sale</h1>
                <p className="text-sm text-text-secondary">
                  {orderType === 'takeaway' ? (
                    <span className="flex items-center gap-1">
                      <MdTakeoutDining className="w-4 h-4" /> Olib ketish
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <MdTableBar className="w-4 h-4" /> Stol {displayTableNo}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Mahsulot qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface-secondary border-0 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Customer Info */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-secondary rounded-lg">
                <HiOutlineUser className="w-4 h-4 text-text-secondary" />
                <span className="text-sm font-medium text-text-primary">{displayCustomerName}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-secondary rounded-lg">
                <HiOutlineUsers className="w-4 h-4 text-text-secondary" />
                <span className="text-sm font-medium text-text-primary">{displayGuests}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-surface border-b border-border px-4 py-2 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map((category) => {
              const catId = category.id || category._id;
              const selectedId = selectedCategory?.id || selectedCategory?._id;
              const isSelected = selectedId === catId;

              return (
                <button
                  key={catId}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                    ${isSelected
                      ? 'bg-primary text-white'
                      : 'bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-surface-secondary/80'
                    }
                  `}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary">
              <MdRestaurantMenu className="w-16 h-16 mb-4 opacity-50" />
              <p>Mahsulotlar topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => {
                const prodId = product.id || product._id;
                const isInCart = cartData.some(item => item.productId === prodId);

                return (
                  <div
                    key={prodId}
                    onClick={() => handleAddToCart(product)}
                    className={`
                      relative bg-surface border rounded-lg p-3 cursor-pointer
                      transition-all duration-200 hover:shadow-md hover:border-primary-500/50
                      ${isInCart ? 'border-primary-500 ring-1 ring-primary-500/30' : 'border-border'}
                    `}
                  >
                    {/* Product Image Placeholder */}
                    {product.image ? (
                      <div className="aspect-square rounded-lg mb-2 overflow-hidden bg-surface-secondary">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg mb-2 bg-surface-secondary flex items-center justify-center">
                        <MdRestaurantMenu className="w-8 h-8 text-text-muted" />
                      </div>
                    )}

                    {/* Product Info */}
                    <h3 className="font-medium text-text-primary text-sm line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-primary font-semibold">
                      {Number(product.price).toLocaleString()} <span className="text-xs text-text-muted">UZS</span>
                    </p>

                    {/* Quick Add Badge */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-600 transition-colors"
                    >
                      <HiOutlinePlus className="w-5 h-5" />
                    </button>

                    {/* In Cart Indicator */}
                    {isInCart && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="success" size="sm">
                          <HiOutlineCheckCircle className="w-3 h-3 mr-1" />
                          Savatda
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-80 lg:w-96 bg-surface border-l border-border flex flex-col hidden md:flex">
        {/* Cart Header */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiOutlineShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-text-primary">Buyurtma</h2>
              <Badge variant="secondary" size="sm">{cartData.length}</Badge>
            </div>
            {cartData.length > 0 && (
              <Button
                variant="ghost"
                size="xs"
                icon={<HiOutlineTrash className="w-4 h-4" />}
                onClick={handleClearCart}
                className="text-danger hover:bg-danger/10"
              >
                Tozalash
              </Button>
            )}
          </div>

          {/* Customer Info Card */}
          <div className="mt-3 p-3 bg-surface-secondary rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">{displayCustomerName}</p>
                <p className="text-xs text-text-secondary">
                  {orderType === 'takeaway' ? 'Olib ketish' : `Stol ${displayTableNo}`} • {displayGuests} mehmon
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {displayCustomerName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4" ref={cartRef}>
          {cartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary">
              <HiOutlineShoppingCart className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">Savat bo'sh</p>
              <p className="text-xs">Mahsulotlarni bosib qo'shing</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cartData.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-secondary rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-text-primary text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-text-secondary">
                        {Number(item.pricePerQuantity || item.price || 0).toLocaleString()} UZS x {item.quantity}
                      </p>
                      {item.note && (
                        <p className="text-xs text-warning mt-1 italic">
                          📝 {item.note}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-text-primary text-sm">
                      {Number(item.price || 0).toLocaleString()} UZS
                    </p>
                  </div>

                  {/* Item Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="w-7 h-7 rounded bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
                      >
                        <HiOutlineMinus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-text-primary">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="w-7 h-7 rounded bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
                      >
                        <HiOutlinePlus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openNoteModal(item)}
                        className="p-1.5 rounded text-text-secondary hover:text-warning hover:bg-warning/10 transition-colors"
                        title="Izoh qo'shish"
                      >
                        <HiOutlineAnnotation className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 rounded text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                        title="O'chirish"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loyalty Card */}
        <div className="border-t border-border p-4">
          <LoyaltyCard
            orderTotal={total}
            onMemberFound={handleLoyaltyMemberFound}
            onEarnPoints={handleEarnPoints}
            onRedeemPoints={handleRedeemPoints}
            compact
          />
        </div>

        {/* Bill Summary */}
        <div className="border-t border-border p-4 bg-surface">
          {/* Kitchen Notes */}
          {kitchenNotes.length > 0 && (
            <div className="mb-3 p-2 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-xs text-warning font-medium mb-1">Oshxona izohlari:</p>
              {kitchenNotes.map((note, idx) => (
                <p key={idx} className="text-xs text-text-secondary">
                  {note.noteType === 'allergy' && '⚠️ '}
                  {note.noteText}
                </p>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Jami ({cartData.length} ta)</span>
              <span className="text-text-primary font-medium">
                {total.toLocaleString()} UZS
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Soliq ({taxRate}%)</span>
              <span className="text-text-primary font-medium">
                {tax.toLocaleString()} UZS
              </span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span className="flex items-center gap-1">
                  <HiOutlineHeart className="w-4 h-4" />
                  Tip
                </span>
                <span className="font-medium">+{tipAmount.toLocaleString()} UZS</span>
              </div>
            )}
            {loyaltyDiscount > 0 && (
              <div className="flex justify-between text-sm text-primary">
                <span className="flex items-center gap-1">
                  <HiOutlineGift className="w-4 h-4" />
                  Loyalty chegirma
                </span>
                <span className="font-medium">-{loyaltyDiscount.toLocaleString()} UZS</span>
              </div>
            )}
            <div className="flex justify-between text-base pt-2 border-t border-border">
              <span className="font-semibold text-text-primary">Umumiy</span>
              <span className="font-bold text-primary text-lg">
                {finalTotal.toLocaleString()} UZS
              </span>
            </div>
          </div>

          {/* Tip Input (Compact) */}
          {cartData.length > 0 && (
            <div className="mb-4">
              <TipInput
                orderTotal={total}
                onAddTip={handleAddTip}
                waiterId={userData?.id}
                compact
              />
            </div>
          )}

          {/* Payment Methods */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setPaymentMethod("Cash")}
              className={`
                flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors
                ${paymentMethod === "Cash"
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-text-secondary hover:border-primary/50'
                }
              `}
            >
              <HiOutlineCash className="w-5 h-5" />
              Naqd
            </button>
            <button
              onClick={() => setPaymentMethod("Card")}
              className={`
                flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors
                ${paymentMethod === "Card"
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-text-secondary hover:border-primary/50'
                }
              `}
            >
              <HiOutlineCreditCard className="w-5 h-5" />
              Karta
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handlePlaceOrder}
              disabled={cartData.length === 0 || orderMutation.isPending}
              icon={orderMutation.isPending ? <HiOutlineRefresh className="w-5 h-5 animate-spin" /> : <HiOutlineCheckCircle className="w-5 h-5" />}
            >
              {orderMutation.isPending ? "Yuklanmoqda..." : "Buyurtma berish"}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<HiOutlinePrinter className="w-4 h-4" />}
              >
                Chop etish
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<HiOutlineViewBoards className="w-4 h-4" />}
                onClick={() => setShowBillSplit(true)}
                disabled={cartData.length === 0}
              >
                Bo'lish
              </Button>
            </div>

            {/* Kitchen Notes */}
            <div className="mt-3">
              <KitchenNotesInput
                onAddNote={handleAddKitchenNote}
                compact
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Button */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => {/* Open mobile cart modal */}}
          className="relative w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center"
        >
          <HiOutlineShoppingCart className="w-6 h-6" />
          {cartData.length > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
              {cartData.length}
            </span>
          )}
        </button>
      </div>

      {/* Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Mahsulotga izoh"
        size="sm"
      >
        <div className="space-y-4">
          <Textarea
            label="Izoh"
            value={itemNote}
            onChange={(e) => setItemNote(e.target.value)}
            placeholder="Masalan: kam tuzli, qo'shimcha sous..."
            rows={3}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowNoteModal(false)} fullWidth>
              Bekor qilish
            </Button>
            <Button variant="primary" onClick={saveItemNote} fullWidth>
              Saqlash
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invoice Modal */}
      {showInvoice && orderInfo && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}

      {/* Bill Split Modal */}
      <BillSplitModal
        isOpen={showBillSplit}
        onClose={() => setShowBillSplit(false)}
        orderItems={cartData.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))}
        orderTotal={finalTotal}
        guestCount={displayGuests}
        onSplitConfirm={handleBillSplitConfirm}
      />
    </div>
  );
};

export default Menu;
