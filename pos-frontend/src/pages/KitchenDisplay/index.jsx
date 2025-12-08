import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { axiosWrapper } from '../../https/axiosWrapper';
import {
  HiOutlineRefresh,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineBell,
  HiOutlineAnnotation,
  HiOutlineExclamation,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import {
  FiPlay,
  FiCheck,
  FiAlertTriangle,
  FiSend
} from 'react-icons/fi';
import { MdKitchen, MdTableBar, MdTakeoutDining, MdRestaurant } from 'react-icons/md';
import { Badge, Button } from '../../components/ui';

// Order status constants
const ORDER_STATUS = {
  NEW: 'new',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served'
};

// Course status constants
const COURSE_STATUS = {
  WAITING: 'waiting',
  FIRED: 'fired',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served'
};

// Status configuration
const STATUS_CONFIG = {
  new: {
    label: 'Yangi',
    bgColor: 'bg-info',
    textColor: 'text-info',
    borderColor: 'border-info',
    icon: HiOutlineBell,
  },
  preparing: {
    label: 'Tayyorlanmoqda',
    bgColor: 'bg-warning',
    textColor: 'text-warning',
    borderColor: 'border-warning',
    icon: MdKitchen,
  },
  ready: {
    label: 'Tayyor',
    bgColor: 'bg-success',
    textColor: 'text-success',
    borderColor: 'border-success',
    icon: HiOutlineCheckCircle,
  },
  served: {
    label: 'Berildi',
    bgColor: 'bg-secondary',
    textColor: 'text-text-secondary',
    borderColor: 'border-border',
    icon: MdRestaurant,
  },
};

// Course status colors
const COURSE_STATUS_CONFIG = {
  waiting: { bg: 'bg-gray-500', text: 'Kutmoqda' },
  fired: { bg: 'bg-orange-500', text: 'Yuborildi' },
  preparing: { bg: 'bg-yellow-500', text: 'Tayyorlanmoqda' },
  ready: { bg: 'bg-green-500', text: 'Tayyor' },
  served: { bg: 'bg-blue-500', text: 'Berildi' }
};

// Default courses
const DEFAULT_COURSES = [
  { id: 1, name: 'Appetizer', nameUz: 'Salatlar', icon: '🥗', color: '#28A745' },
  { id: 2, name: 'Soup', nameUz: "Sho'rvalar", icon: '🍜', color: '#FFC107' },
  { id: 3, name: 'Main Course', nameUz: 'Asosiy taom', icon: '🍽️', color: '#714B67' },
  { id: 4, name: 'Dessert', nameUz: 'Shirinlik', icon: '🍰', color: '#E91E63' },
  { id: 5, name: 'Drinks', nameUz: 'Ichimliklar', icon: '🥤', color: '#17A2B8' }
];

// Time thresholds for color coding (in minutes)
const TIME_THRESHOLDS = {
  GREEN: 5,
  YELLOW: 10
};

// Sound notification
const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    });
  } catch (e) {
    console.log('Sound not available');
  }
};

// Play allergy alert sound
const playAllergyAlert = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 1000;
    oscillator.type = 'square';
    gainNode.gain.value = 0.4;
    oscillator.start();
    setTimeout(() => {
      oscillator.frequency.value = 800;
      setTimeout(() => oscillator.stop(), 200);
    }, 200);
  } catch (e) {
    console.log('Sound not available');
  }
};

// Format time elapsed
const formatTimeElapsed = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);

  if (diffMins >= 60) {
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
  }
  return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
};

// Get time-based color
const getTimeColor = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMins = Math.floor((now - created) / 60000);

  if (diffMins < TIME_THRESHOLDS.GREEN) return 'text-success';
  if (diffMins < TIME_THRESHOLDS.YELLOW) return 'text-warning';
  return 'text-danger';
};

// Allergy Badge Component
const AllergyBadge = ({ allergies }) => {
  if (!allergies || allergies.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {allergies.map((allergy, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white animate-pulse"
        >
          <FiAlertTriangle className="w-3 h-3" />
          {allergy.nameUz || allergy.name}
        </span>
      ))}
    </div>
  );
};

