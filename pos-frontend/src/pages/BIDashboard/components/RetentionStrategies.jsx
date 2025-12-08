import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { getRetentionStrategies } from '../../../https';

const PRIORITY_COLORS = {
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500' },
  high: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500' },
  medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500' },
  low: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', badge: 'bg-green-500' }
};

const SEGMENT_ICONS = {
  vip: '👑',
  powerUser: '⚡',
  loyal: '💙',
  regular: '✅',
  casual: '🎲',
  new: '🌟',
  inactive: '⚠️'
};

const STRATEGY_ICONS = {
  exclusive_event: '🎉',
  personal_service: '👤',
  win_back_discount: '💰',
  personal_call: '📞',
  loyalty_program: '🎁',
  referral: '👥',
  first_visit_followup: '📱',
  welcome_bonus: '🎊',
  menu_recommendation: '🍽️',
  speed_service: '⚡',
  surprise_upgrade: '✨'
};

const RetentionStrategies = () => {
  const [expandedStrategy, setExpandedStrategy] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['retention-strategies'],
    queryFn: () => getRetentionStrategies(180),
    refetchInterval: 300000
  });

  const strategiesData = data?.data?.data || {};

  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-700 rounded mb-6"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">🎯 Saqlab Qolish Strategiyalari</h3>
        <p className="text-gray-400 text-sm">Ma'lumotlarni yuklashda xatolik</p>
      </div>
    );
  }

  const { strategies, summary } = strategiesData;

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">🎯 AI Saqlab Qolish Strategiyalari</h3>
        {strategiesData.generatedAt && (
          <span className="text-xs text-gray-500">
            Yangilangan: {new Date(strategiesData.generatedAt).toLocaleTimeString('uz-UZ')}
          </span>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{summary.totalStrategies}</p>
            <p className="text-xs text-gray-400">Jami strategiyalar</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{summary.criticalActions}</p>
            <p className="text-xs text-gray-400">Kritik harakatlar</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{summary.highPriorityActions}</p>
            <p className="text-xs text-gray-400">Yuqori ustuvorlik</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{summary.totalTargetCustomers}</p>
            <p className="text-xs text-gray-400">Target mijozlar</p>
          </div>
        </div>
      )}

      {/* Strategies List */}
      <div className="space-y-4">
        {strategies && strategies.length > 0 ? (
          strategies.map((strategy, idx) => {
            const colors = PRIORITY_COLORS[strategy.priority] || PRIORITY_COLORS.medium;
            const isExpanded = expandedStrategy === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${colors.bg} border ${colors.border} rounded-xl overflow-hidden`}
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer flex items-center justify-between"
                  onClick={() => setExpandedStrategy(isExpanded ? null : idx)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{SEGMENT_ICONS[strategy.segment]}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{strategy.segmentName}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${colors.badge} text-white`}>
                          {strategy.priority === 'critical' ? 'Kritik' :
                           strategy.priority === 'high' ? 'Yuqori' :
                           strategy.priority === 'medium' ? "O'rta" : 'Past'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {strategy.targetCount} mijoz | {strategy.strategies?.length || 0} strategiya
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {strategy.potentialRecovery && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Qaytarish potensiali</p>
                        <p className="text-sm font-medium text-green-400">
                          +{strategy.potentialRecovery.toLocaleString()} so'm
                        </p>
                      </div>
                    )}
                    <motion.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="text-gray-400"
                    >
                      ▼
                    </motion.span>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-700/50"
                    >
                      <div className="p-4 space-y-3">
                        {strategy.strategies?.map((s, sIdx) => (
                          <div
                            key={sIdx}
                            className="bg-[#0a0a0a] rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <span className="text-xl mt-0.5">
                                  {STRATEGY_ICONS[s.type] || '📋'}
                                </span>
                                <div>
                                  <h5 className="font-medium text-white">{s.title}</h5>
                                  <p className="text-sm text-gray-400 mt-1">{s.description}</p>
                                  {s.smsTemplate && (
                                    <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 font-mono">
                                      SMS: "{s.smsTemplate}"
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-4">
                                <p className="text-xs text-gray-500">Kutilgan natija</p>
                                <p className="text-sm font-medium text-green-400">
                                  {s.expectedImpact}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Xarajat: {s.cost}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-gray-400">Strategiyalar mavjud emas</p>
            <p className="text-gray-500 text-sm mt-1">
              Mijoz ma'lumotlari yig'ilgandan keyin tavsiyalar paydo bo'ladi
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {strategies && strategies.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
          <h4 className="text-sm font-medium text-blue-400 mb-3">⚡ Tezkor harakatlar</h4>
          <div className="flex flex-wrap gap-2">
            {strategies
              .filter(s => s.priority === 'critical' || s.priority === 'high')
              .flatMap(s => s.strategies || [])
              .slice(0, 4)
              .map((s, idx) => (
                <button
                  key={idx}
                  className="px-3 py-2 bg-[#1a1a1a] hover:bg-[#252525] rounded-lg text-sm text-gray-300 transition-colors flex items-center gap-2"
                >
                  {STRATEGY_ICONS[s.type] || '📋'}
                  {s.title}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RetentionStrategies;
