import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMenuPerformance } from '../../../https';

const TopProductsTable = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['menu-performance'],
    queryFn: () => getMenuPerformance(30)
  });

  const products = data?.data?.data?.topSellers || [];

  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-6 h-full animate-pulse">
        <div className="h-6 w-48 bg-gray-700 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate max revenue for bar width
  const maxRevenue = Math.max(...products.map(p => p.revenue), 1);

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">🏆 Top Mahsulotlar</h3>
        <span className="text-sm text-gray-400">So'nggi 30 kun</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
              <th className="pb-3">#</th>
              <th className="pb-3">Mahsulot</th>
              <th className="pb-3 text-right">Sotilgan</th>
              <th className="pb-3 text-right">Daromad</th>
              <th className="pb-3 w-1/4">Ulush</th>
            </tr>
          </thead>
          <tbody>
            {products.slice(0, 10).map((product, idx) => (
              <tr key={product.id || idx} className="border-b border-gray-800 hover:bg-[#252525] transition-colors">
                <td className="py-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                    idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                    idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-gray-700/50 text-gray-400'
                  }`}>
                    {idx + 1}
                  </span>
                </td>
                <td className="py-3">
                  <span className="font-medium">{product.name}</span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-gray-300">{product.quantity}</span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-green-400 font-medium">
                    {product.revenue.toLocaleString()}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400 w-12 text-right">
                      {((product.revenue / maxRevenue) * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          Ma'lumotlar yo'q
        </div>
      )}
    </div>
  );
};

export default TopProductsTable;
