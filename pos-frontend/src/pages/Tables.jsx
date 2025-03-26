import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getTables } from "../https/index"; // API chaqiriqlari uchun to‘g‘ri yo‘l

const Tables = () => {
  const [status, setStatus] = useState("all");
  const navigateMenu = useNavigate();

  useEffect(() => {
    document.title = "POS | Tables";
  }, []);

  const { data: resData, isError } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
    placeholderData: keepPreviousData,
  });

  if (isError) {
    console.error("Something went wrong while fetching tables!");
  }

  const filteredTables =
    status === "all"
      ? resData
      : resData?.filter((table) => table.status === "Booked");

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Tables
          </h1>
        </div>
        <button
          onClick={() => {
            setStatus("takeaway");
            navigateMenu("/menu");
          }}
          className={`text-lg px-5 py-2 font-semibold ${
            status === "takeaway" ? "bg-yellow-500 text-black" : "text-[#ababab]"
          } rounded-lg`}
        >
          Takeaway
        </button>
        <div className="flex items-center justify-around gap-4">
          <button
            onClick={() => setStatus("all")}
            className={`text-[#ababab] text-lg ${
              status === "all" && "bg-[#383838] rounded-lg px-5 py-2"
            } rounded-lg px-5 py-2 font-semibold`}
          >
            All
          </button>
          <button
            onClick={() => setStatus("booked")}
            className={`text-[#ababab] text-lg ${
              status === "booked" && "bg-[#383838] rounded-lg px-5 py-2"
            } rounded-lg px-5 py-2 font-semibold`}
          >
            Booked
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 px-16 py-4 h-[650px] overflow-y-scroll scrollbar-hide">
        {filteredTables && filteredTables.length > 0 ? (
          filteredTables.map((table) => (
            <TableCard
              key={table._id}
              id={table._id}
              name={`Table ${table.tableNo}`}
              status={table.status}
              initials={table?.currentOrder?.customerDetails?.name || "No Name"}
              seats={table.seats}
            />
          ))
        ) : (
          <p className="text-white text-lg text-center w-full">
            No tables available
          </p>
        )}
      </div>

      <BottomNav />
    </section>
  );
};

export default Tables;
