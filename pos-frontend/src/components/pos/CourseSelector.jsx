import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlay,
  FiClock,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiAlertCircle,
  FiSend
} from 'react-icons/fi'

const CourseSelector = ({
  courses = [],
  orderCourses = [],
  onFireCourse,
  onFireNext,
  onStatusChange,
  compact = false
}) => {
  const [expanded, setExpanded] = useState(!compact)

  // Default courses agar backend dan kelmasa
  const defaultCourses = [
    { id: 1, name: 'Appetizer', nameUz: 'Salatlar', displayOrder: 1, color: '#28A745', icon: '🥗' },
    { id: 2, name: 'Soup', nameUz: "Sho'rvalar", displayOrder: 2, color: '#FFC107', icon: '🍜' },
    { id: 3, name: 'Main Course', nameUz: 'Asosiy taom', displayOrder: 3, color: '#714B67', icon: '🍽️' },
    { id: 4, name: 'Dessert', nameUz: 'Shirinlik', displayOrder: 4, color: '#E91E63', icon: '🍰' },
    { id: 5, name: 'Drinks', nameUz: 'Ichimliklar', displayOrder: 5, color: '#17A2B8', icon: '🥤' }
  ]

  const activeCourses = courses.length > 0 ? courses : defaultCourses

  // Get course status
  const getCourseStatus = (courseId) => {
    const orderCourse = orderCourses.find(oc => oc.courseId === courseId)
    return orderCourse?.courseStatus || 'waiting'
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'bg-gray-500'
      case 'fired': return 'bg-orange-500'
      case 'preparing': return 'bg-yellow-500'
      case 'ready': return 'bg-green-500'
      case 'served': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'waiting': return 'Kutmoqda'
      case 'fired': return 'Yuborildi'
      case 'preparing': return 'Tayyorlanmoqda'
      case 'ready': return 'Tayyor'
      case 'served': return 'Berildi'
      default: return 'Kutmoqda'
    }
  }

  // Find next course to fire
  const nextCourseToFire = activeCourses.find(course => {
    const status = getCourseStatus(course.id)
    return status === 'waiting'
  })

  if (compact && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors"
      >
        <span className="text-lg">🍽️</span>
        <span className="text-sm">Kurslar</span>
        <FiChevronDown className="text-[var(--color-text-secondary)]" />
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-[var(--color-background)] cursor-pointer"
        onClick={() => compact && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🍽️</span>
          <span className="font-medium text-[var(--color-text)]">Kurslar ketma-ketligi</span>
        </div>
        {compact && (
          <button className="text-[var(--color-text-secondary)]">
            {expanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        )}
        {nextCourseToFire && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onFireNext?.()
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[var(--color-primary)] text-white text-sm hover:bg-[var(--color-primary)]/90 transition-colors"
          >
            <FiSend className="text-xs" />
            Keyingisini yuborish
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {/* Course Timeline */}
            <div className="p-4">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[var(--color-border)]" />

                {/* Courses */}
                <div className="space-y-4">
                  {activeCourses.map((course, index) => {
                    const status = getCourseStatus(course.id)
                    const isLast = index === activeCourses.length - 1

                    return (
                      <div key={course.id} className="relative flex items-start gap-4">
                        {/* Timeline Dot */}
                        <div
                          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg ${getStatusColor(status)}`}
                        >
                          {course.icon || '🍽️'}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-[var(--color-text)]">
                                {course.nameUz || course.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs text-white ${getStatusColor(status)}`}
                                >
                                  {getStatusText(status)}
                                </span>
                                {status === 'fired' && (
                                  <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                                    <FiClock className="text-xs" />
                                    Yuborildi
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {status === 'waiting' && (
                                <button
                                  onClick={() => onFireCourse?.(course.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600 transition-colors"
                                >
                                  <FiPlay className="text-xs" />
                                  Yuborish
                                </button>
                              )}
                              {status === 'fired' && (
                                <button
                                  onClick={() => onStatusChange?.(course.id, 'preparing')}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-500 text-white text-sm hover:bg-yellow-600 transition-colors"
                                >
                                  <FiClock className="text-xs" />
                                  Tayyorlanmoqda
                                </button>
                              )}
                              {status === 'preparing' && (
                                <button
                                  onClick={() => onStatusChange?.(course.id, 'ready')}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm hover:bg-green-600 transition-colors"
                                >
                                  <FiCheck className="text-xs" />
                                  Tayyor
                                </button>
                              )}
                              {status === 'ready' && (
                                <button
                                  onClick={() => onStatusChange?.(course.id, 'served')}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
                                >
                                  <FiCheck className="text-xs" />
                                  Berildi
                                </button>
                              )}
                              {status === 'served' && (
                                <span className="flex items-center gap-1 text-green-500 text-sm">
                                  <FiCheck />
                                  Bajarildi
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="px-4 pb-4">
              <div className="p-3 rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20">
                <div className="flex items-start gap-2">
                  <FiAlertCircle className="text-[var(--color-primary)] mt-0.5" />
                  <div className="text-sm">
                    <p className="text-[var(--color-text)]">
                      Kurslarni ketma-ket yuborish oshxonaga taomlarni to'g'ri ketma-ketlikda
                      tayyorlash imkonini beradi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default CourseSelector
