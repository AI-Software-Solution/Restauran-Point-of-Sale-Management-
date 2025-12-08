import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX,
  FiUsers,
  FiDivideCircle,
  FiDollarSign,
  FiCheck,
  FiCreditCard,
  FiUser,
  FiPercent,
  FiGrid,
  FiList
} from 'react-icons/fi'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

const BillSplitModal = ({ isOpen, onClose, order, onSplitComplete }) => {
  const [splitType, setSplitType] = useState('equal') // equal, by_item, custom
  const [totalGuests, setTotalGuests] = useState(2)
  const [guestBills, setGuestBills] = useState([])
  const [selectedItems, setSelectedItems] = useState({}) // { guestNumber: [items] }
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: select type, 2: assign items, 3: payment

  const orderTotal = order?.bills?.totalPayable || 0
  const orderItems = order?.items || []
  const taxRate = order?.bills?.tax ? parseFloat(order.bills.tax) / parseFloat(order.bills.subtotal) : 0.1

  // Initialize guest bills
  useEffect(() => {
    if (splitType === 'equal') {
      const amountPerGuest = orderTotal / totalGuests
      const bills = Array.from({ length: totalGuests }, (_, i) => ({
        guestNumber: i + 1,
        guestName: `Mehmon ${i + 1}`,
        total: amountPerGuest.toFixed(0),
        items: [],
        paid: false
      }))
      setGuestBills(bills)
    } else if (splitType === 'by_item') {
      const bills = Array.from({ length: totalGuests }, (_, i) => ({
        guestNumber: i + 1,
        guestName: `Mehmon ${i + 1}`,
        total: 0,
        items: [],
        paid: false
      }))
      setGuestBills(bills)
      setSelectedItems({})
    } else if (splitType === 'custom') {
      const bills = Array.from({ length: totalGuests }, (_, i) => ({
        guestNumber: i + 1,
        guestName: `Mehmon ${i + 1}`,
        total: 0,
        items: [],
        paid: false
      }))
      setGuestBills(bills)
    }
  }, [splitType, totalGuests, orderTotal])

  // Assign item to guest
  const assignItemToGuest = (item, guestNumber) => {
    setSelectedItems(prev => {
      const newItems = { ...prev }

      // Remove from other guests
      Object.keys(newItems).forEach(key => {
        newItems[key] = newItems[key].filter(i => i.id !== item.id)
      })

      // Add to selected guest
      if (!newItems[guestNumber]) {
        newItems[guestNumber] = []
      }
      newItems[guestNumber].push(item)

      return newItems
    })

    // Update guest totals
    setGuestBills(prev => prev.map(guest => {
      const guestItems = selectedItems[guest.guestNumber] || []
      if (guest.guestNumber === guestNumber) {
        guestItems.push(item)
      }
      const subtotal = guestItems.reduce((sum, i) => sum + (i.price * i.quantity), 0)
      const total = subtotal * (1 + taxRate)
      return {
        ...guest,
        items: guest.guestNumber === guestNumber ? [...guestItems] : guest.items,
        total: total.toFixed(0)
      }
    }))
  }

  // Update custom amount
  const updateCustomAmount = (guestNumber, amount) => {
    setGuestBills(prev => prev.map(guest =>
      guest.guestNumber === guestNumber
        ? { ...guest, total: amount }
        : guest
    ))
  }

  // Mark guest as paid
  const markGuestPaid = (guestNumber, method = 'cash') => {
    setGuestBills(prev => prev.map(guest =>
      guest.guestNumber === guestNumber
        ? { ...guest, paid: true, paymentMethod: method }
        : guest
    ))
  }

  // Check if all paid
  const allPaid = guestBills.every(g => g.paid)
  const totalPaid = guestBills.filter(g => g.paid).reduce((sum, g) => sum + parseFloat(g.total), 0)
  const remaining = orderTotal - totalPaid

  // Handle complete
  const handleComplete = async () => {
    setLoading(true)
    try {
      // API call to create bill split
      // await createBillSplit({ orderId: order.id, splitType, totalGuests, guestBills })
      onSplitComplete?.(guestBills)
      onClose()
    } catch (error) {
      console.error('Split error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hisobni bo'lish" size="xl">
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-1 mx-2 rounded ${
                  step > s ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Split Type */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Bo'lish turini tanlang</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">Jami: {parseInt(orderTotal).toLocaleString()} so'm</p>
            </div>

            {/* Guest Count */}
            <div className="flex items-center justify-center gap-4 p-4 bg-[var(--color-background)] rounded-xl">
              <FiUsers className="text-[var(--color-primary)] text-xl" />
              <span className="text-[var(--color-text)]">Mehmonlar soni:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTotalGuests(Math.max(2, totalGuests - 1))}
                  className="w-8 h-8 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center text-xl font-bold text-[var(--color-text)]">{totalGuests}</span>
                <button
                  onClick={() => setTotalGuests(totalGuests + 1)}
                  className="w-8 h-8 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Split Type Options */}
            <div className="grid grid-cols-3 gap-4">
              {/* Equal Split */}
              <button
                onClick={() => setSplitType('equal')}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  splitType === 'equal'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                }`}
              >
                <FiDivideCircle className="text-3xl mx-auto mb-2 text-[var(--color-primary)]" />
                <p className="font-medium text-[var(--color-text)]">Teng bo'lish</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {(orderTotal / totalGuests).toLocaleString()} so'm / kishi
                </p>
              </button>

              {/* By Item */}
              <button
                onClick={() => setSplitType('by_item')}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  splitType === 'by_item'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                }`}
              >
                <FiList className="text-3xl mx-auto mb-2 text-[var(--color-primary)]" />
                <p className="font-medium text-[var(--color-text)]">Mahsulot bo'yicha</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Har bir mahsulotni tanlash
                </p>
              </button>

              {/* Custom */}
              <button
                onClick={() => setSplitType('custom')}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  splitType === 'custom'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                }`}
              >
                <FiDollarSign className="text-3xl mx-auto mb-2 text-[var(--color-primary)]" />
                <p className="font-medium text-[var(--color-text)]">Ixtiyoriy</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Summalarni kiritish
                </p>
              </button>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                Davom etish
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Assign Items / Set Amounts */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {splitType === 'equal' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {guestBills.map(guest => (
                  <div
                    key={guest.guestNumber}
                    className="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                        <FiUser className="text-[var(--color-primary)]" />
                      </div>
                      <input
                        type="text"
                        value={guest.guestName}
                        onChange={(e) => setGuestBills(prev => prev.map(g =>
                          g.guestNumber === guest.guestNumber ? { ...g, guestName: e.target.value } : g
                        ))}
                        className="flex-1 bg-transparent border-none text-[var(--color-text)] font-medium focus:outline-none"
                      />
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-primary)]">
                      {parseInt(guest.total).toLocaleString()} <span className="text-sm">so'm</span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {splitType === 'by_item' && (
              <div className="grid grid-cols-2 gap-4">
                {/* Items List */}
                <div className="space-y-2">
                  <h4 className="font-medium text-[var(--color-text)] mb-2">Mahsulotlar</h4>
                  {orderItems.map((item, index) => {
                    const assignedTo = Object.entries(selectedItems).find(([_, items]) =>
                      items.some(i => i.id === item.id || i.name === item.name)
                    )?.[0]

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border transition-all ${
                          assignedTo
                            ? 'bg-green-500/10 border-green-500'
                            : 'bg-[var(--color-background)] border-[var(--color-border)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[var(--color-text)] font-medium">{item.name}</p>
                            <p className="text-[var(--color-text-secondary)] text-sm">
                              {item.quantity} x {parseInt(item.price).toLocaleString()} so'm
                            </p>
                          </div>
                          <select
                            value={assignedTo || ''}
                            onChange={(e) => assignItemToGuest({ ...item, id: index }, parseInt(e.target.value))}
                            className="px-3 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm"
                          >
                            <option value="">Tanlang</option>
                            {guestBills.map(g => (
                              <option key={g.guestNumber} value={g.guestNumber}>
                                {g.guestName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Guest Totals */}
                <div className="space-y-2">
                  <h4 className="font-medium text-[var(--color-text)] mb-2">Mehmonlar</h4>
                  {guestBills.map(guest => (
                    <div
                      key={guest.guestNumber}
                      className="p-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--color-text)]">{guest.guestName}</span>
                        <span className="font-bold text-[var(--color-primary)]">
                          {parseInt(guest.total).toLocaleString()} so'm
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {splitType === 'custom' && (
              <div className="space-y-3">
                {guestBills.map(guest => (
                  <div
                    key={guest.guestNumber}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                      <FiUser className="text-[var(--color-primary)]" />
                    </div>
                    <input
                      type="text"
                      value={guest.guestName}
                      onChange={(e) => setGuestBills(prev => prev.map(g =>
                        g.guestNumber === guest.guestNumber ? { ...g, guestName: e.target.value } : g
                      ))}
                      className="flex-1 bg-transparent border-none text-[var(--color-text)] font-medium focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={guest.total}
                        onChange={(e) => updateCustomAmount(guest.guestNumber, e.target.value)}
                        className="w-32 px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-right"
                      />
                      <span className="text-[var(--color-text-secondary)]">so'm</span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--color-primary)]/10">
                  <span className="text-[var(--color-text)]">Jami kiritilgan:</span>
                  <span className={`font-bold ${
                    guestBills.reduce((sum, g) => sum + parseFloat(g.total || 0), 0) === orderTotal
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}>
                    {guestBills.reduce((sum, g) => sum + parseFloat(g.total || 0), 0).toLocaleString()} / {parseInt(orderTotal).toLocaleString()} so'm
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Orqaga
              </Button>
              <Button onClick={() => setStep(3)}>
                To'lovga o'tish
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {guestBills.map(guest => (
                <div
                  key={guest.guestNumber}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    guest.paid
                      ? 'bg-green-500/10 border-green-500'
                      : 'bg-[var(--color-background)] border-[var(--color-border)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[var(--color-text)] font-medium">{guest.guestName}</span>
                    {guest.paid && <FiCheck className="text-green-500" />}
                  </div>
                  <p className="text-2xl font-bold text-[var(--color-text)] mb-3">
                    {parseInt(guest.total).toLocaleString()} <span className="text-sm">so'm</span>
                  </p>
                  {!guest.paid ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => markGuestPaid(guest.guestNumber, 'cash')}
                        className="flex-1 py-2 px-3 rounded-lg bg-green-500 text-white text-sm hover:bg-green-600 transition-colors"
                      >
                        Naqd
                      </button>
                      <button
                        onClick={() => markGuestPaid(guest.guestNumber, 'card')}
                        className="flex-1 py-2 px-3 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <FiCreditCard /> Karta
                      </button>
                    </div>
                  ) : (
                    <p className="text-center text-green-500 text-sm">
                      ✓ {guest.paymentMethod === 'cash' ? 'Naqd' : 'Karta'} orqali to'landi
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[var(--color-text-secondary)]">To'langan:</span>
                <span className="text-green-500 font-bold">{totalPaid.toLocaleString()} so'm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-secondary)]">Qolgan:</span>
                <span className={`font-bold ${remaining > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {remaining.toLocaleString()} so'm
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Orqaga
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!allPaid || loading}
              >
                {loading ? 'Saqlanmoqda...' : allPaid ? 'Yakunlash' : 'Barcha to\'lovlarni kutmoqda'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  )
}

export default BillSplitModal
