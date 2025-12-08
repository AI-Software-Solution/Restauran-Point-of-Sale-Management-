import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiDollarSign, FiPercent, FiHeart, FiCheck } from 'react-icons/fi'

const TipInput = ({
  orderTotal = 0,
  onAddTip,
  waiterId,
  compact = false
}) => {
  const [tipType, setTipType] = useState('percentage') // percentage or custom
  const [selectedPercentage, setSelectedPercentage] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [tipAdded, setTipAdded] = useState(false)

  const percentageOptions = [5, 10, 15, 20]

  const calculateTip = () => {
    if (tipType === 'percentage' && selectedPercentage) {
      return (orderTotal * selectedPercentage) / 100
    }
    return parseFloat(customAmount) || 0
  }

  const handleAddTip = () => {
    const tipAmount = calculateTip()
    if (tipAmount <= 0) return

    onAddTip?.({
      amount: tipAmount,
      percentage: tipType === 'percentage' ? selectedPercentage : null,
      waiterId
    })

    setTipAdded(true)
    setTimeout(() => setTipAdded(false), 3000)
  }

  const tipAmount = calculateTip()

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--color-text-secondary)]">Tip:</span>
        <div className="flex gap-1">
          {percentageOptions.slice(0, 3).map(pct => (
            <button
              key={pct}
              onClick={() => {
                setSelectedPercentage(pct)
                setTipType('percentage')
              }}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                selectedPercentage === pct
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-background)] text-[var(--color-text-secondary)]'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
        {tipAmount > 0 && (
          <span className="text-sm font-medium text-[var(--color-primary)]">
            +{tipAmount.toLocaleString()} so'm
          </span>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[var(--color-background)]">
        <FiHeart className="text-pink-500" />
        <span className="font-medium text-[var(--color-text)]">Choyxona (Tip)</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Type Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setTipType('percentage')
              setCustomAmount('')
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${
              tipType === 'percentage'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-background)] text-[var(--color-text-secondary)]'
            }`}
          >
            <FiPercent />
            Foiz
          </button>
          <button
            onClick={() => {
              setTipType('custom')
              setSelectedPercentage(null)
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${
              tipType === 'custom'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-background)] text-[var(--color-text-secondary)]'
            }`}
          >
            <FiDollarSign />
            Ixtiyoriy
          </button>
        </div>

        {/* Percentage Options */}
        {tipType === 'percentage' && (
          <div className="grid grid-cols-4 gap-2">
            {percentageOptions.map(pct => (
              <button
                key={pct}
                onClick={() => setSelectedPercentage(pct)}
                className={`py-3 rounded-lg text-center transition-colors ${
                  selectedPercentage === pct
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-background)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)]'
                }`}
              >
                <div className="font-bold text-lg">{pct}%</div>
                <div className="text-xs opacity-75">
                  {((orderTotal * pct) / 100).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Custom Amount Input */}
        {tipType === 'custom' && (
          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-secondary)]">Summa kiriting:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0"
                className="flex-1 px-4 py-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-lg text-right focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
              <span className="text-[var(--color-text-secondary)]">so'm</span>
            </div>
            {/* Quick amounts */}
            <div className="flex gap-2">
              {[5000, 10000, 20000, 50000].map(amount => (
                <button
                  key={amount}
                  onClick={() => setCustomAmount(amount.toString())}
                  className="flex-1 py-2 rounded-lg bg-[var(--color-background)] text-[var(--color-text)] text-sm border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                >
                  {(amount / 1000)}K
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {tipAmount > 0 && (
          <div className="p-3 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text)]">Tip summasi:</span>
              <span className="text-xl font-bold text-[var(--color-primary)]">
                {tipAmount.toLocaleString()} so'm
              </span>
            </div>
            {tipType === 'percentage' && (
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {orderTotal.toLocaleString()} x {selectedPercentage}%
              </p>
            )}
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={handleAddTip}
          disabled={tipAmount <= 0 || tipAdded}
          className={`w-full py-3 rounded-lg font-medium transition-all ${
            tipAdded
              ? 'bg-green-500 text-white'
              : tipAmount > 0
                ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90'
                : 'bg-[var(--color-border)] text-[var(--color-text-secondary)] cursor-not-allowed'
          }`}
        >
          {tipAdded ? (
            <span className="flex items-center justify-center gap-2">
              <FiCheck />
              Tip qo'shildi
            </span>
          ) : (
            `Tip qo'shish${tipAmount > 0 ? ` - ${tipAmount.toLocaleString()} so'm` : ''}`
          )}
        </button>
      </div>
    </motion.div>
  )
}

export default TipInput
