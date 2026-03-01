import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { db } from '../dataStore.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Auth failed: No token provided');
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = db.users.find((u) => u.id === decoded.id);
    if (!user) {
      console.log('Auth failed: User not found for id:', decoded.id);
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log('Auth failed: Token invalid', err.message);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    next();
  };
}
