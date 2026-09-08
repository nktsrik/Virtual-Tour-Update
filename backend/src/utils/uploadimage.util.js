import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const allowedTypes = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg'
};

// Safe file extensions whitelist
const safeExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp3', '.wav', '.ogg'];

// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename) => {
  if (!filename) return '';
  return path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, '_');
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir;
    if (file.mimetype.startsWith('image/')) {
      dir = path.resolve(__dirname, '../../uploads/images360');
    } else if (file.mimetype.startsWith('audio/')) {
      dir = path.resolve(__dirname, '../../uploads/audio');
    } else {
      // Reject files that are not image or audio
      return cb(new Error('Tipe file tidak didukung. Hanya image dan audio yang diizinkan.'), false);
    }
    
    // Ensure directory is within expected upload path
    const uploadsBase = path.resolve(__dirname, '../../uploads');
    if (!dir.startsWith(uploadsBase)) {
      return cb(new Error('Path tidak valid'), false);
    }
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const sanitizedName = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitizedName).toLowerCase();
    
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    
    let prefix = 'file';
    if (file.mimetype.startsWith('image/')) {
      prefix = 'img';
    } else if (file.mimetype.startsWith('audio/')) {
      prefix = 'audio';
    }
    
    cb(null, `${prefix}_${timestamp}_${randomString}${ext}`);
  },
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  // Validate mimetype
  if (!allowedTypes[file.mimetype]) {
    const allowedExtensions = Object.values(allowedTypes).join(', ');
    return cb(new Error(`Tipe file tidak didukung. Format yang diizinkan: ${allowedExtensions}`), false);
  }
  
  // Validate extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!safeExtensions.includes(ext)) {
    return cb(new Error('Ekstensi file tidak diizinkan'), false);
  }
  
  cb(null, true);
};

const uploadImage = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max for 360° images
    files: 1,
    fieldSize: 2 * 1024 * 1024 // 2MB field size limit
  }
});

export default uploadImage;
