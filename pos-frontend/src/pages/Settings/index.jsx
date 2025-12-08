import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiGlobe,
  FiMoon,
  FiSun,
  FiCommand,
  FiDownload,
  FiUser,
  FiBell,
  FiShield,
  FiCheck,
  FiMonitor,
  FiSmartphone,
  FiSave,
  FiRefreshCw,
  FiDatabase,
  FiPrinter,
  FiWifi,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiVolume2,
  FiVolumeX,
  FiGift,
  FiStar,
  FiAward,
  FiPercent,
  FiUsers,
  FiCreditCard,
  FiPlus,
  FiTrash2,
  FiEdit
} from 'react-icons/fi'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getLoyaltyPrograms, updateLoyaltyProgram, getLoyaltyRewards, createLoyaltyReward, deleteLoyaltyReward } from '../../https'
import { enqueueSnackbar } from 'notistack'
import { useLanguage, languages } from '../../i18n'
import { useTheme } from '../../context/ThemeContext'
import { defaultShortcuts, KeyboardShortcutsHelp } from '../../hooks/useKeyboardShortcuts'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const Settings = () => {
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [saveStatus, setSaveStatus] = useState(null)

  const tabs = [
    { id: 'general', label: 'Umumiy', icon: FiUser },
    { id: 'appearance', label: "Ko'rinish", icon: FiMoon },
    { id: 'loyalty', label: 'Loyalty', icon: FiGift },
    { id: 'shortcuts', label: 'Klaviatura', icon: FiCommand },
    { id: 'notifications', label: 'Bildirishnomalar', icon: FiBell },
    { id: 'devices', label: 'Qurilmalar', icon: FiMonitor },
    { id: 'security', label: 'Xavfsizlik', icon: FiShield }
  ]

  const handleSave = () => {
    setSaveStatus('saving')
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 2000)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Sozlamalar</h1>
            <p className="text-[var(--color-text-secondary)] text-sm">
              Tizim sozlamalari va shaxsiy parametrlar
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saveStatus && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                  saveStatus === 'saving'
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'bg-green-500/10 text-green-500'
                }`}
              >
                {saveStatus === 'saving' ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    <span>Saqlanmoqda...</span>
                  </>
                ) : (
                  <>
                    <FiCheckCircle />
                    <span>Saqlandi</span>
                  </>
                )}
              </motion.div>
            )}
            <Button onClick={handleSave}>
              <FiSave className="mr-2" />
              Saqlash
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background)]'
              }`}
            >
              <tab.icon className="text-lg" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'general' && <GeneralTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
          {activeTab === 'loyalty' && <LoyaltyTab />}
          {activeTab === 'shortcuts' && <ShortcutsTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'devices' && <DevicesTab />}
          {activeTab === 'security' && <SecurityTab />}
        </motion.div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsHelp isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  )
}

