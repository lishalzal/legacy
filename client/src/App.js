import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Hardware from './components/hardware/Hardware';
import Software from './components/software/Software';
import Missions from './components/missions/Missions';
import Internet from './components/internet/Internet';
import Finances from './components/finances/Finances';
import Profile from './components/profile/Profile';
import Navigation from './components/common/Navigation';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Styles
import './styles/App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="App">
              <Navigation />
              <main className="main-content">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hardware"
                    element={
                      <ProtectedRoute>
                        <Hardware />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/software"
                    element={
                      <ProtectedRoute>
                        <Software />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/missions"
                    element={
                      <ProtectedRoute>
                        <Missions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/internet"
                    element={
                      <ProtectedRoute>
                        <Internet />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finances"
                    element={
                      <ProtectedRoute>
                        <Finances />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
              />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;