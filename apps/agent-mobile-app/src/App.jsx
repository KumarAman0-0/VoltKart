import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentInspectionFlow from './pages/agent/AgentInspectionFlow';
import AgentLoginPage from './pages/AgentLoginPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<AgentLoginPage />} />
          <Route
            path="/agent"
            element={
              <ProtectedRoute roles={['agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/inspect/:id"
            element={
              <ProtectedRoute roles={['agent']}>
                <AgentInspectionFlow />
              </ProtectedRoute>
            }
          />
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/agent" replace />} />
          <Route path="*" element={<Navigate to="/agent" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
