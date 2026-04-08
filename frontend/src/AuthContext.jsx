import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from './api';
import { getUserRoleMode } from './authUtils';

const PATIENT_SESSION = 'patientSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedPatient = localStorage.getItem(PATIENT_SESSION);

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else if (savedPatient) {
      try {
        setUser(JSON.parse(savedPatient));
      } catch {
        localStorage.removeItem(PATIENT_SESSION);
      }
    }
    setLoading(false);
  }, []);

  const userRole = useMemo(() => getUserRoleMode(user), [user]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.removeItem(PATIENT_SESSION);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  /** Session portail patient (sans JWT) après inscription */
  const setPatientSession = (patientProfile) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const session = {
      role: 'patient',
      patientId: patientProfile.patientId,
      email: patientProfile.email || '',
      firstName: patientProfile.firstName || '',
      lastName: patientProfile.lastName || ''
    };
    localStorage.setItem(PATIENT_SESSION, JSON.stringify(session));
    setUser(session);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem(PATIENT_SESSION);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, userRole, loading, login, logout, setPatientSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
