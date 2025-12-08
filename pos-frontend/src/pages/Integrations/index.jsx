import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiCreditCard,
  FiPrinter,
  FiBell,
  FiSettings,
  FiCheck,
  FiX,
  FiSave,
  FiRefreshCw,
  FiMessageSquare,
  FiMail,
  FiDollarSign,
  FiFileText
} from 'react-icons/fi'
import {
  getIntegrationSettings,
  updateIntegrationSettings,
  getPrinterStatus,
  generateReceipt,
  sendNotification
} from '../../https'

const Integrations = () => {
  const [activeTab, setActiveTab] = useState('payment')
  const queryClient = useQueryClient()

  const tabs = [
    { id: 'payment', label: "To'lov", icon: FiCreditCard },
    { id: 'printer', label: 'Printer', icon: FiPrinter },
    { id: 'notifications', label: 'Bildirishnomalar', icon: FiBell },
    { id: 'settings', label: 'Sozlamalar', icon: FiSettings }
  ]

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Integratsiyalar</h1>
        <p className="text-gray-400 mt-1">
          To'lov tizimlari, printer va bildirishnomalar sozlamalari
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white'
                : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#3d3d3d]'
            }`}
          >
            <tab.icon className="text-lg" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'payment' && <PaymentTab />}
          {activeTab === 'printer' && <PrinterTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Payment Tab
const PaymentTab = () => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['integrationSettings'],
    queryFn: getIntegrationSettings
  })

  const paymentMethods = [
    {
      id: 'click',
      name: 'Click',
      logo: '🔵',
      description: "Click to'lov tizimi orqali online to'lov",
      fields: ['serviceId', 'merchantId', 'secretKey']
    },
    {
      id: 'payme',
      name: 'Payme',
      logo: '🟢',
      description: "Payme to'lov tizimi orqali online to'lov",
      fields: ['merchantId', 'merchantKey']
    },
    {
      id: 'cash',
      name: 'Naqd pul',
      logo: '💵',
      description: "Naqd pul orqali to'lov",
      fields: []
    },
    {
      id: 'card',
      name: 'Plastik karta',
      logo: '💳',
      description: "POS terminal orqali karta to'lovi",
      fields: []
    }
  ]

  if (isLoading) return <LoadingSpinner />

  const paymentSettings = settings?.settings?.payment || {}

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="bg-[#2d2d2d] rounded-xl p-5 border border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{method.logo}</span>
                <div>
                  <h3 className="text-white font-semibold">{method.name}</h3>
                  <p className="text-gray-400 text-sm">{method.description}</p>
                </div>
              </div>
              <StatusBadge enabled={paymentSettings[method.id]?.enabled} />
            </div>

            {method.fields.length > 0 && (
              <div className="space-y-3 mt-4 pt-4 border-t border-gray-700">
                {method.fields.map((field) => (
                  <div key={field}>
                    <label className="text-gray-400 text-sm block mb-1">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                      defaultValue={paymentSettings[method.id]?.[field] || ''}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Test */}
      <div className="bg-[#2d2d2d] rounded-xl p-5 border border-gray-700">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <FiDollarSign /> To'lov test
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              className="bg-[#1a1a1a] hover:bg-[#3d3d3d] text-white px-4 py-3 rounded-lg transition-colors text-sm"
            >
              {method.logo} {method.name} test
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Printer Tab
const PrinterTab = () => {
  const [printerIp, setPrinterIp] = useState('192.168.1.100')
  const [testOrderId, setTestOrderId] = useState('')

  const { data: printerStatus, refetch: refetchPrinter } = useQuery({
    queryKey: ['printerStatus', printerIp],
    queryFn: () => getPrinterStatus(printerIp),
    enabled: false
  })

  const handleTestPrinter = () => {
    refetchPrinter()
  }

  const handleTestReceipt = async () => {
    if (!testOrderId) return
    try {
      await generateReceipt(testOrderId)
      alert('Chek yaratildi!')
    } catch (error) {
      alert('Xatolik: ' + error.message)
    }
  }

  return (
    <div className="space-y-4">
      {/* Printer Settings */}
      <div className="bg-[#2d2d2d] rounded-xl p-5 border border-gray-700">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <FiPrinter /> Printer sozlamalari
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Printer IP manzili</label>
            <input
              type="text"
              value={printerIp}
              onChange={(e) => setPrinterIp(e.target.value)}
              placeholder="192.168.1.100"
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Port</label>
            <input
              type="text"
              defaultValue="9100"
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleTestPrinter}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiRefreshCw /> Ulanishni tekshirish
          </button>
        </div>

        {printerStatus && (
          <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${printerStatus.printer?.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-white">
                {printerStatus.printer?.status === 'online' ? 'Printer ulangan' : 'Printer ulanmagan'}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Qog'oz: {printerStatus.printer?.paperStatus || 'N/A'}
            </p>
          </div>
        )}
      </div>

      {/* Receipt Preview */}
      <div className="bg-[#2d2d2d] rounded-xl p-5 border border-gray-700">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <FiFileText /> Chek test
        </h3>

        <div className="flex gap-3">
          <input
            type="text"
            value={testOrderId}
            onChange={(e) => setTestOrderId(e.target.value)}
            placeholder="Buyurtma ID kiriting"
            className="flex-1 bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
          />
          <button
            onClick={handleTestReceipt}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiPrinter /> Test chek
          </button>
        </div>

        {/* Sample Receipt Preview */}
        <div className="mt-4 p-4 bg-white text-black rounded-lg font-mono text-sm max-w-xs mx-auto">
          <div className="text-center font-bold">BOBUR MIRZO RESTAURANT</div>
          <div className="text-center text-xs">Toshkent shahri</div>
          <div className="text-center text-xs">+998 90 123 45 67</div>
          <div className="border-t border-dashed border-gray-400 my-2"></div>
          <div className="text-xs">Chek: R-123-ABC</div>
          <div className="text-xs">Sana: 26.11.2024 12:30</div>
          <div className="text-xs">Stol: 5</div>
          <div className="border-t border-dashed border-gray-400 my-2"></div>
          <div className="text-xs">Osh x2 - 60,000</div>
          <div className="text-xs">Shashlik x3 - 75,000</div>
          <div className="text-xs">Choy x2 - 10,000</div>
          <div className="border-t border-dashed border-gray-400 my-2"></div>
          <div className="font-bold">JAMI: 145,000 so'm</div>
          <div className="text-xs">To'lov: Naqd</div>
          <div className="border-t border-dashed border-gray-400 my-2"></div>
          <div className="text-center text-xs">Tashrifingiz uchun rahmat!</div>
        </div>
      </div>
    </div>
  )
}

// Notifications Tab
const NotificationsTab = () => {
  const [testPhone, setTestPhone] = useState('+998901234567')
  const [testMessage, setTestMessage] = useState('Test xabar')

  const sendTestMutation = useMutation({
    mutationFn: sendNotification,
    onSuccess: () => {
      alert('Xabar yuborildi!')
    },
    onError: (error) => {
      alert('Xatolik: ' + error.message)
    }
  })

  const handleTestSms = () => {
    sendTestMutation.mutate({
      type: 'sms',
      recipient: testPhone,
      message: testMessage
    })
  }

  const handleTestTelegram = () => {
    sendTestMutation.mutate({
      type: 'telegram',
      recipient: testPhone,
      message: testMessage
    })
  }

  return (
    <div className="space-y-4">
      {/* SMS Settings */}
      <div className="bg-[#2d2d2d] rounded-xl p-5 border border-gray-700">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <FiMessageSquare /> SMS sozlamalari (Eskiz.uz)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">API Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">API Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg">
          <p className="text-gray-400 text-sm">
            SMS xizmati uchun <a href="https://eskiz.uz" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Eskiz.uz</a> dan ro'yxatdan o'ting
          </p>
        </div>
      </div>

      {/* Telegram Settings */}
      <div className="bg-[#2d2d2d] rounded-xl p-5 border border-gray-700">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <FiMessageSquare /> Telegram Bot sozlamalari
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Bot Token</label>
            <input
              type="password"
              placeholder="123456789:ABC..."
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Chat ID</label>
            <input
              type="text"
              placeholder="-1001234567890"
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-[#2d2d2d] rounded-xl p-5 border border-gray-700">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <FiMail /> Email (SMTP) sozlamalari
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">SMTP Host</label>
            <input
              type="text"
              placeholder="smtp.gmail.com"
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Port</label>
            <input
              type="text"
              placeholder="587"
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>

      {/* Test Notifications */}
      <div className="bg-[#2d2d2d] rounded-xl p-5 border border-gray-700">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <FiBell /> Bildirishnoma test
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Telefon raqam</label>
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Xabar matni</label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleTestSms}
            disabled={sendTestMutation.isPending}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FiMessageSquare /> SMS yuborish
          </button>
          <button
            onClick={handleTestTelegram}
            disabled={sendTestMutation.isPending}
            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FiMessageSquare /> Telegram yuborish
          </button>
        </div>
      </div>
    </div>
  )
}

// Settings Tab
const SettingsTab = () => {
  const queryClient = useQueryClient()
  const { data: settings, isLoading } = useQuery({
    queryKey: ['integrationSettings'],
    queryFn: getIntegrationSettings
  })

  const updateMutation = useMutation({
    mutationFn: updateIntegrationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(['integrationSettings'])
      alert('Sozlamalar saqlandi!')
    }
  })

  const handleSave = () => {
    // Collect all settings and save
    updateMutation.mutate({ settings: settings?.settings })
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      {/* Auto Print Settings */}
      <div className="bg-[#2d2d2d] rounded-xl p-5 border border-gray-700">
        <h3 className="text-white font-semibold mb-4">Avtomatik chop etish</h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={settings?.settings?.printer?.autoPrint}
              className="w-5 h-5 rounded border-gray-600 bg-[#1a1a1a] text-orange-500 focus:ring-orange-500"
            />
            <span className="text-white">Yangi buyurtmada avtomatik chek chiqarish</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-5 h-5 rounded border-gray-600 bg-[#1a1a1a] text-orange-500 focus:ring-orange-500"
            />
            <span className="text-white">To'lovdan keyin avtomatik chek chiqarish</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={false}
              className="w-5 h-5 rounded border-gray-600 bg-[#1a1a1a] text-orange-500 focus:ring-orange-500"
            />
            <span className="text-white">Oshxonaga buyurtma cheki chiqarish</span>
          </label>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-[#2d2d2d] rounded-xl p-5 border border-gray-700">
        <h3 className="text-white font-semibold mb-4">Bildirishnoma sozlamalari</h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-5 h-5 rounded border-gray-600 bg-[#1a1a1a] text-orange-500 focus:ring-orange-500"
            />
            <span className="text-white">Buyurtma tayyor bo'lganda SMS yuborish</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-5 h-5 rounded border-gray-600 bg-[#1a1a1a] text-orange-500 focus:ring-orange-500"
            />
            <span className="text-white">Kam qolgan mahsulotlar haqida ogohlantirish</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={false}
              className="w-5 h-5 rounded border-gray-600 bg-[#1a1a1a] text-orange-500 focus:ring-orange-500"
            />
            <span className="text-white">Kunlik hisobot yuborish</span>
          </label>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="bg-[#2d2d2d] rounded-xl p-5 border border-gray-700">
        <h3 className="text-white font-semibold mb-4">Restoran ma'lumotlari (chek uchun)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Restoran nomi</label>
            <input
              type="text"
              defaultValue="Bobur Mirzo Restaurant"
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Telefon</label>
            <input
              type="text"
              defaultValue="+998 90 123 45 67"
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-gray-400 text-sm block mb-1">Manzil</label>
            <input
              type="text"
              defaultValue="Toshkent shahri, Chilonzor tumani"
              className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <FiSave /> Sozlamalarni saqlash
        </button>
      </div>
    </div>
  )
}

// Helper Components
const StatusBadge = ({ enabled }) => (
  <span
    className={`px-2 py-1 rounded-full text-xs font-medium ${
      enabled
        ? 'bg-green-500/20 text-green-400'
        : 'bg-gray-500/20 text-gray-400'
    }`}
  >
    {enabled ? (
      <span className="flex items-center gap-1">
        <FiCheck /> Faol
      </span>
    ) : (
      <span className="flex items-center gap-1">
        <FiX /> O'chirilgan
      </span>
    )}
  </span>
)

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

export default Integrations
