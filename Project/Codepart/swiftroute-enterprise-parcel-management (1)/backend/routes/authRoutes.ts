import { Router } from 'express';
import passport from 'passport';
import * as authController from '../controllers/authController';
import { authenticateJwt } from '../middleware/authMiddleware';
import { sanitizeInputs } from '../middleware/validationMiddleware';

const router = Router();

// Traditional auth routes
router.post('/register', sanitizeInputs, authController.register);
router.post('/login', sanitizeInputs, authController.login);
router.get('/me', authenticateJwt, authController.getCurrentUser);
router.put('/profile', authenticateJwt, sanitizeInputs, authController.updateProfile);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: 'http://localhost:5173?error=google_auth_failed' 
  }),
  authController.googleCallback
);

export default router;
