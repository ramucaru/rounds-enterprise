export type UserRole = 'customer' | 'rider' | 'admin';
export type TripStatus = 'requested' | 'matched' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
export type NotificationChannel = 'push' | 'sms' | 'email' | 'in_app';

export interface Money {
  amountCents: number;
  currency: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface ApiResponse<T> {
  data: T;
  traceId?: string;
}
