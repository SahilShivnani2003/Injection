import { create } from 'zustand';
import { DocumentPickerResponse } from '@react-native-documents/picker';

export interface BookingData {
  // Step 1: Basic Details
  patientName: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  address: string;
  pinCode: string;
  currentLocation: string;
  alternateMobile?: string;
  email: string;

  // Step 2: Prescription
  prescriptionFile?: DocumentPickerResponse;

  // Step 3: Services
  selectedServices: number[];

  // Step 4: Complimentary Tests
  complimentaryTests: ('sugar' | 'group' | 'hb')[];

  // Step 5: Insurance
  hasInsurance: boolean;
  policyNumber?: string;
  insuranceDetails?: {
    policyHolder: string;
    provider: string;
    coverage: string;
    validTill: string;
    maxLimit: number;
    usedAmount: number;
    remainingAmount: number;
  };

  // Step 6: Slot Booking
  selectedDate?: string;
  selectedTime?: string;
  selectedStaff?: 'any' | 'male' | 'female';

  // Computed
  subtotal: number;
  gst: number;
  total: number;
  insuranceCoverage?: number;
  finalAmount: number;
}

interface BookingStore {
  bookingData: Partial<BookingData>;
  currentStep: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  updateBasicDetails: (data: Partial<BookingData>) => void;
  updatePrescription: (file: DocumentPickerResponse) => void;
  updateServices: (services: number[]) => void;
  updateComplimentary: (tests: ('sugar' | 'group' | 'hb')[]) => void;
  updateInsurance: (data: { hasInsurance: boolean; policyNumber?: string; insuranceDetails?: any }) => void;
  updateSlot: (data: { date?: string; time?: string; staff?: 'any' | 'male' | 'female' }) => void;
  calculateCharges: () => void;
  resetBooking: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setStep: (step: number) => void;
}

const initialBookingData: Partial<BookingData> = {
  selectedServices: [],
  complimentaryTests: [],
  hasInsurance: false,
  subtotal: 0,
  gst: 0,
  total: 0,
  finalAmount: 0,
};

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookingData: initialBookingData,
  currentStep: 1,
  isLoading: false,
  error: null,

  updateBasicDetails: (data) => set((state) => ({
    bookingData: { ...state.bookingData, ...data }
  })),

  updatePrescription: (file) => set((state) => ({
    bookingData: { ...state.bookingData, prescriptionFile: file }
  })),

  updateServices: (services) => set((state) => ({
    bookingData: { ...state.bookingData, selectedServices: services }
  })),

  updateComplimentary: (tests) => set((state) => ({
    bookingData: { ...state.bookingData, complimentaryTests: tests }
  })),

  updateInsurance: (data) => set((state) => ({
    bookingData: { ...state.bookingData, ...data }
  })),

  updateSlot: (data) => set((state) => ({
    bookingData: { ...state.bookingData, ...data }
  })),

  calculateCharges: () => {
    const { bookingData } = get();
    // This will be implemented when we have the service prices from API
    // For now, we'll calculate based on mock data
    const services = bookingData.selectedServices || [];
    const subtotal = services.length * 500; // Mock calculation
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;
    const insuranceCoverage = bookingData.insuranceDetails?.remainingAmount || 0;
    const finalAmount = Math.max(0, total - insuranceCoverage);

    set((state) => ({
      bookingData: {
        ...state.bookingData,
        subtotal,
        gst,
        total,
        insuranceCoverage,
        finalAmount
      }
    }));
  },

  resetBooking: () => set({
    bookingData: initialBookingData,
    currentStep: 1,
    isLoading: false,
    error: null
  }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setStep: (step) => set({ currentStep: step }),
}));