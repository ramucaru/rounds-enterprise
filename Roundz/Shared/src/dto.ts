export type Coordinates = {
  lat: number;
  lng: number;
};

export type UserRole = 'customer' | 'rider' | 'admin';

export type AuthRegistrationRequest = {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
};

export type AuthLoginRequest = {
  email: string;
  password: string;
};

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  createdAt: string;
};

export type RiderProfile = {
  id: string;
  userId: string;
  vehicleType: string;
  vehiclePlate: string;
  available: boolean;
  rating: number;
};

export type TripStatus = 'requested' | 'matched' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';

export type TripRequest = {
  customerId: string;
  pickup: Coordinates;
  dropoff: Coordinates;
  paymentMethodId?: string;
};

export type Trip = {
  id: string;
  customerId: string;
  riderId?: string;
  pickup: Coordinates;
  dropoff: Coordinates;
  status: TripStatus;
  fareCents: number;
  createdAt: string;
};

export type WalletTransaction = {
  id: string;
  walletId: string;
  amountCents: number;
  currency: string;
  kind: 'credit' | 'debit';
  reference: string;
  createdAt: string;
};

export type NotificationRequest = {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};
