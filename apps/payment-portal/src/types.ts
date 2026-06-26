export interface PaymentMethod {
  description?: string;
  fee_amount: number;
  fee_mode: number;
  fee_percent: number;
  icon?: string;
  id: string;
  name: string;
  platform: string;
}

export interface CurrentUserSummary {
  balance: number;
  email: string;
}

export interface RechargeRecord {
  amount: number;
  createdAt: number;
  id: number;
  orderNo: string;
  paymentName?: string;
  status: number;
  tradeNo: string;
  type: number;
}

export interface CheckoutInfo {
  checkoutUrl?: string;
  type: string;
}

export interface ActiveOrder {
  amount: number;
  checkout?: CheckoutInfo;
  createdAt: number;
  id: number;
  orderNo: string;
  paymentId: string;
  paymentName: string;
  rechargeAmount: number;
  status: number;
  tradeNo: string;
}

export interface PortalVerifyConfig {
  captcha_type: string;
  enable_user_login_captcha: boolean;
  turnstile_site_key: string;
}
