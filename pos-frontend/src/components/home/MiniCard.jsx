import React from 'react';

const MiniCard = ({ title, icon, number, loading }) => {
  return (
    <div className='bg-[#1a1a1a] py-5 px-5 rounded-lg w-[50%]'>
      <div className='flex items-start justify-between'>
        <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide'>{title}</h1>
        <button className={`${title === "Total Earnings" ? "bg-[#02ca3a]" : "bg-[#f6b100]"} p-3 rounded-lg text-[#f5f5f5] text-2xl`}>{icon}</button>
      </div>
      <div>
        {loading ? (
          <h1 className='text-[#f5f5f5] text-4xl font-bold mt-5'>Loading...</h1>
        ) : (
          <>
            <h1 className='text-[#f5f5f5] text-4xl font-bold mt-5'>
              {title === "Total Earnings" ? `${number} UZS` : number}
            </h1>
            <h1 className='text-[#f5f5f5] text-lg mt-2'>
            </h1>
          </>
        )}
      </div>
    </div>
  );
};

export default MiniCard;
