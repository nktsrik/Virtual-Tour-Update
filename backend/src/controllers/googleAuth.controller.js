// src/controllers/googleAuth.controller.js
import authService from '../services/auth.service.js';

const googleLogin = async (req, res) => {
  try {
    const { googleToken, email, nama } = req.body;
    
    if (!googleToken || !email) {
      return res.status(400).json({
        success: false,
        message: 'Google token dan email wajib diisi'
      });
    }

    // Verify Google token (implementasi sesuai kebutuhan)
    // const googleUser = await verifyGoogleToken(googleToken);
    
    const result = await authService.googleLogin({ 
      email, 
      nama, 
      google_id: googleToken 
    });
    
    const roleMessage = result.user.role_id === 1 ? 'admin' : 'wisatawan';
    
    res.json({
      success: true,
      message: `Login Google berhasil sebagai ${roleMessage}`,
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  googleLogin
};