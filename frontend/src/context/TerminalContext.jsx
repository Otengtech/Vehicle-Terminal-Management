import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { terminalsApi } from '@api/terminals';

const TerminalContext = createContext();

export const TerminalProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentTerminal, setCurrentTerminal] = useState(null);
  const [terminals, setTerminals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.terminalId) {
      fetchTerminal(user.terminalId);
    }
  }, [isAuthenticated, user?.terminalId]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'Superadmin') {
      fetchAllTerminals();
    }
  }, [isAuthenticated, user?.role]);

  const fetchTerminal = async (terminalId) => {
    try {
      setIsLoading(true);
      const response = await terminalsApi.getById(terminalId);
      setCurrentTerminal(response.data.data);
    } catch (error) {
      console.error('Failed to fetch terminal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllTerminals = async () => {
    try {
      const response = await terminalsApi.getAll({ limit: 100 });
      setTerminals(response.data.data);
    } catch (error) {
      console.error('Failed to fetch terminals:', error);
    }
  };

  const refreshTerminal = () => {
    if (currentTerminal) {
      fetchTerminal(currentTerminal._id);
    }
  };

  const value = {
    currentTerminal,
    terminals,
    isLoading,
    refreshTerminal,
    setCurrentTerminal
  };

  return (
    <TerminalContext.Provider value={value}>
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminalContext = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminalContext must be used within a TerminalProvider');
  }
  return context;
};