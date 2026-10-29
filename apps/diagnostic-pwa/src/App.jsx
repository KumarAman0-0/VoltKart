import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DiagnosticPage from './pages/diagnostic/DiagnosticPage';
import DiagnosticHome from './pages/DiagnosticHome';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/check/:code" element={<DiagnosticPage />} />
        <Route path="/diagnostic/:code" element={<DiagnosticPage />} />
        <Route path="/" element={<DiagnosticHome />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
