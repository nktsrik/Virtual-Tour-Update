// src/middleware/validation.middleware.js

// Middleware untuk validasi ID parameter
export const validateIdParam = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID parameter tidak valid'
    });
  }
  
  req.params.id = parseInt(id);
  next();
};

// Middleware untuk validasi query pagination
export const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Parameter page harus berupa angka positif'
    });
  }
  
  if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Parameter limit harus berupa angka antara 1-100'
    });
  }
  
  next();
};

// Middleware untuk sanitasi input
export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};

// Middleware untuk rate limiting sederhana
const requestCounts = new Map();

export const simpleRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(clientId)) {
      requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const clientData = requestCounts.get(clientId);
    
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Terlalu banyak request, coba lagi nanti'
      });
    }
    
    clientData.count++;
    next();
  };
};