import { 
  User, 
  Parcel, 
  TrackingCheckpoint, 
  Payment, 
  DeliveryProof, 
  ActivityLog, 
  SystemSettings, 
  DashboardStats,
  ApiResponse,
  AuthResponseData,
  PaymentMethod
} from '../../shared/types';

const BASE_URL = '/api';

const getHeaders = (isJson: boolean = true) => {
  const headers: Record<string, string> = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('swiftroute_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthResponseData>(res);
  },

  register: async (userData: any) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse<AuthResponseData>(res);
  },

  getCurrentUser: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse<User>(res);
  },

  updateProfile: async (profileData: Partial<User> & { password?: string }) => {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse<User>(res);
  },

  // Public Tracking
  trackParcel: async (trackingNumber: string) => {
    const res = await fetch(`${BASE_URL}/tracking/${encodeURIComponent(trackingNumber)}`);
    return handleResponse<{ parcel: Parcel; tracking: TrackingCheckpoint[]; proof?: DeliveryProof }>(res);
  },

  // Parcels
  getParcels: async (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${BASE_URL}/parcels?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse<Parcel[]>(res);
  },

  getParcelById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/parcels/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ parcel: Parcel; tracking: TrackingCheckpoint[]; proof?: DeliveryProof }>(res);
  },

  bookParcel: async (parcelData: any) => {
    const res = await fetch(`${BASE_URL}/parcels`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(parcelData),
    });
    return handleResponse<Parcel>(res);
  },

  updateParcelStatus: async (id: string, statusData: { status: string; location?: string; description?: string }) => {
    const res = await fetch(`${BASE_URL}/parcels/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(statusData),
    });
    return handleResponse<Parcel>(res);
  },

  assignAgent: async (parcelId: string, agentId: string) => {
    const res = await fetch(`${BASE_URL}/parcels/${parcelId}/assign`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ agent_id: agentId }),
    });
    return handleResponse<Parcel>(res);
  },

  submitDeliveryProof: async (parcelId: string, proofData: {
    recipient_name: string;
    signature_url?: string;
    photo_url?: string;
    notes?: string;
  }) => {
    const res = await fetch(`${BASE_URL}/parcels/${parcelId}/proof`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(proofData),
    });
    return handleResponse<DeliveryProof>(res);
  },

  // Payments & Invoices
  checkoutPayment: async (parcelId: string, paymentMethod: PaymentMethod) => {
    const res = await fetch(`${BASE_URL}/payments/checkout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ parcel_id: parcelId, payment_method: paymentMethod }),
    });
    return handleResponse<{ payment: Payment; parcel: Parcel }>(res);
  },

  getPaymentHistory: async () => {
    const res = await fetch(`${BASE_URL}/payments/history`, {
      headers: getHeaders(),
    });
    return handleResponse<Payment[]>(res);
  },

  getInvoice: async (parcelId: string) => {
    const res = await fetch(`${BASE_URL}/payments/invoice/${parcelId}`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Admin
  getAdminStats: async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: getHeaders(),
    });
    return handleResponse<DashboardStats>(res);
  },

  getAdminReports: async () => {
    const res = await fetch(`${BASE_URL}/admin/reports`, {
      headers: getHeaders(),
    });
    return handleResponse<{ monthlyDeliveries: any[]; revenueReports: any }>(res);
  },

  getAdminUsers: async (role?: string) => {
    const query = role && role !== 'all' ? `?role=${role}` : '';
    const res = await fetch(`${BASE_URL}/admin/users${query}`, {
      headers: getHeaders(),
    });
    return handleResponse<User[]>(res);
  },

  createAgent: async (agentData: any) => {
    const res = await fetch(`${BASE_URL}/admin/agents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(agentData),
    });
    return handleResponse<User>(res);
  },

  updateUserStatus: async (userId: string, status: 'active' | 'suspended') => {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<User>(res);
  },

  getActivityLogs: async () => {
    const res = await fetch(`${BASE_URL}/admin/activity-logs`, {
      headers: getHeaders(),
    });
    return handleResponse<ActivityLog[]>(res);
  },

  getSettings: async () => {
    const res = await fetch(`${BASE_URL}/admin/settings`, {
      headers: getHeaders(),
    });
    return handleResponse<SystemSettings>(res);
  },

  updateSettings: async (settingsData: Partial<SystemSettings>) => {
    const res = await fetch(`${BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settingsData),
    });
    return handleResponse<SystemSettings>(res);
  },

  // AI Voice Assistant
  assistantChat: async (payload: { message: string; context?: any; history?: any[] }) => {
    const res = await fetch(`${BASE_URL}/assistant/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{
      reply: string;
      action?: { type: string; payload?: any };
      suggestions?: string[];
      trackingData?: any;
      detectedIntent?: string;
    }>(res);
  },

  getAssistantSuggestions: async (params: { currentView?: string; userRole?: string; activeTab?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/assistant/suggestions?${q}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ suggestions: string[] }>(res);
  }
};
