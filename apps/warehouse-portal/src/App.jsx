import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import EngineerDashboard from './pages/engineer/EngineerDashboard';
import WarehouseLoginPage from './pages/WarehouseLoginPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<WarehouseLoginPage />} />
          <Route
            path="/engineer"
            element={
              <ProtectedRoute roles={['engineer']}>
                <EngineerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/engineer" replace />} />
          <Route path="*" element={<Navigate to="/engineer" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
