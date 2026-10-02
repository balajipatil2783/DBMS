import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { config } from './index';
import { db } from '../database/connection';
import { User } from '../../shared/types';

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: any) => {
      try {
        // Extract user info from Google profile
        const email = profile.emails?.[0]?.value;
        const fullName = profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`.trim();
        const googleId = profile.id;

        if (!email) {
          return done(new Error('No email found in Google profile'), null);
        }

        const users = db.getTable('users');
        
        // Check if user already exists
        let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (user) {
          // User exists, return the user
          const { password_hash, ...safeUser } = user;
          return done(null, safeUser);
        }

        // Create new user from Google profile
        const newUser: User & { password_hash: string; google_id?: string } = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          full_name: fullName,
          email: email.toLowerCase(),
          password_hash: '', // No password for OAuth users
          google_id: googleId,
          role: 'customer', // Default role for Google OAuth users
          phone: '',
          address: '',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        db.insert('users', newUser);

        const { password_hash, google_id, ...safeUser } = newUser;
        return done(null, safeUser);
      } catch (error: any) {
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id: string, done) => {
  try {
    const users = db.getTable('users');
    const user = users.find((u) => u.id === id);
    if (user) {
      const { password_hash, ...safeUser } = user;
      done(null, safeUser);
    } else {
      done(new Error('User not found'), null);
    }
  } catch (error) {
    done(error, null);
  }
});

export default passport;
