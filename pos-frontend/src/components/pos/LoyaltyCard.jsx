import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSearch,
  FiGift,
  FiStar,
  FiUser,
  FiPhone,
  FiAward,
  FiPlus,
  FiMinus,
  FiCheck,
  FiX,
  FiCreditCard
} from 'react-icons/fi'

const LoyaltyCard = ({
  onMemberFound,
  onEarnPoints,
  onRedeemPoints,
  orderTotal = 0,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchPhone, setSearchPhone] = useState('')
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [redeemMode, setRedeemMode] = useState(false)
  const [pointsToRedeem, setPointsToRedeem] = useState(0)

  // Mock search - bu API dan olinadi
  const searchMember = async () => {
    if (!searchPhone || searchPhone.length < 9) return

    setLoading(true)
    setError('')

    try {
      // API call simulation
      // const response = await fetch(`/api/loyalty/members/phone/${searchPhone}`)
      // const data = await response.json()

      // Mock data
      setTimeout(() => {
        const mockMember = {
          id: 1,
          name: 'Aziz Karimov',
          phone: searchPhone,
          cardNumber: 'LOY12345678',
          currentPoints: 1250,
          tier: 'gold',
          totalSpent: 5500000,
          visitCount: 45,
          lastVisit: new Date().toISOString()
        }

        setMember(mockMember)
        onMemberFound?.(mockMember)
        setLoading(false)
      }, 500)
    } catch (err) {
      setError('Mijoz topilmadi')
      setLoading(false)
    }
  }

  // Calculate points to earn
  const pointsToEarn = Math.floor(orderTotal * 0.01) // 1 ball per 100 so'm

  // Handle redeem
  const handleRedeem = () => {
    if (!member || pointsToRedeem <= 0 || pointsToRedeem > member.currentPoints) return

    onRedeemPoints?.({
      memberId: member.id,
      points: pointsToRedeem,
      discountValue: pointsToRedeem * 100 // 1 ball = 100 so'm
    })

    setMember(prev => ({
      ...prev,
      currentPoints: prev.currentPoints - pointsToRedeem
    }))
    setPointsToRedeem(0)
    setRedeemMode(false)
  }

  // Get tier info
  const getTierInfo = (tier) => {
    switch (tier) {
      case 'platinum':
        return { color: '#E5E4E2', icon: '💎', label: 'Platinum' }
      case 'gold':
        return { color: '#FFD700', icon: '🥇', label: 'Gold' }
      case 'silver':
        return { color: '#C0C0C0', icon: '🥈', label: 'Silver' }
      default:
        return { color: '#CD7F32', icon: '🥉', label: 'Bronze' }
    }
  }

  if (compact && !isOpen && !member) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
      >
        <FiGift />
        <span className="text-sm">Loyalty</span>
      </button>
    )
  }

  return (
    <div className="relative">
      {/* Member Badge (if found) */}
      {member && !isOpen && (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/80 text-white"
        >
          <div className="text-xl">{getTierInfo(member.tier).icon}</div>
          <div className="text-left">
            <p className="font-medium text-sm">{member.name}</p>
            <p className="text-xs opacity-75">{member.currentPoints} ball</p>
          </div>
        </motion.button>
      )}

      {/* Toggle Button (if no member) */}
      {!member && !isOpen && !compact && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        >
          <FiGift />
          Loyalty kartani qo'shish
        </button>
      )}

      {/* Main Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/80 text-white">
              <div className="flex items-center gap-2">
                <FiGift />
                <span className="font-medium">Loyalty Program</span>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <FiX />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Search */}
              {!member && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                      <input
                        type="tel"
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchMember()}
                        placeholder="+998 90 123 45 67"
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                    <button
                      onClick={searchMember}
                      disabled={loading}
                      className="px-4 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50"
                    >
                      {loading ? '...' : <FiSearch />}
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}
                </div>
              )}

              {/* Member Info */}
              {member && (
                <div className="space-y-4">
                  {/* Profile Card */}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${getTierInfo(member.tier).color}22, ${getTierInfo(member.tier).color}11)`
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-2xl">
                          {getTierInfo(member.tier).icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-[var(--color-text)]">{member.name}</h4>
                          <p className="text-sm text-[var(--color-text-secondary)]">{member.phone}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setMember(null)
                          setSearchPhone('')
                        }}
                        className="text-[var(--color-text-secondary)] hover:text-red-500"
                      >
                        <FiX />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-2 rounded-lg bg-[var(--color-surface)]">
                        <p className="text-2xl font-bold text-[var(--color-primary)]">{member.currentPoints}</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">Ball</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[var(--color-surface)]">
                        <p className="text-2xl font-bold text-[var(--color-text)]">{member.visitCount}</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">Tashrif</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[var(--color-surface)]">
                        <p className="font-bold text-[var(--color-text)]" style={{ color: getTierInfo(member.tier).color }}>
                          {getTierInfo(member.tier).label}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">Daraja</p>
                      </div>
                    </div>
                  </div>

                  {/* Points to Earn */}
                  {orderTotal > 0 && !redeemMode && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-600">
                          <FiPlus />
                          <span>Bu buyurtma uchun:</span>
                        </div>
                        <span className="font-bold text-green-600">+{pointsToEarn} ball</span>
                      </div>
                    </div>
                  )}

                  {/* Redeem Section */}
                  {redeemMode ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--color-text)]">Sarflash uchun ball:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPointsToRedeem(Math.max(0, pointsToRedeem - 100))}
                            className="w-8 h-8 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)]"
                          >
                            <FiMinus />
                          </button>
                          <input
                            type="number"
                            value={pointsToRedeem}
                            onChange={(e) => setPointsToRedeem(Math.min(member.currentPoints, parseInt(e.target.value) || 0))}
                            className="w-20 text-center py-1 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)]"
                          />
                          <button
                            onClick={() => setPointsToRedeem(Math.min(member.currentPoints, pointsToRedeem + 100))}
                            className="w-8 h-8 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)]"
                          >
                            <FiPlus />
                          </button>
                        </div>
                      </div>

                      {pointsToRedeem > 0 && (
                        <div className="p-3 rounded-lg bg-[var(--color-primary)]/10">
                          <div className="flex items-center justify-between">
                            <span className="text-[var(--color-text)]">Chegirma:</span>
                            <span className="font-bold text-[var(--color-primary)]">
                              -{(pointsToRedeem * 100).toLocaleString()} so'm
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setRedeemMode(false)
                            setPointsToRedeem(0)
                          }}
                          className="flex-1 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)]"
                        >
                          Bekor qilish
                        </button>
                        <button
                          onClick={handleRedeem}
                          disabled={pointsToRedeem <= 0}
                          className="flex-1 py-2 rounded-lg bg-[var(--color-primary)] text-white disabled:opacity-50"
                        >
                          Sarflash
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRedeemMode(true)}
                      disabled={member.currentPoints < 100}
                      className="w-full py-3 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <FiGift />
                      Ball sarflash
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LoyaltyCard
