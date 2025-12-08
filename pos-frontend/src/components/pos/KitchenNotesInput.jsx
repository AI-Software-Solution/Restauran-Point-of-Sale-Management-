import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiAlertTriangle,
  FiInfo,
  FiMessageSquare,
  FiPlus,
  FiX,
  FiCheck
} from 'react-icons/fi'

const KitchenNotesInput = ({
  onAddNote,
  allergyPresets = [],
  prepPreferences = [],
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [noteType, setNoteType] = useState('general')
  const [noteText, setNoteText] = useState('')
  const [severity, setSeverity] = useState('low')
  const [selectedAllergies, setSelectedAllergies] = useState([])

  // Default allergy presets
  const defaultAllergyPresets = [
    { id: 1, name: 'Gluten', nameUz: 'Gluten', icon: '🌾', color: '#FFC107' },
    { id: 2, name: 'Nuts', nameUz: "Yong'oq", icon: '🥜', color: '#8B4513' },
    { id: 3, name: 'Dairy', nameUz: 'Sut', icon: '🥛', color: '#87CEEB' },
    { id: 4, name: 'Eggs', nameUz: 'Tuxum', icon: '🥚', color: '#FFE4B5' },
    { id: 5, name: 'Shellfish', nameUz: 'Dengiz', icon: '🦐', color: '#FF6347' },
    { id: 6, name: 'Spicy', nameUz: 'Achchiq', icon: '🌶️', color: '#DC3545' }
  ]

  // Default prep preferences
  const defaultPrepPreferences = [
    { category: "Go'sht pishirish", options: ['Rare', 'Medium', 'Well Done'] },
    { category: 'Achchiqlik', options: ['Achchiqsiz', 'Ozgina', "O'rtacha", 'Juda achchiq'] },
    { category: 'Tuz', options: ['Tuzsiz', 'Kam tuz', 'Normal'] }
  ]

  const allergies = allergyPresets.length > 0 ? allergyPresets : defaultAllergyPresets
  const preferences = prepPreferences.length > 0 ? prepPreferences : defaultPrepPreferences

  const handleAddNote = () => {
    if (!noteText && selectedAllergies.length === 0) return

    const note = {
      noteType,
      noteText: noteText || selectedAllergies.map(a => a.nameUz || a.name).join(', '),
      severity: noteType === 'allergy' ? 'critical' : severity,
      allergies: selectedAllergies
    }

    onAddNote?.(note)
    setNoteText('')
    setSelectedAllergies([])
    setIsOpen(false)
  }

  const toggleAllergy = (allergy) => {
    setSelectedAllergies(prev => {
      const exists = prev.find(a => a.id === allergy.id)
      if (exists) {
        return prev.filter(a => a.id !== allergy.id)
      }
      return [...prev, allergy]
    })
    setNoteType('allergy')
  }

  if (compact && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
      >
        <FiMessageSquare />
        <span className="text-sm">Izoh qo'shish</span>
      </button>
    )
  }

  return (
    <div className="relative">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        >
          <FiPlus />
          Oshxona uchun izoh qo'shish
        </button>
      )}

      {/* Notes Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-background)]">
              <h4 className="font-medium text-[var(--color-text)]">Oshxona izohi</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <FiX />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Note Type Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setNoteType('general')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${
                    noteType === 'general'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-background)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  <FiInfo />
                  Umumiy
                </button>
                <button
                  onClick={() => setNoteType('allergy')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${
                    noteType === 'allergy'
                      ? 'bg-red-500 text-white'
                      : 'bg-[var(--color-background)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  <FiAlertTriangle />
                  Allergiya
                </button>
                <button
                  onClick={() => setNoteType('preference')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${
                    noteType === 'preference'
                      ? 'bg-blue-500 text-white'
                      : 'bg-[var(--color-background)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  <FiMessageSquare />
                  Preferens
                </button>
              </div>

              {/* Allergy Quick Select */}
              {noteType === 'allergy' && (
                <div className="space-y-2">
                  <label className="text-sm text-[var(--color-text-secondary)]">Tez tanlash:</label>
                  <div className="flex flex-wrap gap-2">
                    {allergies.map(allergy => (
                      <button
                        key={allergy.id}
                        onClick={() => toggleAllergy(allergy)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedAllergies.find(a => a.id === allergy.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-[var(--color-background)] text-[var(--color-text)] border border-[var(--color-border)]'
                        }`}
                        style={{
                          borderColor: selectedAllergies.find(a => a.id === allergy.id)
                            ? 'transparent'
                            : allergy.color
                        }}
                      >
                        <span>{allergy.icon}</span>
                        {allergy.nameUz || allergy.name}
                        {selectedAllergies.find(a => a.id === allergy.id) && (
                          <FiCheck className="ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preference Quick Select */}
              {noteType === 'preference' && (
                <div className="space-y-3">
                  {preferences.map((pref, idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="text-sm text-[var(--color-text-secondary)]">{pref.category}:</label>
                      <div className="flex flex-wrap gap-2">
                        {pref.options.map((option, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => setNoteText(prev => prev ? `${prev}, ${option}` : option)}
                            className="px-3 py-1.5 rounded-full text-sm bg-[var(--color-background)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Note Input */}
              <div className="space-y-2">
                <label className="text-sm text-[var(--color-text-secondary)]">Qo'shimcha izoh:</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Maxsus ko'rsatmalar yozing..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  rows={2}
                />
              </div>

              {/* Severity (for non-allergy) */}
              {noteType !== 'allergy' && (
                <div className="flex items-center gap-4">
                  <label className="text-sm text-[var(--color-text-secondary)]">Muhimlik:</label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map(level => (
                      <button
                        key={level}
                        onClick={() => setSeverity(level)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          severity === level
                            ? level === 'high'
                              ? 'bg-red-500 text-white'
                              : level === 'medium'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-500 text-white'
                            : 'bg-[var(--color-background)] text-[var(--color-text-secondary)]'
                        }`}
                      >
                        {level === 'low' ? 'Past' : level === 'medium' ? "O'rta" : 'Yuqori'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!noteText && selectedAllergies.length === 0}
                  className="flex-1 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Qo'shish
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default KitchenNotesInput