// General Settings Tab
const GeneralTab = () => {
  const { language, setLanguage } = useLanguage()
  const [restaurantName, setRestaurantName] = useState('My Restaurant')
  const [currency, setCurrency] = useState('UZS')
  const [timezone, setTimezone] = useState('Asia/Tashkent')

  const currencies = [
    { code: 'UZS', name: "O'zbek so'mi", symbol: "so'm" },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' }
  ]

  return (
    <div className="space-y-6">
      {/* Restaurant Info */}
      <Card>
        <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <FiUser className="text-[var(--color-primary)]" />
          Restoran ma'lumotlari
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Restoran nomi"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="Restoran nomini kiriting"
          />
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Valyuta</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} - {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Vaqt zonasi</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            >
              <option value="Asia/Tashkent">Toshkent (UTC+5)</option>
              <option value="Asia/Samarkand">Samarqand (UTC+5)</option>
              <option value="Europe/Moscow">Moskva (UTC+3)</option>
              <option value="Europe/London">London (UTC+0)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Language Selection */}
      <Card>
        <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <FiGlobe className="text-[var(--color-primary)]" />
          Til / Language / Язык
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`p-4 rounded-lg border-2 transition-all ${
                language === lang.code
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-[var(--color-text)]">{lang.name}</span>
                </div>
                {language === lang.code && (
                  <FiCheck className="text-[var(--color-primary)] text-xl" />
                )}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Export Data */}
      <Card>
        <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <FiDownload className="text-[var(--color-primary)]" />
          Ma'lumotlarni eksport qilish
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Buyurtmalar', format: 'CSV', icon: FiDownload },
            { label: 'Mahsulotlar', format: 'Excel', icon: FiDownload },
            { label: 'Hisobot', format: 'PDF', icon: FiDownload },
            { label: 'Zaxira nusxa', format: 'SQL', icon: FiDatabase }
          ].map((item) => (
            <button
              key={item.label}
              className="p-4 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all text-left"
            >
              <item.icon className="text-[var(--color-primary)] mb-2" />
              <p className="text-[var(--color-text)] font-medium">{item.label}</p>
              <p className="text-[var(--color-text-secondary)] text-sm">{item.format}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

// Appearance Tab
const AppearanceTab = () => {
  const { theme, setTheme } = useTheme()
  const [fontSize, setFontSize] = useState(16)
  const [compactMode, setCompactMode] = useState(false)

  const themeOptions = [
    {
      id: 'light',
      name: 'Yorqin mavzu',
      subtitle: 'Light Mode',
      icon: FiSun,
      preview: { bg: '#F0F0F0', surface: '#FFFFFF', accent: '#714B67' }
    },
    {
      id: 'dark',
      name: "Qorong'i mavzu",
      subtitle: 'Dark Mode',
      icon: FiMoon,
      preview: { bg: '#1A1A2E', surface: '#252836', accent: '#9B7A91' }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <Card>
        <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
          {theme === 'dark' ? (
            <FiMoon className="text-[var(--color-primary)]" />
          ) : (
            <FiSun className="text-[var(--color-primary)]" />
          )}
          Mavzu / Theme
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setTheme(option.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                theme === option.id
                  ? 'border-[var(--color-primary)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: option.preview.bg }}
                >
                  <option.icon className="text-xl" style={{ color: option.preview.accent }} />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text)]">{option.name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">{option.subtitle}</p>
                </div>
                {theme === option.id && (
                  <FiCheck className="text-[var(--color-primary)] text-xl ml-auto" />
                )}
              </div>
              {/* Preview */}
              <div
                className="h-16 rounded-lg border p-2"
                style={{ backgroundColor: option.preview.bg, borderColor: option.preview.surface }}
              >
                <div
                  className="h-2 w-1/2 rounded mb-1"
                  style={{ backgroundColor: option.preview.surface }}
                />
                <div
                  className="h-2 w-3/4 rounded mb-1"
                  style={{ backgroundColor: option.preview.surface }}
                />
                <div
                  className="h-2 w-1/3 rounded"
                  style={{ backgroundColor: option.preview.accent }}
                />
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Font Size */}
      <Card>
        <h3 className="font-semibold text-[var(--color-text)] mb-4">Shrift o'lchami</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--color-text-secondary)]">Aa</span>
          <input
            type="range"
            min="12"
            max="20"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="flex-1 accent-[var(--color-primary)]"
          />
          <span className="text-xl text-[var(--color-text-secondary)]">Aa</span>
          <span className="text-[var(--color-text)] font-medium w-12 text-center">{fontSize}px</span>
        </div>
      </Card>

      {/* Display Options */}
      <Card>
        <h3 className="font-semibold text-[var(--color-text)] mb-4">Ko'rsatish sozlamalari</h3>
        <div className="space-y-4">
          <ToggleOption
            label="Ixcham rejim"
            description="Interfeys elementlarini kichikroq qilish"
            enabled={compactMode}
            onChange={setCompactMode}
          />
          <ToggleOption
            label="Animatsiyalar"
            description="UI animatsiyalarini yoqish"
            enabled={true}
            onChange={() => {}}
          />
          <ToggleOption
            label="Ranglar gradient"
            description="Gradient ranglarni ishlatish"
            enabled={true}
            onChange={() => {}}
          />
        </div>
      </Card>
    </div>
  )
}

// Loyalty Settings Tab
const LoyaltyTab = () => {
  const queryClient = useQueryClient()
  const [programForm, setProgramForm] = useState({
    isEnabled: true,
    pointsPerCurrency: 1,
    minPointsToRedeem: 100,
    pointValue: 100,
    welcomeBonus: 50,
    birthdayBonus: 100
  })
  const [tierSettings, setTierSettings] = useState({
    bronze: { minPoints: 0, discount: 0 },
    silver: { minPoints: 500, discount: 5 },
    gold: { minPoints: 2000, discount: 10 },
    platinum: { minPoints: 5000, discount: 15 }
  })
  const [showRewardForm, setShowRewardForm] = useState(false)
  const [rewardForm, setRewardForm] = useState({
    name: '',
    rewardType: 'discount',
    pointsRequired: 100,
    value: 10000,
    description: ''
  })

  // Fetch loyalty programs
  const { data: programsData } = useQuery({
    queryKey: ['loyaltyPrograms'],
    queryFn: getLoyaltyPrograms,
    onSuccess: (data) => {
      if (data?.[0]) {
        setProgramForm({
          isEnabled: data[0].isEnabled ?? true,
          pointsPerCurrency: data[0].pointsPerCurrency || 1,
          minPointsToRedeem: data[0].minPointsToRedeem || 100,
          pointValue: data[0].pointValue || 100,
          welcomeBonus: data[0].welcomeBonus || 50,
          birthdayBonus: data[0].birthdayBonus || 100
        })
      }
    }
  })

  // Fetch rewards
  const { data: rewardsData } = useQuery({
    queryKey: ['loyaltyRewards'],
    queryFn: getLoyaltyRewards
  })

  const rewards = rewardsData || []

  // Update program mutation
  const updateProgramMutation = useMutation({
    mutationFn: (data) => updateLoyaltyProgram(programsData?.[0]?.id || 1, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['loyaltyPrograms'])
      enqueueSnackbar('Loyalty sozlamalari saqlandi!', { variant: 'success' })
    },
    onError: () => {
      enqueueSnackbar('Xatolik yuz berdi!', { variant: 'error' })
    }
  })

  // Create reward mutation
  const createRewardMutation = useMutation({
    mutationFn: createLoyaltyReward,
    onSuccess: () => {
      queryClient.invalidateQueries(['loyaltyRewards'])
      setShowRewardForm(false)
      setRewardForm({ name: '', rewardType: 'discount', pointsRequired: 100, value: 10000, description: '' })
      enqueueSnackbar('Yangi mukofot qo\'shildi!', { variant: 'success' })
    }
  })

  // Delete reward mutation
  const deleteRewardMutation = useMutation({
    mutationFn: deleteLoyaltyReward,
    onSuccess: () => {
      queryClient.invalidateQueries(['loyaltyRewards'])
      enqueueSnackbar('Mukofot o\'chirildi!', { variant: 'success' })
    }
  })

  const handleSaveProgram = () => {
    updateProgramMutation.mutate({
      ...programForm,
      tierSettings
    })
  }

  const handleCreateReward = (e) => {
    e.preventDefault()
    createRewardMutation.mutate(rewardForm)
  }

  const tierColors = {
    bronze: 'from-amber-600 to-amber-800',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-400 to-purple-600'
  }

  const tierIcons = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎'
  }

  return (
    <div className="space-y-6">
      {/* Program Status */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)]/70 flex items-center justify-center">
              <FiGift className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">Loyalty Dasturi</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Mijozlar uchun ball to'plash va mukofot olish tizimi
              </p>
            </div>
          </div>
          <Toggle enabled={programForm.isEnabled} onChange={(val) => setProgramForm(prev => ({ ...prev, isEnabled: val }))} />
        </div>
      </Card>

      {programForm.isEnabled && (
        <>
          {/* Points Settings */}
          <Card>
            <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <FiStar className="text-[var(--color-primary)]" />
              Ball Sozlamalari
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Har 1000 so'm uchun ball
                </label>
                <input
                  type="number"
                  value={programForm.pointsPerCurrency}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, pointsPerCurrency: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  min="1"
                />
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Har 1000 so'm xarid uchun {programForm.pointsPerCurrency} ball beriladi
                </p>
              </div>

              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Minimal sarflash balli
                </label>
                <input
                  type="number"
                  value={programForm.minPointsToRedeem}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, minPointsToRedeem: parseInt(e.target.value) || 100 }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  min="10"
                />
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Chegirma olish uchun kamida {programForm.minPointsToRedeem} ball kerak
                </p>
              </div>

              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  1 ball qiymati (so'm)
                </label>
                <input
                  type="number"
                  value={programForm.pointValue}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, pointValue: parseInt(e.target.value) || 100 }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  min="1"
                />
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  100 ball = {(100 * programForm.pointValue).toLocaleString()} so'm chegirma
                </p>
              </div>

              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Ro'yxatdan o'tish bonusi
                </label>
                <input
                  type="number"
                  value={programForm.welcomeBonus}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, welcomeBonus: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  min="0"
                />
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Yangi a'zolarga {programForm.welcomeBonus} ball sovg'a qilinadi
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveProgram} loading={updateProgramMutation.isPending}>
                <FiSave className="mr-2" />
                Saqlash
              </Button>
            </div>
          </Card>

          {/* Tier Settings */}
          <Card>
            <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <FiAward className="text-[var(--color-primary)]" />
              Darajalar (Tiers)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(tierSettings).map(([tier, settings]) => (
                <div
                  key={tier}
                  className={`relative p-4 rounded-xl bg-gradient-to-br ${tierColors[tier]} text-white overflow-hidden`}
                >
                  <div className="absolute top-2 right-2 text-3xl opacity-30">
                    {tierIcons[tier]}
                  </div>
                  <h4 className="font-bold capitalize text-lg mb-3 flex items-center gap-2">
                    <span>{tierIcons[tier]}</span>
                    {tier}
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-white/70">Minimal ball</label>
                      <input
                        type="number"
                        value={settings.minPoints}
                        onChange={(e) => setTierSettings(prev => ({
                          ...prev,
                          [tier]: { ...prev[tier], minPoints: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-2 py-1 rounded bg-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/70">Chegirma %</label>
                      <input
                        type="number"
                        value={settings.discount}
                        onChange={(e) => setTierSettings(prev => ({
                          ...prev,
                          [tier]: { ...prev[tier], discount: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-2 py-1 rounded bg-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                        min="0"
                        max="50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Rewards Management */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
                <FiPercent className="text-[var(--color-primary)]" />
                Mukofotlar
              </h3>
              <Button variant="outline" size="sm" onClick={() => setShowRewardForm(!showRewardForm)}>
                <FiPlus className="mr-2" />
                Yangi mukofot
              </Button>
            </div>

            {/* Reward Form */}
            {showRewardForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateReward}
                className="p-4 rounded-lg bg-[var(--color-background)] mb-4 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Mukofot nomi"
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masalan: Bepul desert"
                    required
                  />
                  <div>
                    <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Turi</label>
                    <select
                      value={rewardForm.rewardType}
                      onChange={(e) => setRewardForm(prev => ({ ...prev, rewardType: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      <option value="discount">Chegirma (so'm)</option>
                      <option value="percentage">Chegirma (%)</option>
                      <option value="free_item">Bepul mahsulot</option>
                      <option value="bonus_points">Bonus ball</option>
                    </select>
                  </div>
                  <Input
                    label="Kerakli ball"
                    type="number"
                    value={rewardForm.pointsRequired}
                    onChange={(e) => setRewardForm(prev => ({ ...prev, pointsRequired: parseInt(e.target.value) || 0 }))}
                    min="1"
                    required
                  />
                  <Input
                    label={rewardForm.rewardType === 'percentage' ? 'Foiz (%)' : 'Qiymat (so\'m)'}
                    type="number"
                    value={rewardForm.value}
                    onChange={(e) => setRewardForm(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                    min="0"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" type="button" onClick={() => setShowRewardForm(false)}>
                    Bekor qilish
                  </Button>
                  <Button type="submit" loading={createRewardMutation.isPending}>
                    Qo'shish
                  </Button>
                </div>
              </motion.form>
            )}

            {/* Rewards List */}
            <div className="space-y-3">
              {rewards.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-text-secondary)]">
                  <FiGift className="mx-auto text-4xl mb-2 opacity-50" />
                  <p>Hali mukofotlar yo'q</p>
                  <p className="text-sm">Yangi mukofot qo'shish uchun yuqoridagi tugmani bosing</p>
                </div>
              ) : (
                rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                        {reward.rewardType === 'discount' && <FiCreditCard className="text-[var(--color-primary)]" />}
                        {reward.rewardType === 'percentage' && <FiPercent className="text-[var(--color-primary)]" />}
                        {reward.rewardType === 'free_item' && <FiGift className="text-[var(--color-primary)]" />}
                        {reward.rewardType === 'bonus_points' && <FiStar className="text-[var(--color-primary)]" />}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-text)]">{reward.name}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {reward.pointsRequired} ball = {' '}
                          {reward.rewardType === 'percentage'
                            ? `${reward.value}% chegirma`
                            : reward.rewardType === 'bonus_points'
                              ? `${reward.value} bonus ball`
                              : `${reward.value?.toLocaleString()} so'm`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteRewardMutation.mutate(reward.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Statistics Preview */}
          <Card className="bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 border-[var(--color-primary)]/20">
            <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <FiUsers className="text-[var(--color-primary)]" />
              Loyalty Statistikasi
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Jami a\'zolar', value: '1,234', change: '+12%' },
                { label: 'Faol a\'zolar', value: '876', change: '+8%' },
                { label: 'Berilgan ballar', value: '45,600', change: '+15%' },
                { label: 'Sarflangan ballar', value: '32,100', change: '+20%' }
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-lg bg-[var(--color-surface)]">
                  <p className="text-2xl font-bold text-[var(--color-primary)]">{stat.value}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
                  <span className="text-xs text-green-500">{stat.change}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

