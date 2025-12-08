import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalPrice } from "../../redux/slices/cartSlice";
import {
  addOrder,
  createOrderRazorpay,
  updateTable,
  verifyPaymentRazorpay,
} from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import {
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlineGlobeAlt,
  HiOutlinePrinter,
  HiOutlineCheckCircle,
  HiOutlineHeart,
  HiOutlineGift,
  HiOutlineRefresh,
} from "react-icons/hi";
import { FiStar } from "react-icons/fi";
import Invoice from "../invoice/Invoice";
import { TipInput, LoyaltyCard } from "../pos";

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

const Bill = () => {
  const dispatch = useDispatch();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const userData = useSelector((state) => state.user);

  // Tax calculation
  const taxRate = 12;
  const tax = (total * taxRate) / 100;

  // State
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [tipAmount, setTipAmount] = useState(0);
  const [loyaltyMember, setLoyaltyMember] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculated totals
  const loyaltyDiscount = loyaltyMember?.appliedDiscount || 0;
  const totalPriceWithTax = total + tax + tipAmount - loyaltyDiscount;

  // Store timeout refs for cleanup on unmount
  const timeoutRefs = useRef([]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Handlers
  const handleLoyaltyMemberFound = (member) => {
    setLoyaltyMember(member);
    enqueueSnackbar(`Xush kelibsiz, ${member.name}!`, { variant: "success" });
  };

  const handleRedeemPoints = (data) => {
    setLoyaltyMember(prev => ({
      ...prev,
      appliedDiscount: data.discountValue
    }));
    enqueueSnackbar(`${data.points} ball sarflandi!`, { variant: "success" });
  };

  const handleAddTip = (tipData) => {
    setTipAmount(tipData.amount);
    enqueueSnackbar(`Tip qo'shildi: ${tipData.amount.toLocaleString()} so'm`, { variant: "success" });
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      enqueueSnackbar("To'lov turini tanlang!", { variant: "warning" });
      return;
    }

    if (!cartData || cartData.length === 0) {
      enqueueSnackbar("Savat bo'sh! Mahsulot qo'shing.", { variant: "warning" });
      return;
    }

    const tableId = customerData.orderType === 'takeaway'
      ? null
      : customerData.table?.tableId || null;

    setIsLoading(true);

    if (paymentMethod === "Online") {
      try {
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

        if (!res) {
          enqueueSnackbar("Razorpay SDK yuklanmadi. Internetni tekshiring.", { variant: "warning" });
          setIsLoading(false);
          return;
        }

        const reqData = { amount: totalPriceWithTax.toFixed(2) };
        const { data } = await createOrderRazorpay(reqData);

        const options = {
          key: `${import.meta.env.VITE_RAZORPAY_KEY_ID}`,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "Restaurant POS",
          description: "Secure Payment for Your Meal",
          order_id: data.order.id,
          handler: async function (response) {
            const verification = await verifyPaymentRazorpay(response);
            enqueueSnackbar(verification.data.message, { variant: "success" });

            const orderData = {
              customerDetails: {
                name: customerData.customerName,
                phone: customerData.customerPhone,
                guests: customerData.guests,
                orderType: customerData.orderType,
              },
              orderStatus: "In Progress",
              bills: {
                total: total,
                tax: tax,
                tip: tipAmount,
                loyaltyDiscount: loyaltyDiscount,
                totalWithTax: totalPriceWithTax,
              },
              items: cartData,
              loyaltyMember: loyaltyMember ? {
                id: loyaltyMember.id,
                name: loyaltyMember.name,
                pointsToEarn: Math.floor(total * 0.01)
              } : null,
              table: tableId,
              paymentMethod: paymentMethod,
              paymentData: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
              },
            };

            const timeoutId = setTimeout(() => {
              orderMutation.mutate(orderData);
            }, 1500);
            timeoutRefs.current.push(timeoutId);
          },
          prefill: {
            name: customerData.customerName,
            email: "",
            contact: customerData.customerPhone,
          },
          theme: { color: "#714B67" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setIsLoading(false);
      } catch (error) {
        enqueueSnackbar("To'lov amalga oshmadi!", { variant: "error" });
        setIsLoading(false);
      }
    } else {
      const orderData = {
        customerDetails: {
          name: customerData.customerName,
          phone: customerData.customerPhone,
          guests: customerData.guests,
          orderType: customerData.orderType,
        },
        orderStatus: "In Progress",
        bills: {
          total: total,
          tax: tax,
          tip: tipAmount,
          loyaltyDiscount: loyaltyDiscount,
          totalWithTax: totalPriceWithTax,
        },
        items: cartData,
        loyaltyMember: loyaltyMember ? {
          id: loyaltyMember.id,
          name: loyaltyMember.name,
          pointsToEarn: Math.floor(total * 0.01)
        } : null,
        table: tableId,
        paymentMethod: paymentMethod,
        waiter: userData?.name || "Staff",
      };
      orderMutation.mutate(orderData);
    }
  };

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (resData) => {
      const data = resData?.data?.data || resData?.data || resData;
      setOrderInfo(data);
      setIsLoading(false);

      if (data.table) {
        const tableData = {
          status: "Booked",
          orderId: data._id || data.id,
          tableId: data.table,
        };

        const timeoutId = setTimeout(() => {
          tableUpdateMutation.mutate(tableData);
        }, 1500);
        timeoutRefs.current.push(timeoutId);
      } else {
        dispatch(removeCustomer());
        dispatch(removeAllItems());
      }

      enqueueSnackbar(
        customerData.orderType === 'takeaway'
          ? "Buyurtma qabul qilindi!"
          : "Buyurtma joylandi!",
        { variant: "success" }
      );
      setShowInvoice(true);
    },
    onError: () => {
      setIsLoading(false);
      enqueueSnackbar("Buyurtma joylanmadi. Qayta urinib ko'ring.", { variant: "error" });
    },
  });

  const tableUpdateMutation = useMutation({
    mutationFn: (reqData) => updateTable(reqData),
    onSuccess: () => {
      dispatch(removeCustomer());
      dispatch(removeAllItems());
    },
    onError: () => {},
  });

  const paymentMethods = [
    { id: "Cash", label: "Naqd", icon: HiOutlineCash },
    { id: "Card", label: "Karta", icon: HiOutlineCreditCard },
    { id: "Online", label: "Online", icon: HiOutlineGlobeAlt },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Loyalty Card */}
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <LoyaltyCard
          orderTotal={total}
          onMemberFound={handleLoyaltyMemberFound}
          onRedeemPoints={handleRedeemPoints}
          compact
        />
      </div>

      {/* Bill Summary */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Loyalty Member Badge */}
        {loyaltyMember && (
          <div className="mb-4 p-3 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
            <div className="flex items-center gap-2">
              <FiStar className="text-[var(--color-primary)]" />
              <span className="font-medium text-[var(--color-text)]">{loyaltyMember.name}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {loyaltyMember.currentPoints} ball
              </span>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">
              Mahsulotlar ({cartData.length} ta)
            </span>
            <span className="font-medium text-[var(--color-text)]">
              {total.toLocaleString()} UZS
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">
              Soliq ({taxRate}%)
            </span>
            <span className="font-medium text-[var(--color-text)]">
              {tax.toLocaleString()} UZS
            </span>
          </div>

          {tipAmount > 0 && (
            <div className="flex items-center justify-between text-green-600">
              <span className="flex items-center gap-2 text-sm">
                <HiOutlineHeart className="w-4 h-4" />
                Tip
              </span>
              <span className="font-medium">+{tipAmount.toLocaleString()} UZS</span>
            </div>
          )}

          {loyaltyDiscount > 0 && (
            <div className="flex items-center justify-between text-[var(--color-primary)]">
              <span className="flex items-center gap-2 text-sm">
                <HiOutlineGift className="w-4 h-4" />
                Loyalty chegirma
              </span>
              <span className="font-medium">-{loyaltyDiscount.toLocaleString()} UZS</span>
            </div>
          )}

          <div className="pt-3 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--color-text)]">Jami</span>
              <span className="text-xl font-bold text-[var(--color-primary)]">
                {totalPriceWithTax.toLocaleString()} UZS
              </span>
            </div>
          </div>
        </div>

        {/* Tip Input */}
        <div className="mt-4">
          <TipInput
            orderTotal={total}
            onAddTip={handleAddTip}
            waiterId={userData?.id}
            compact
          />
        </div>
      </div>

      {/* Payment Section */}
      <div className="border-t border-[var(--color-border)] p-4 bg-[var(--color-surface)]">
        {/* Payment Methods */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`
                  flex flex-col items-center justify-center gap-1 p-3 rounded-lg border text-sm font-medium transition-all
                  ${paymentMethod === method.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {method.label}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-surface-secondary)] text-[var(--color-text)] font-medium hover:bg-[var(--color-border)] transition-colors"
          >
            <HiOutlinePrinter className="w-5 h-5" />
            Chop etish
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={isLoading || orderMutation.isPending}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || orderMutation.isPending ? (
              <>
                <HiOutlineRefresh className="w-5 h-5 animate-spin" />
                Yuklanmoqda...
              </>
            ) : (
              <>
                <HiOutlineCheckCircle className="w-5 h-5" />
                Buyurtma
              </>
            )}
          </button>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </div>
  );
};

export default Bill;
