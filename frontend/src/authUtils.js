/** Rôles API (médecin / staff) vs portail patient (mock session) */
export function isDoctorRole(role) {
  return role === 'medecin' || role === 'admin' || role === 'assistant';
}

export function isPatientUser(user) {
  return Boolean(user?.role === 'patient');
}

/** Pour l’UI : 'doctor' | 'patient' | null */
export function getUserRoleMode(user) {
  if (!user) return null;
  if (isPatientUser(user)) return 'patient';
  if (isDoctorRole(user.role)) return 'doctor';
  return 'doctor';
}

/** Affichage staff (sidebar / en-têtes) */
export function getStaffDisplayName(user) {
  if (!user || isPatientUser(user)) return '';
  const n = user.name && String(user.name).trim();
  if (n) return n;
  const em = (user.email || '').toLowerCase();
  if (em.includes('anis.belhaj')) return 'Dr. Anis Belhaj';
  if (em.includes('selima.bouzidi')) return 'Dr. Selima Bouzidi';
  return user.email || 'Personnel médical';
}
