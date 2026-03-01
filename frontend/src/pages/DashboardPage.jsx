import React from 'react';
import { useAuth } from '../AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Bienvenue {user?.email}</p>
      <p>Utilisez le menu pour gérer les patients, les rendez-vous et les fichiers.</p>
    </div>
  );
}
