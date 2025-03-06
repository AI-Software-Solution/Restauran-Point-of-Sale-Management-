import React, { useRef } from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa6";

const Invoice = ({ orderInfo, setShowInvoice }) => {
  const invoiceRef = useRef(null);
  const handlePrint = () => {
    const printContent = invoiceRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");

    WinPrint.document.write(`
            <html>
              <head>
                <title>Order Receipt</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; }
                  .receipt-container { width: 300px; border: 1px solid #ddd; padding: 10px; }
                  h2 { text-align: center; }
                </style>
              </head>
              <body>
                ${printContent}
              </body>
            </html>
          `);

    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-[400px]">
        {/* Receipt Content for Printing */}

        <div ref={invoiceRef} className="p-4">
          {/* Receipt Header */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
              className="w-12 h-12 border-8 border-green-500 rounded-full flex items-center justify-center shadow-lg bg-green-500"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-2xl"
              >
                <FaCheck className="text-white" />
              </motion.span>
            </motion.div>
          </div>

          <h2 className="text-xl font-bold text-center mb-2">Order Receipt</h2>
          <p className="text-gray-600 text-center">Thank you for your order!</p>

          {/* Order Details */}

          <div className="mt-4 border-t pt-4 text-sm text-gray-700">
            <p>
              <strong>Order ID:</strong>{" "}
              {Math.floor(new Date(orderInfo.orderDate).getTime())}
            </p>
            <p>
              <strong>Name:</strong> {orderInfo.customerDetails.name}
            </p>
            <p>
              <strong>Phone:</strong> {orderInfo.customerDetails.phone}
            </p>
            <p>
              <strong>Guests:</strong> {orderInfo.customerDetails.guests}
            </p>
          </div>

          {/* Items Summary */}

          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Items Ordered</h3>
            <ul className="text-sm text-gray-700">
              {orderInfo.items.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center text-xs"
                >
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>₹{item.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bills Summary */}

          <div className="mt-4 border-t pt-4 text-sm">
            <p>
              <strong>Subtotal:</strong> ₹{orderInfo.bills.total.toFixed(2)}
            </p>
            <p>
              <strong>Tax:</strong> ₹{orderInfo.bills.tax.toFixed(2)}
            </p>
            <p className="text-md font-semibold">
              <strong>Grand Total:</strong> ₹
              {orderInfo.bills.totalWithTax.toFixed(2)}
            </p>
          </div>

          {/* Payment Details */}

          <div className="mb-2 mt-2 text-xs">
            {orderInfo.paymentMethod === "Cash" ? (
              <p>
                <strong>Payment Method:</strong> {orderInfo.paymentMethod}
              </p>
            ) : (
              <>
                <p>
                  <strong>Payment Method:</strong> {orderInfo.paymentMethod}
                </p>
                <p>
                  <strong>Razorpay Order ID:</strong>{" "}
                  {orderInfo.paymentData?.razorpay_order_id}
                </p>
                <p>
                  <strong>Razorpay Payment ID:</strong>{" "}
                  {orderInfo.paymentData?.razorpay_payment_id}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrint}
            className="text-blue-500 hover:underline text-xs px-4 py-2 rounded-lg"
          >
            Print Receipt
          </button>
          <button
            onClick={() => setShowInvoice(false)}
            className="text-red-500 hover:underline text-xs px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
