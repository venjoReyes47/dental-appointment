import axios from 'axios';
import instance from './systemAPI';
import type { Appointment, DentalService, Dentist, LoginResponse, RegisterPayload } from '../types';

interface ApiResponse<T> { success: boolean; message?: string; data: T; }

const messageFromError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.response?.data?.error ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

const setAuthCookie = (name: string, value: string, maxAgeSeconds: number): void => {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Strict${secure}`;
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const { data } = await instance.post<LoginResponse>('/api/users/login', { email, password });
    setAuthCookie('token', data.data.tokens.accessToken, 60 * 60);
    setAuthCookie('refreshToken', data.data.tokens.refreshToken, 7 * 24 * 60 * 60);
    return data;
  } catch (error) { throw new Error(messageFromError(error, 'Login failed')); }
};

export const register = async (userData: RegisterPayload): Promise<ApiResponse<unknown>> => {
  try { return (await instance.post<ApiResponse<unknown>>('/api/users/register', userData)).data; }
  catch (error) { throw new Error(messageFromError(error, 'Registration failed')); }
};

export const logout = async (): Promise<void> => {
  document.cookie = 'token=; Path=/; Max-Age=0; SameSite=Strict';
  document.cookie = 'refreshToken=; Path=/; Max-Age=0; SameSite=Strict';
};

const getCookie = (name: string): string | null => {
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
};

const verifyCurrentToken = async (): Promise<LoginResponse> => {
  const { data } = await instance.get<LoginResponse>('/api/users/verify-token');
  setAuthCookie('token', data.data.tokens.accessToken, 60 * 60);
  setAuthCookie('refreshToken', data.data.tokens.refreshToken, 7 * 24 * 60 * 60);
  return data;
};

export const checkAuth = async (): Promise<LoginResponse> => {
  try {
    return await verifyCurrentToken();
  } catch (firstError) {
    const refreshToken = getCookie('refreshToken');
    if (!refreshToken) throw new Error(messageFromError(firstError, 'Authentication check failed'));

    try {
      const { data } = await instance.post<ApiResponse<{ accessToken: string; expiresIn: string }>>(
        '/api/users/refresh-token',
        { refreshToken }
      );
      setAuthCookie('token', data.data.accessToken, 60 * 60);
      return await verifyCurrentToken();
    } catch (refreshError) {
      await logout();
      throw new Error(messageFromError(refreshError, 'Your session has expired. Please sign in again.'));
    }
  }
};

export const getDentist = async (): Promise<ApiResponse<Dentist[]>> => {
  try { return (await instance.get<ApiResponse<Dentist[]>>('/api/dentists')).data; }
  catch (error) { throw new Error(messageFromError(error, 'Unable to load dentists')); }
};
export const createDentist = async (form: RegisterPayload): Promise<ApiResponse<Dentist>> => {
  try { return (await instance.post<ApiResponse<Dentist>>('/api/dentists', form)).data; }
  catch (error) { throw new Error(messageFromError(error, 'Unable to create dentist')); }
};
export const updateDentist = async (id: number, form: Partial<RegisterPayload>): Promise<ApiResponse<Dentist>> => {
  try { return (await instance.put<ApiResponse<Dentist>>(`/api/dentists/${id}`, form)).data; }
  catch (error) { throw new Error(messageFromError(error, 'Unable to update dentist')); }
};
export const deleteDentist = async (id: number): Promise<ApiResponse<unknown>> => {
  try { return (await instance.delete<ApiResponse<unknown>>(`/api/dentists/${id}`)).data; }
  catch (error) { throw new Error(messageFromError(error, 'Unable to delete dentist')); }
};

export const saveAppointment = async (data: Record<string, unknown>): Promise<ApiResponse<Appointment>> => {
  try { return (await instance.post<ApiResponse<Appointment>>('/api/appointments', data)).data; }
  catch (error) { throw new Error(messageFromError(error, 'Unable to save appointment')); }
};
export const getDentistAppointment = async (id: number): Promise<ApiResponse<Appointment[]>> => {
  try { return (await instance.get<ApiResponse<Appointment[]>>(`/api/appointments/user/${id}`)).data; }
  catch (error) { throw new Error(messageFromError(error, 'Unable to load appointments')); }
};
export const getPatientAppointment = getDentistAppointment;
export const updateAppointment = async (id: number, data: Record<string, unknown>): Promise<ApiResponse<Appointment>> => {
  try { return (await instance.put<ApiResponse<Appointment>>(`/api/appointments/${id}`, data)).data; }
  catch (error) { throw new Error(messageFromError(error, 'Unable to update appointment')); }
};

export const getServices = async (): Promise<ApiResponse<DentalService[]>> => {
  try { return (await instance.get<ApiResponse<DentalService[]>>('/api/services')).data; }
  catch (error) { throw new Error(messageFromError(error, 'Unable to load services')); }
};
export const createService = async (data: { description: string }): Promise<ApiResponse<DentalService>> => {
  try { return (await instance.post<ApiResponse<DentalService>>('/api/services', data)).data; }
  catch (error) { throw new Error(messageFromError(error, 'Unable to create service')); }
};
export const updateService = async (id: number, form: { description: string }): Promise<ApiResponse<DentalService>> => {
  try { return (await instance.put<ApiResponse<DentalService>>(`/api/services/${id}`, form)).data; }
  catch (error) { throw new Error(messageFromError(error, 'Unable to update service')); }
};
export const deleteService = async (id: number): Promise<ApiResponse<unknown>> => {
  try { return (await instance.delete<ApiResponse<unknown>>(`/api/services/${id}`)).data; }
  catch (error) { throw new Error(messageFromError(error, 'Unable to delete service')); }
};
