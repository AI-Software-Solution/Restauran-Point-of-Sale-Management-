import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  // Bill Split
  createBillSplit,
  getBillSplit,
  payGuestBill,
  cancelBillSplit,
  // Courses
  getCourses,
  fireCourse,
  fireNextCourse,
  updateCourseStatus,
  getActiveCourses,
  // Table Transfer
  transferOrder,
  mergeTables,
  getTransferHistory,
  // Kitchen Notes
  addKitchenNote,
  acknowledgeKitchenNote,
  getAllergyPresets,
  // Tips
  addTip,
  getWaiterTips,
  distributeTip,
  getTipsReport,
  // Loyalty
  registerLoyaltyMember,
  findLoyaltyMemberByPhone,
  getLoyaltyMember,
  earnLoyaltyPoints,
  redeemLoyaltyPoints,
  getLoyaltyRewards,
  getLoyaltyMemberHistory,
} from '../https/index';
import { enqueueSnackbar } from 'notistack';

// ==================== BILL SPLIT HOOKS ====================

export const useBillSplit = (orderId) => {
  return useQuery({
    queryKey: ['billSplit', orderId],
    queryFn: () => getBillSplit(orderId),
    enabled: !!orderId,
  });
};

export const useCreateBillSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }) => createBillSplit(orderId, data),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries(['billSplit', orderId]);
      enqueueSnackbar('Hisob muvaffaqiyatli bo\'lindi!', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Hisobni bo\'lishda xatolik!', { variant: 'error' });
    },
  });
};

export const usePayGuestBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, guestBillId, data }) => payGuestBill(orderId, guestBillId, data),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries(['billSplit', orderId]);
      enqueueSnackbar('To\'lov qabul qilindi!', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('To\'lov xatoligi!', { variant: 'error' });
    },
  });
};

export const useCancelBillSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => cancelBillSplit(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries(['billSplit', orderId]);
      enqueueSnackbar('Hisob bo\'lish bekor qilindi', { variant: 'info' });
    },
  });
};

// ==================== COURSE HOOKS ====================

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });
};

export const useActiveCourses = (orderId) => {
  return useQuery({
    queryKey: ['activeCourses', orderId],
    queryFn: () => getActiveCourses(orderId),
    enabled: !!orderId,
    refetchInterval: 10000, // Real-time updates
  });
};

export const useFireCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, courseId }) => fireCourse(orderId, courseId),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries(['activeCourses', orderId]);
      enqueueSnackbar('Kurs oshxonaga yuborildi!', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Kursni yuborishda xatolik!', { variant: 'error' });
    },
  });
};

export const useFireNextCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => fireNextCourse(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries(['activeCourses', orderId]);
      enqueueSnackbar('Keyingi kurs yuborildi!', { variant: 'success' });
    },
  });
};

export const useUpdateCourseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, courseId, status }) => updateCourseStatus(orderId, courseId, status),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries(['activeCourses', orderId]);
    },
  });
};

// ==================== TABLE TRANSFER HOOKS ====================

export const useTransferOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tableId, data }) => transferOrder(tableId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tables']);
      queryClient.invalidateQueries(['orders']);
      enqueueSnackbar('Buyurtma ko\'chirildi!', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Buyurtmani ko\'chirishda xatolik!', { variant: 'error' });
    },
  });
};

export const useMergeTables = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => mergeTables(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tables']);
      queryClient.invalidateQueries(['orders']);
      enqueueSnackbar('Stollar birlashtirildi!', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Stollarni birlashtirishda xatolik!', { variant: 'error' });
    },
  });
};

export const useTransferHistory = (tableId) => {
  return useQuery({
    queryKey: ['transferHistory', tableId],
    queryFn: () => getTransferHistory(tableId),
    enabled: !!tableId,
  });
};

// ==================== KITCHEN NOTES HOOKS ====================

export const useAllergyPresets = () => {
  return useQuery({
    queryKey: ['allergyPresets'],
    queryFn: getAllergyPresets,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useAddKitchenNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemIndex, data }) => addKitchenNote(orderId, itemIndex, data),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries(['order', orderId]);
      enqueueSnackbar('Oshxona izohi qo\'shildi!', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Izoh qo\'shishda xatolik!', { variant: 'error' });
    },
  });
};

export const useAcknowledgeNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, noteId }) => acknowledgeKitchenNote(orderId, noteId),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries(['order', orderId]);
    },
  });
};

// ==================== TIPS HOOKS ====================

export const useAddTip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }) => addTip(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tips']);
      enqueueSnackbar('Tip qo\'shildi!', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Tip qo\'shishda xatolik!', { variant: 'error' });
    },
  });
};

export const useWaiterTips = (waiterId, params = {}) => {
  return useQuery({
    queryKey: ['waiterTips', waiterId, params],
    queryFn: () => getWaiterTips(waiterId, params),
    enabled: !!waiterId,
  });
};

export const useDistributeTip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tipId, data }) => distributeTip(tipId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tips']);
      enqueueSnackbar('Tip taqsimlandi!', { variant: 'success' });
    },
  });
};

export const useTipsReport = (params = {}) => {
  return useQuery({
    queryKey: ['tipsReport', params],
    queryFn: () => getTipsReport(params),
  });
};

// ==================== LOYALTY HOOKS ====================

export const useLoyaltyMember = (memberId) => {
  return useQuery({
    queryKey: ['loyaltyMember', memberId],
    queryFn: () => getLoyaltyMember(memberId),
    enabled: !!memberId,
  });
};

export const useFindLoyaltyMember = () => {
  return useMutation({
    mutationFn: (phone) => findLoyaltyMemberByPhone(phone),
    onError: () => {
      enqueueSnackbar('Mijoz topilmadi', { variant: 'warning' });
    },
  });
};

export const useRegisterLoyaltyMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => registerLoyaltyMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['loyaltyMembers']);
      enqueueSnackbar('Yangi a\'zo ro\'yxatdan o\'tdi!', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Ro\'yxatdan o\'tishda xatolik!', { variant: 'error' });
    },
  });
};

export const useEarnPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data }) => earnLoyaltyPoints(memberId, data),
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries(['loyaltyMember', memberId]);
      enqueueSnackbar('Ballar qo\'shildi!', { variant: 'success' });
    },
  });
};

export const useRedeemPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data }) => redeemLoyaltyPoints(memberId, data),
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries(['loyaltyMember', memberId]);
      enqueueSnackbar('Ballar sarflandi!', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Ballarni sarflashda xatolik!', { variant: 'error' });
    },
  });
};

export const useLoyaltyRewards = () => {
  return useQuery({
    queryKey: ['loyaltyRewards'],
    queryFn: getLoyaltyRewards,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useLoyaltyHistory = (memberId, params = {}) => {
  return useQuery({
    queryKey: ['loyaltyHistory', memberId, params],
    queryFn: () => getLoyaltyMemberHistory(memberId, params),
    enabled: !!memberId,
  });
};
