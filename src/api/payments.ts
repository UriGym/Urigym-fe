import apiClient from './client';
import type { OrderResponse, PaymentConfirmRequest } from './types';

export const paymentsApi = {
  createOrder: async (membershipPlanId: string) =>
    (await apiClient.post<OrderResponse>('/payments/orders', { membershipPlanId })).data,

  confirm: async (data: PaymentConfirmRequest) =>
    (await apiClient.post<OrderResponse>('/payments/confirm', data)).data,
};

export default paymentsApi;
