import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/authMiddleware.js';
import { config } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}_${safeName}`);
  }
});

const upload = multer({ storage });

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(config.uploadDir)) {
      return res.json([]);
    }
    const names = fs.readdirSync(config.uploadDir);
    const files = names
      .map((name) => {
        const full = path.join(config.uploadDir, name);
        let stat;
        try {
          stat = fs.statSync(full);
        } catch {
          return null;
        }
        if (!stat.isFile()) return null;
        return {
          storedName: name,
          originalName: name.replace(/^\d+_/, ''),
          size: stat.size,
          updatedAt: stat.mtime.toISOString()
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.json(files);
  } catch (err) {
    console.error('List files error:', err);
    return res.status(500).json({ message: 'Impossible de lister les fichiers' });
  }
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucun fichier reçu' });
  }

  return res.status(201).json({
    message: 'Fichier reçu et stocké temporairement',
    file: {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      updatedAt: new Date().toISOString()
    }
  });
});

export default router;
