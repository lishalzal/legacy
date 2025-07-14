import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      newSocket.on('connected', (data) => {
        console.log('Socket authenticated:', data);
      });

      newSocket.on('process_completed', (data) => {
        toast.success(`Process completed: ${data.result}`);
      });

      newSocket.on('process_updated', (data) => {
        console.log('Process updated:', data);
      });

      newSocket.on('mission_updated', (data) => {
        console.log('Mission updated:', data);
      });

      newSocket.on('notification', (data) => {
        toast.info(data.message);
      });

      newSocket.on('private_message', (data) => {
        toast.info(`Message from ${data.from}: ${data.message}`);
      });

      newSocket.on('global_message', (data) => {
        toast.info(`Global: ${data.from}: ${data.message}`);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error('Connection error');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    connected,
    emit,
    on,
    off
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};