import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// Default keyboard shortcuts
export const defaultShortcuts = {
  // Navigation
  'Alt+H': { action: 'navigate', path: '/home', label: 'Bosh sahifa' },
  'Alt+O': { action: 'navigate', path: '/orders', label: 'Buyurtmalar' },
  'Alt+T': { action: 'navigate', path: '/tables', label: 'Stollar' },
  'Alt+M': { action: 'navigate', path: '/menu', label: 'Menyu' },
  'Alt+D': { action: 'navigate', path: '/dashboard', label: 'Dashboard' },
  'Alt+I': { action: 'navigate', path: '/inventory', label: 'Ombor' },
  'Alt+F': { action: 'navigate', path: '/floor-plan', label: 'Zal rejasi' },
  'Alt+A': { action: 'navigate', path: '/analytics', label: 'Analitika' },

  // Actions
  'Alt+N': { action: 'newOrder', label: 'Yangi buyurtma' },
  'Alt+S': { action: 'search', label: 'Qidirish' },
  'Alt+P': { action: 'print', label: 'Chop etish' },
  'Escape': { action: 'closeModal', label: 'Modalni yopish' },

  // Quick actions
  'Ctrl+Enter': { action: 'submit', label: 'Yuborish' },
  'Ctrl+S': { action: 'save', label: 'Saqlash' }
}

export const useKeyboardShortcuts = (customHandlers = {}) => {
  const navigate = useNavigate()

  const handleKeyDown = useCallback((event) => {
    // Build the key combination string
    const keys = []
    if (event.ctrlKey || event.metaKey) keys.push('Ctrl')
    if (event.altKey) keys.push('Alt')
    if (event.shiftKey) keys.push('Shift')

    // Get the actual key
    let key = event.key
    if (key === ' ') key = 'Space'
    if (key.length === 1) key = key.toUpperCase()

    keys.push(key)
    const combo = keys.join('+')

    // Check if this combo is in shortcuts
    const shortcut = defaultShortcuts[combo]
    if (!shortcut) return

    // Prevent default browser behavior for our shortcuts
    event.preventDefault()

    // Handle the action
    switch (shortcut.action) {
      case 'navigate':
        navigate(shortcut.path)
        break

      case 'newOrder':
        if (customHandlers.onNewOrder) {
          customHandlers.onNewOrder()
        } else {
          navigate('/orders')
        }
        break

      case 'search':
        if (customHandlers.onSearch) {
          customHandlers.onSearch()
        }
        break

      case 'print':
        if (customHandlers.onPrint) {
          customHandlers.onPrint()
        } else {
          window.print()
        }
        break

      case 'closeModal':
        if (customHandlers.onCloseModal) {
          customHandlers.onCloseModal()
        }
        break

      case 'submit':
        if (customHandlers.onSubmit) {
          customHandlers.onSubmit()
        }
        break

      case 'save':
        if (customHandlers.onSave) {
          customHandlers.onSave()
        }
        break

      default:
        // Check for custom handler
        if (customHandlers[shortcut.action]) {
          customHandlers[shortcut.action]()
        }
    }
  }, [navigate, customHandlers])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { shortcuts: defaultShortcuts }
}

// Component to display keyboard shortcuts help
export const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const shortcutGroups = {
    'Navigatsiya': Object.entries(defaultShortcuts).filter(([_, s]) => s.action === 'navigate'),
    'Amallar': Object.entries(defaultShortcuts).filter(([_, s]) => s.action !== 'navigate')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#2d2d2d] rounded-xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Klaviatura tugmalari</h2>

        {Object.entries(shortcutGroups).map(([group, shortcuts]) => (
          <div key={group} className="mb-4">
            <h3 className="text-orange-500 font-medium mb-2">{group}</h3>
            <div className="space-y-2">
              {shortcuts.map(([key, shortcut]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-400">{shortcut.label}</span>
                  <kbd className="bg-[#1a1a1a] text-white px-2 py-1 rounded text-sm font-mono">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg"
        >
          Yopish
        </button>
      </div>
    </div>
  )
}

export default useKeyboardShortcuts
