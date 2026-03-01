import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/auth/doctors');
        setDoctors(res.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Group doctors by specialty
  const servicesBySpecialty = doctors.reduce((acc, doctor) => {
    const specialty = doctor.specialty || 'Général';
    if (!acc[specialty]) {
      acc[specialty] = [];
    }
    acc[specialty].push(doctor);
    return acc;
  }, {});

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Bienvenue {user?.email}</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h3>Services disponibles et leurs médecins</h3>
        
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="services-grid">
            {Object.entries(servicesBySpecialty).map(([specialty, doctorsList]) => (
              <div key={specialty} className="service-card">
                <h4>{specialty}</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {doctorsList.map((doctor) => (
                    <li key={doctor.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      <strong>{doctor.name}</strong>
                      <br />
                      <small style={{ color: '#666' }}>{doctor.email}</small>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {!loading && doctors.length === 0 && (
          <p>Aucun médecin disponible pour le moment.</p>
        )}
      </div>
    </div>
  );
}