// Kitchen Note Component
const KitchenNoteDisplay = ({ notes }) => {
  if (!notes || notes.length === 0) return null;

  const allergyNotes = notes.filter(n => n.noteType === 'allergy');
  const otherNotes = notes.filter(n => n.noteType !== 'allergy');

  return (
    <div className="space-y-2">
      {/* Allergy Alerts - Critical */}
      {allergyNotes.length > 0 && (
        <div className="p-2 bg-red-500/20 border-2 border-red-500 rounded-lg animate-pulse">
          <div className="flex items-center gap-2 text-red-500 font-bold mb-1">
            <FiAlertTriangle className="w-5 h-5" />
            ALLERGIYA OGOHLANTIRISH!
          </div>
          {allergyNotes.map((note, idx) => (
            <div key={idx} className="text-red-400 text-sm flex items-start gap-2">
              <span>⚠️</span>
              <span>{note.noteText}</span>
              <AllergyBadge allergies={note.allergies} />
            </div>
          ))}
        </div>
      )}

      {/* Other Notes */}
      {otherNotes.length > 0 && (
        <div className="p-2 bg-warning/10 rounded-lg border border-warning/30">
          {otherNotes.map((note, idx) => (
            <p key={idx} className="text-warning text-sm flex items-center gap-2">
              <HiOutlineAnnotation className="w-4 h-4 flex-shrink-0" />
              <span>
                {note.severity === 'high' && '❗ '}
                {note.noteText}
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// Course Progress Component
const CourseProgress = ({ courses, orderCourses, onFireCourse }) => {
  if (!courses || courses.length === 0) return null;

  const getCourseStatus = (courseId) => {
    const orderCourse = orderCourses?.find(oc => oc.courseId === courseId);
    return orderCourse?.courseStatus || 'waiting';
  };

  return (
    <div className="p-3 bg-surface-secondary rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-secondary uppercase">Kurslar</span>
      </div>
      <div className="flex items-center gap-1">
        {courses.map((course, idx) => {
          const status = getCourseStatus(course.id);
          const config = COURSE_STATUS_CONFIG[status];
          const isLast = idx === courses.length - 1;

          return (
            <div key={course.id} className="flex items-center">
              <button
                onClick={() => status === 'waiting' && onFireCourse?.(course.id)}
                disabled={status !== 'waiting'}
                className={`
                  relative flex items-center justify-center w-8 h-8 rounded-full text-white text-sm
                  ${config.bg}
                  ${status === 'waiting' ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
                `}
                title={`${course.nameUz || course.name} - ${config.text}`}
              >
                {course.icon || '🍽️'}
                {status === 'ready' && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <FiCheck className="w-3 h-3" />
                  </span>
                )}
              </button>
              {!isLast && (
                <HiOutlineChevronRight className={`w-4 h-4 mx-0.5 ${
                  status === 'served' ? 'text-green-500' : 'text-text-muted'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Order Card Component
const OrderCard = ({ order, onStatusChange, onBump, onAcknowledge, onFireCourse }) => {
  const [timeElapsed, setTimeElapsed] = useState(formatTimeElapsed(order.createdAt));
  const [timeColor, setTimeColor] = useState(getTimeColor(order.createdAt));

  // Check for allergy notes
  const hasAllergyNotes = order.kitchenNotes?.some(n => n.noteType === 'allergy');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(formatTimeElapsed(order.createdAt));
      setTimeColor(getTimeColor(order.createdAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  // Play allergy alert on mount if has allergy
  useEffect(() => {
    if (hasAllergyNotes && order.kitchenStatus === 'new') {
      playAllergyAlert();
    }
  }, [hasAllergyNotes, order.kitchenStatus]);

  const status = order.kitchenStatus || 'new';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  const StatusIcon = config.icon;

  // Group items by course
  const itemsByCourse = order.items?.reduce((acc, item) => {
    const courseId = item.courseId || 'uncategorized';
    if (!acc[courseId]) acc[courseId] = [];
    acc[courseId].push(item);
    return acc;
  }, {}) || {};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`
        bg-surface rounded-xl shadow-lg overflow-hidden border-2
        ${hasAllergyNotes ? 'border-red-500 ring-2 ring-red-500/50' : config.borderColor}
        ${status === 'new' ? 'ring-2 ring-info/50 animate-pulse' : ''}
      `}
    >
      {/* Allergy Warning Banner */}
      {hasAllergyNotes && (
        <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-center gap-2 animate-pulse">
          <FiAlertTriangle className="w-5 h-5" />
          <span className="font-bold">ALLERGIYA MAVJUD!</span>
          <FiAlertTriangle className="w-5 h-5" />
        </div>
      )}

      {/* Header */}
      <div className={`${config.bgColor} px-4 py-3 flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <StatusIcon className="w-6 h-6 text-white" />
          <span className="text-xl font-bold text-white">
            #{order.orderNumber || order.id?.slice(-4) || 'N/A'}
          </span>
          {order.tableNumber && (
            <span className="bg-white/20 px-2 py-0.5 rounded text-white text-sm font-medium flex items-center gap-1">
              <MdTableBar className="w-4 h-4" />
              Stol {order.tableNumber}
            </span>
          )}
          {order.orderType === 'takeaway' && (
            <span className="bg-white/20 px-2 py-0.5 rounded text-white text-sm font-medium flex items-center gap-1">
              <MdTakeoutDining className="w-4 h-4" />
              Olib ketish
            </span>
          )}
        </div>
        <div className={`text-lg font-mono font-bold ${timeColor} bg-surface/20 px-2 py-1 rounded flex items-center gap-1`}>
          <HiOutlineClock className="w-4 h-4" />
          {timeElapsed}
        </div>
      </div>

      {/* Kitchen Notes */}
      {order.kitchenNotes && order.kitchenNotes.length > 0 && (
        <div className="px-4 py-2 border-b border-border">
          <KitchenNoteDisplay notes={order.kitchenNotes} />
        </div>
      )}

      {/* Course Progress */}
      {order.courses && order.courses.length > 0 && (
        <div className="px-4 py-2 border-b border-border">
          <CourseProgress
            courses={DEFAULT_COURSES}
            orderCourses={order.orderCourses}
            onFireCourse={(courseId) => onFireCourse?.(order.id, courseId)}
          />
        </div>
      )}

      {/* Items */}
      <div className="p-4 bg-surface">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {order.items && order.items.map((item, idx) => (
            <div key={idx} className={`
              flex justify-between items-start border-b border-border pb-2 last:border-0 last:pb-0
              ${item.hasAllergy ? 'bg-red-500/10 -mx-2 px-2 py-1 rounded' : ''}
            `}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-white text-sm font-bold px-2 py-0.5 rounded min-w-[32px] text-center">
                    {item.quantity}x
                  </span>
                  <span className="text-text-primary font-medium">{item.name}</span>
                  {item.courseId && (
                    <span className="text-xs text-text-muted">
                      ({DEFAULT_COURSES.find(c => c.id === item.courseId)?.nameUz || 'Kurs'})
                    </span>
                  )}
                </div>
                {item.notes && (
                  <p className="text-warning text-sm mt-1 ml-10 flex items-center gap-1">
                    <HiOutlineAnnotation className="w-4 h-4" />
                    {item.notes}
                  </p>
                )}
                {item.allergies && item.allergies.length > 0 && (
                  <div className="ml-10 mt-1">
                    <AllergyBadge allergies={item.allergies} />
                  </div>
                )}
                {item.modifiers && item.modifiers.length > 0 && (
                  <div className="ml-10 mt-1 flex flex-wrap gap-1">
                    {item.modifiers.map((mod, midx) => (
                      <span key={midx} className="text-text-secondary text-xs bg-surface-secondary px-1.5 py-0.5 rounded">
                        + {mod}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="mt-3 p-2 bg-warning/10 rounded-lg border border-warning/30">
            <p className="text-warning text-sm flex items-center gap-2">
              <HiOutlineAnnotation className="w-4 h-4 flex-shrink-0" />
              <span><span className="font-bold">Izoh:</span> {order.notes}</span>
            </p>
          </div>
        )}

        {/* Waiter & Customer Info */}
        {(order.waiter || order.customerName) && (
          <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-sm text-text-secondary">
            {order.waiter && <span>Ofitsiant: {order.waiter}</span>}
            {order.customerName && <span>Mijoz: {order.customerName}</span>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-surface-secondary px-4 py-3 flex gap-2 border-t border-border">
        {status === 'new' && (
          <button
            onClick={() => onAcknowledge(order.id)}
            className="flex-1 bg-warning hover:bg-warning/90 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FiPlay className="w-5 h-5" />
            Boshlash
          </button>
        )}

        {status === 'preparing' && (
          <button
            onClick={() => onBump(order.id)}
            className="flex-1 bg-success hover:bg-success/90 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FiCheck className="w-5 h-5" />
            Tayyor
          </button>
        )}

        {status === 'ready' && (
          <button
            onClick={() => onStatusChange(order.id, 'served')}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FiSend className="w-5 h-5" />
            Yuborildi
          </button>
        )}

        <button
          onClick={() => onStatusChange(order.id, status === 'new' ? 'preparing' : 'new')}
          className="bg-surface hover:bg-border text-text-secondary px-3 py-2.5 rounded-lg transition-colors border border-border"
          title="Orqaga qaytarish"
        >
          ↩
        </button>
      </div>
    </motion.div>
  );
};

// Main KDS Component
const KitchenDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ new: 0, preparing: 0, ready: 0, avgTime: '0:00', allergies: 0 });
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('grid'); // grid or kanban
  const socketRef = useRef(null);

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const response = await axiosWrapper.get('/api/v1/kitchen/orders');
      if (response.data.success) {
        const ordersData = response.data.data.orders;
        setOrders(ordersData);

        // Calculate allergy count
        const allergyCount = ordersData.filter(o =>
          o.kitchenNotes?.some(n => n.noteType === 'allergy')
        ).length;

        setStats({
          ...response.data.data.stats,
          allergies: allergyCount
        });
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Buyurtmalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize WebSocket
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    socketRef.current = io(backendUrl, {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('KDS WebSocket connected');
      socketRef.current.emit('join:room', 'kitchen');
    });

    socketRef.current.on('kitchen:new_order', (order) => {
      console.log('New order received:', order);
      setOrders(prev => [order, ...prev]);
      setStats(prev => ({ ...prev, new: prev.new + 1 }));

      // Check for allergy and play different sound
      if (order.kitchenNotes?.some(n => n.noteType === 'allergy')) {
        playAllergyAlert();
      } else {
        playNotificationSound();
      }
    });

    socketRef.current.on('order:status_changed', ({ orderId, status }) => {
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, kitchenStatus: status } : o
      ));
    });

    socketRef.current.on('course:fired', ({ orderId, courseId }) => {
      console.log('Course fired:', orderId, courseId);
      fetchOrders();
    });

    socketRef.current.on('note:allergy_alert', ({ orderId }) => {
      playAllergyAlert();
      fetchOrders();
    });

    socketRef.current.on('order:completed', ({ orderId }) => {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave:room', 'kitchen');
        socketRef.current.disconnect();
      }
    };
  }, [fetchOrders]);

  // Fetch orders on mount and periodically
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axiosWrapper.patch(`/api/v1/kitchen/orders/${orderId}/status`, {
        status: newStatus
      });
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, kitchenStatus: newStatus } : o
      ));
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Bump order (mark as ready)
  const handleBump = async (orderId) => {
    try {
      await axiosWrapper.post(`/api/v1/kitchen/orders/${orderId}/bump`);
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, kitchenStatus: 'ready' } : o
      ));
      fetchOrders();
    } catch (err) {
      console.error('Failed to bump order:', err);
    }
  };

  // Acknowledge order
  const handleAcknowledge = async (orderId) => {
    try {
      await axiosWrapper.post(`/api/v1/kitchen/orders/${orderId}/acknowledge`);
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, kitchenStatus: 'preparing' } : o
      ));
      fetchOrders();
    } catch (err) {
      console.error('Failed to acknowledge order:', err);
    }
  };

  // Fire course
  const handleFireCourse = async (orderId, courseId) => {
    try {
      await axiosWrapper.post(`/api/courses/${orderId}/fire/${courseId}`);
      fetchOrders();
    } catch (err) {
      console.error('Failed to fire course:', err);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'allergy') {
      return order.kitchenNotes?.some(n => n.noteType === 'allergy');
    }
    return order.kitchenStatus === filterStatus;
  });

  // Group orders by status
  const groupedOrders = {
    new: filteredOrders.filter(o => o.kitchenStatus === 'new'),
    preparing: filteredOrders.filter(o => o.kitchenStatus === 'preparing'),
    ready: filteredOrders.filter(o => o.kitchenStatus === 'ready')
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-3.5rem)] bg-background flex items-center justify-center">
        <div className="text-center">
          <HiOutlineRefresh className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-text-secondary text-lg">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MdKitchen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-text-primary">Oshxona Display</h1>
              <p className="text-sm text-text-secondary">
                {currentTime.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-info/10 rounded-lg">
              <HiOutlineBell className="w-5 h-5 text-info" />
              <span className="text-lg font-bold text-info">{stats.new}</span>
              <span className="text-text-secondary text-sm">Yangi</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 rounded-lg">
              <MdKitchen className="w-5 h-5 text-warning" />
              <span className="text-lg font-bold text-warning">{stats.preparing}</span>
              <span className="text-text-secondary text-sm">Tayyorlanmoqda</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-lg">
              <HiOutlineCheckCircle className="w-5 h-5 text-success" />
              <span className="text-lg font-bold text-success">{stats.ready}</span>
              <span className="text-text-secondary text-sm">Tayyor</span>
            </div>
            {stats.allergies > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-lg animate-pulse">
                <FiAlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-lg font-bold text-red-500">{stats.allergies}</span>
                <span className="text-red-500 text-sm">Allergiya</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-secondary rounded-lg">
              <HiOutlineClock className="w-5 h-5 text-text-secondary" />
              <span className="text-lg font-bold text-text-primary">{stats.avgTime || '0:00'}</span>
              <span className="text-text-secondary text-sm">O'rtacha</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchOrders}
            >
              Yangilash
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto">
          {[
            { key: 'all', label: 'Hammasi', count: orders.length },
            { key: 'new', label: 'Yangi', count: stats.new, color: 'info' },
            { key: 'preparing', label: 'Tayyorlanmoqda', count: stats.preparing, color: 'warning' },
            { key: 'ready', label: 'Tayyor', count: stats.ready, color: 'success' },
            { key: 'allergy', label: '⚠️ Allergiya', count: stats.allergies, color: 'danger' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key)}
              className={`
                px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2
                ${filterStatus === filter.key
                  ? filter.key === 'allergy'
                    ? 'bg-red-500 text-white'
                    : 'bg-primary text-white'
                  : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
                }
              `}
            >
              {filter.label}
              <span className={`
                px-1.5 py-0.5 rounded text-xs font-bold
                ${filterStatus === filter.key
                  ? 'bg-white/20'
                  : filter.color ? `bg-${filter.color}/20 text-${filter.color}` : 'bg-border'
                }
              `}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-2 text-danger">
          <HiOutlineExclamationCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredOrders.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MdRestaurant className="w-20 h-20 mx-auto mb-4 text-text-muted opacity-50" />
              <p className="text-text-primary font-medium text-lg">Hozircha buyurtma yo'q</p>
              <p className="text-text-secondary text-sm">Yangi buyurtmalar avtomatik ko'rinadi</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {/* New Orders First */}
              {groupedOrders.new.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onBump={handleBump}
                  onAcknowledge={handleAcknowledge}
                  onFireCourse={handleFireCourse}
                />
              ))}

              {/* Preparing Orders */}
              {groupedOrders.preparing.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onBump={handleBump}
                  onAcknowledge={handleAcknowledge}
                  onFireCourse={handleFireCourse}
                />
              ))}

              {/* Ready Orders */}
              {groupedOrders.ready.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onBump={handleBump}
                  onAcknowledge={handleAcknowledge}
                  onFireCourse={handleFireCourse}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer with keyboard shortcuts */}
      <div className="bg-surface border-t border-border px-4 py-2 text-sm text-text-secondary flex items-center gap-6">
        <span className="flex items-center gap-1">
          <kbd className="bg-surface-secondary px-2 py-0.5 rounded text-xs font-mono">Space</kbd>
          Tayyor
        </span>
        <span className="flex items-center gap-1">
          <kbd className="bg-surface-secondary px-2 py-0.5 rounded text-xs font-mono">R</kbd>
          Yangilash
        </span>
        <span className="flex items-center gap-1">
          <kbd className="bg-surface-secondary px-2 py-0.5 rounded text-xs font-mono">1-5</kbd>
          Filter
        </span>
        <div className="flex-1" />
        <span className="text-text-muted">
          Oxirgi yangilash: {currentTime.toLocaleTimeString('uz-UZ')}
        </span>
      </div>
    </div>
  );
};

export default KitchenDisplay;
