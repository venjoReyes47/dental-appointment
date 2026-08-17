import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/admin/Navigation';
import routes from './routes';
import type { ReactNode } from 'react';
import type { RoleId } from './types';

const ProtectedRoute = ({ children, requiredRole }: { children: ReactNode; requiredRole?: RoleId }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.roleId !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <div className="min-vh-100">
        <Navigation />
        <main>
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={
                route.protected
                  ? <ProtectedRoute requiredRole={route.requiredRole}>{route.element}</ProtectedRoute>
                  : route.element
              } />
            ))}
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