// Shortcuts Tab
const ShortcutsTab = () => {
  const shortcutGroups = {
    Navigatsiya: Object.entries(defaultShortcuts).filter(([_, s]) => s.action === 'navigate'),
    Amallar: Object.entries(defaultShortcuts).filter(([_, s]) => s.action !== 'navigate')
  }

  return (
    <div className="space-y-6">
      {Object.entries(shortcutGroups).map(([group, shortcuts]) => (
        <Card key={group}>
          <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <FiCommand className="text-[var(--color-primary)]" />
            {group}
          </h3>

          <div className="space-y-2">
            {shortcuts.map(([key, shortcut]) => (
              <div
                key={key}
                className="flex justify-between items-center p-3 rounded-lg bg-[var(--color-background)]"
              >
                <span className="text-[var(--color-text)]">{shortcut.label}</span>
                <kbd className="px-3 py-1.5 rounded text-sm font-mono bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] shadow-sm">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card className="bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="text-[var(--color-primary)] text-xl mt-0.5" />
          <div>
            <p className="text-[var(--color-text)] font-medium">Pro tip</p>
            <p className="text-[var(--color-text-secondary)] text-sm">
              Klaviatura yorliqlarini o'zgartirish uchun kerakli tugmani bosib turing va yangi
              tugmani tanlang.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Notifications Tab
const NotificationsTab = () => {
  const [notifications, setNotifications] = useState({
    newOrder: true,
    orderReady: true,
    lowStock: true,
    dailyReport: false,
    sound: true,
    desktop: false
  })

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const notificationItems = [
    {
      id: 'newOrder',
      label: 'Yangi buyurtma',
      description: 'Yangi buyurtma kelganda xabar berish',
      icon: FiBell
    },
    {
      id: 'orderReady',
      label: 'Buyurtma tayyor',
      description: "Buyurtma tayyorlanganda xabar berish (Oshxonadan)",
      icon: FiCheckCircle
    },
    {
      id: 'lowStock',
      label: 'Kam qolgan mahsulot',
      description: 'Omborda mahsulot kam qolganda ogohlantirish',
      icon: FiAlertCircle
    },
    {
      id: 'dailyReport',
      label: 'Kunlik hisobot',
      description: 'Har kuni soat 23:00 da hisobot yuborish',
      icon: FiDownload
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <FiBell className="text-[var(--color-primary)]" />
          Bildirishnoma turlari
        </h3>

        <div className="space-y-3">
          {notificationItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-background)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <item.icon className="text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="text-[var(--color-text)] font-medium">{item.label}</p>
                  <p className="text-[var(--color-text-secondary)] text-sm">{item.description}</p>
                </div>
              </div>
              <Toggle enabled={notifications[item.id]} onChange={() => toggleNotification(item.id)} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-[var(--color-text)] mb-4">Bildirishnoma usullari</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-background)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                {notifications.sound ? (
                  <FiVolume2 className="text-[var(--color-primary)]" />
                ) : (
                  <FiVolumeX className="text-[var(--color-text-secondary)]" />
                )}
              </div>
              <div>
                <p className="text-[var(--color-text)] font-medium">Ovozli bildirishnoma</p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Bildirishnomalar uchun ovoz signali
                </p>
              </div>
            </div>
            <Toggle enabled={notifications.sound} onChange={() => toggleNotification('sound')} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-background)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                <FiMonitor className="text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-[var(--color-text)] font-medium">Desktop bildirishnomalar</p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Brauzer orqali desktop bildirishnomalar
                </p>
              </div>
            </div>
            <Toggle enabled={notifications.desktop} onChange={() => toggleNotification('desktop')} />
          </div>
        </div>
      </Card>
    </div>
  )
}

// Devices Tab
const DevicesTab = () => {
  const devices = [
    { id: 1, name: 'POS Terminal 1', type: 'terminal', status: 'connected', lastSeen: 'Hozir faol' },
    {
      id: 2,
      name: 'Oshxona Display',
      type: 'display',
      status: 'connected',
      lastSeen: '2 daqiqa oldin'
    },
    {
      id: 3,
      name: 'Mobil Ofitsiant',
      type: 'mobile',
      status: 'disconnected',
      lastSeen: "1 soat oldin"
    }
  ]

  const printers = [
    { id: 1, name: 'Kassa Printer', location: 'Kassa', status: 'ready' },
    { id: 2, name: 'Oshxona Printer', location: 'Oshxona', status: 'ready' },
    { id: 3, name: 'Bar Printer', location: 'Bar', status: 'offline' }
  ]

  return (
    <div className="space-y-6">
      {/* Connected Devices */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
            <FiMonitor className="text-[var(--color-primary)]" />
            Ulangan qurilmalar
          </h3>
          <Button variant="outline" size="sm">
            <FiRefreshCw className="mr-2" />
            Yangilash
          </Button>
        </div>

        <div className="space-y-3">
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-background)]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    device.status === 'connected'
                      ? 'bg-green-500/10'
                      : 'bg-[var(--color-text-secondary)]/10'
                  }`}
                >
                  {device.type === 'terminal' && (
                    <FiMonitor
                      className={
                        device.status === 'connected'
                          ? 'text-green-500'
                          : 'text-[var(--color-text-secondary)]'
                      }
                    />
                  )}
                  {device.type === 'display' && (
                    <FiMonitor
                      className={
                        device.status === 'connected'
                          ? 'text-green-500'
                          : 'text-[var(--color-text-secondary)]'
                      }
                    />
                  )}
                  {device.type === 'mobile' && (
                    <FiSmartphone
                      className={
                        device.status === 'connected'
                          ? 'text-green-500'
                          : 'text-[var(--color-text-secondary)]'
                      }
                    />
                  )}
                </div>
                <div>
                  <p className="text-[var(--color-text)] font-medium">{device.name}</p>
                  <p className="text-[var(--color-text-secondary)] text-sm">{device.lastSeen}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  device.status === 'connected'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-[var(--color-text-secondary)]/10 text-[var(--color-text-secondary)]'
                }`}
              >
                {device.status === 'connected' ? 'Ulangan' : 'Uzilgan'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Printers */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
            <FiPrinter className="text-[var(--color-primary)]" />
            Printerlar
          </h3>
          <Button variant="outline" size="sm">
            <FiWifi className="mr-2" />
            Printer qo'shish
          </Button>
        </div>

        <div className="space-y-3">
          {printers.map((printer) => (
            <div
              key={printer.id}
              className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-background)]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    printer.status === 'ready' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}
                >
                  <FiPrinter
                    className={printer.status === 'ready' ? 'text-green-500' : 'text-red-500'}
                  />
                </div>
                <div>
                  <p className="text-[var(--color-text)] font-medium">{printer.name}</p>
                  <p className="text-[var(--color-text-secondary)] text-sm">{printer.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    printer.status === 'ready'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {printer.status === 'ready' ? 'Tayyor' : 'Offline'}
                </span>
                <Button variant="ghost" size="sm">
                  Test
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// Security Tab
const SecurityTab = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const sessions = [
    { device: 'Chrome - Linux', location: 'Toshkent', current: true, lastActive: 'Hozir faol' },
    {
      device: 'Safari - iPhone',
      location: 'Toshkent',
      current: false,
      lastActive: '2 soat oldin'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <FiLock className="text-[var(--color-primary)]" />
          Parolni o'zgartirish
        </h3>

        <div className="space-y-4 max-w-md">
          <div className="relative">
            <Input
              label="Joriy parol"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-8 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Yangi parol"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-8 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              {showNewPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <Input
            label="Yangi parolni tasdiqlang"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button>Parolni yangilash</Button>
        </div>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <FiShield className="text-[var(--color-primary)]" />
          Ikki bosqichli autentifikatsiya
        </h3>

        <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-background)]">
          <div>
            <p className="text-[var(--color-text)] font-medium">2FA</p>
            <p className="text-[var(--color-text-secondary)] text-sm">
              Qo'shimcha xavfsizlik qatlami
            </p>
          </div>
          <Toggle enabled={twoFactorEnabled} onChange={setTwoFactorEnabled} />
        </div>

        {twoFactorEnabled && (
          <div className="mt-4 p-4 rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary)]/5">
            <p className="text-[var(--color-text)] text-sm">
              2FA yoqilgan. Google Authenticator yoki shunga o'xshash ilovadan foydalaning.
            </p>
          </div>
        )}
      </Card>

      {/* Active Sessions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[var(--color-text)]">Faol sessiyalar</h3>
          <button className="text-red-500 hover:text-red-400 text-sm font-medium">
            Barchadan chiqish
          </button>
        </div>

        <div className="space-y-3">
          {sessions.map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-background)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <FiMonitor className="text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="text-[var(--color-text)] font-medium">{session.device}</p>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    {session.location} • {session.lastActive}
                  </p>
                </div>
              </div>
              {session.current ? (
                <span className="px-3 py-1 rounded-full text-sm bg-green-500/10 text-green-500">
                  Joriy
                </span>
              ) : (
                <button className="text-red-500 hover:text-red-400 text-sm">Chiqish</button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// Helper Components
const Toggle = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-12 h-6 rounded-full transition-colors ${
      enabled ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-0'
      }`}
    />
  </button>
)

const ToggleOption = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-background)]">
    <div>
      <p className="text-[var(--color-text)] font-medium">{label}</p>
      <p className="text-[var(--color-text-secondary)] text-sm">{description}</p>
    </div>
    <Toggle enabled={enabled} onChange={onChange} />
  </div>
)

export default Settings
