
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ShippingAddress, PaymentDetails } from '../types';

interface CheckoutState {
  step: number;
  shippingAddress: ShippingAddress;
  paymentDetails: PaymentDetails;
  setShippingAddress: (data: ShippingAddress) => void;
  setPaymentDetails: (data: PaymentDetails) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
    step: 1,
    shippingAddress: {
        fullName: '',
        addressLine1: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
    },
    paymentDetails: {
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    }
};

export const useCheckoutStore = create(
  persist<CheckoutState>(
    (set, get) => ({
      ...initialState,
      setShippingAddress: (data) => set({ shippingAddress: data }),
      setPaymentDetails: (data) => set({ paymentDetails: data }),
      nextStep: () => set({ step: get().step + 1 }),
      prevStep: () => set({ step: get().step - 1 }),
      setStep: (step) => set({ step }),
      reset: () => set(initialState),
    }),
    {
      name: 'naxstore-checkout-storage',
    }
  )
);
