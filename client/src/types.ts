export type RoleId = 1 | 2;
export type AppointmentStatus = 'P' | 'C' | 'D' | 'X';

export interface AuthUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  roleId: RoleId;
}

export interface Dentist {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  gender?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  isActive?: number;
  roleId: 1;
}

export interface DentalService {
  ServiceId: number;
  Description: string;
  DateCreated?: string;
  DateUpdated?: string;
}

export interface PersonSummary {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  birthDate?: string | null;
}

export interface Appointment {
  appointmentId: number;
  appointmentDate: string;
  patientUserId: number;
  dentistUserId: number;
  serviceId: number;
  notes: string | null;
  status: AppointmentStatus;
  patient: PersonSummary | null;
  dentist: PersonSummary | null;
  service: { serviceId: number; description: string } | null;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data: {
    user: AuthUser;
    tokens: { accessToken: string; refreshToken: string; expiresIn: string };
  };
}
