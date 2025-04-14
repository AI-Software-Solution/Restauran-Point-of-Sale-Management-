import React from "react";
import { FaCheckDouble, FaLongArrowAltRight, FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils/index";

const OrderCard = ({ orderKey, order }) => {
  const isReady = order.orderStatus === "Ready";

  return (
    <div
      key={orderKey}
      className="w-full max-w-[500px] bg-[#262626] p-4 rounded-2xl mb-5 shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      {/* Top Section */}
      <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-col sm:flex-row">
        <button className="bg-[#f6b100] text-[#1a1a1a] p-3 w-12 h-12 text-lg font-bold rounded-full flex items-center justify-center">
          {getAvatarName(order.customerDetails.name)}
        </button>

        <div className="flex justify-between items-start w-full flex-col sm:flex-row gap-3 sm:gap-0">
          {/* Customer Info */}
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-[#f5f5f5] text-base sm:text-lg font-semibold truncate max-w-[200px]">
              {order.customerDetails.name}
            </h1>
            <p className="text-[#ababab] text-sm">
              #{Math.floor(new Date(order.orderDate).getTime())} / Dine in
            </p>
            <p className="text-[#ababab] text-sm flex items-center gap-1">
              Table <FaLongArrowAltRight /> {order.table?.tableNo || "N/A"}
            </p>
          </div>

          {/* Order Status */}
          <div className="flex flex-col items-start sm:items-end gap-1">
            <p
              className={`text-sm px-2 py-1 rounded-lg font-medium flex items-center gap-2 ${
                isReady
                  ? "text-green-600 bg-[#2e4a40]"
                  : "text-yellow-600 bg-[#4a452e]"
              }`}
            >
              {isReady ? <FaCheckDouble /> : <FaCircle />} {order.orderStatus}
            </p>
            <p className="text-[#ababab] text-xs flex items-center gap-1">
              <FaCircle
                className={`text-xs ${
                  isReady ? "text-green-600" : "text-yellow-600"
                }`}
              />
              {isReady ? "Ready to serve" : "Preparing your order"}
            </p>
          </div>
        </div>
      </div>

      {/* Divider Info */}
      <div className="flex justify-between items-center mt-4 text-[#ababab] text-sm sm:text-base">
        <p>{formatDateAndTime(order.orderDate)}</p>
        <p>{order.items.length} Items</p>
      </div>

      <hr className="w-full mt-4 border-t border-gray-600" />

      {/* Bottom Total */}
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[#f5f5f5] text-base sm:text-lg font-semibold">
          Total
        </h1>
        <p className="text-[#f5f5f5] text-base sm:text-lg font-semibold">
          {order.bills.totalWithTax.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default OrderCard;
