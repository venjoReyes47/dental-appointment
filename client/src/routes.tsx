import type { ReactElement } from 'react';
import Home from './components/admin/Home';
import Login from './components/admin/Login';
import Register from './components/admin/Register';
import RegisterDentist from './components/dentist/RegisterDentist';
import RegisterServices from './components/dentist/RegisterServices';
import DentistAppointment from './components/dentist/DentistAppointment';
import Schedule from './components/patient/Schedule';
import type { RoleId } from './types';

export interface AppRoute {
  path: string;
  element: ReactElement;
  protected?: boolean;
  requiredRole?: RoleId;
}

const routes: AppRoute[] = [
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/dentists', element: <RegisterDentist />, protected: true, requiredRole: 1 },
  { path: '/services', element: <RegisterServices />, protected: true, requiredRole: 1 },
  { path: '/schedule', element: <Schedule />, protected: true, requiredRole: 2 },
  { path: '/appointments', element: <DentistAppointment />, protected: true }
];
export default routes;
