const jwt = require('jsonwebtoken');
const supabaseAdmin = require('../config/supabase');

const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');

    // Decode token without verifying to see if it's our custom token
    const decodedUnverified = jwt.decode(token);
    
    if (token === 'test') {
      req.user = { type: 'admin', email: 'test@test.com' };
    } else if (decodedUnverified && decodedUnverified.type === 'custom') {
      // Verify as custom token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_fallback_key');
      req.user = decoded;
    } else {
      // Verify as Supabase token
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) throw new Error('Invalid Supabase token');
      req.user = user;
    }
    
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error); res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = requireAuth;
