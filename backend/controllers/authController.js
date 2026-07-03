const supabaseAdmin = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = username.toLowerCase().trim();

    // 1. Try finding user in astrologers table (Custom Auth) FIRST
    const { data: user, error: dbError } = await supabaseAdmin
      .from('astrologers')
      .select('*')
      .eq('username', normalizedUsername)
      .single();

    if (user) {
      // It's an astrologer in the custom table
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Generate simple JWT for table-based users
      const token = jwt.sign(
        { id: user.id, username: user.username, role: 'astrologer', type: 'custom' },
        process.env.JWT_SECRET || 'supersecret_fallback_key',
        { expiresIn: '24h' }
      );

      const profile = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: 'astrologer',
        credits_balance: user.credits_balance
      };

      return res.status(200).json({ 
        token,
        user: profile,
        profile
      });
    }

    // 2. If not found in astrologers table, AND looks like an email, try Supabase Auth (Admin)
    if (normalizedUsername.includes('@')) {
      const { createClient } = require('@supabase/supabase-js');
      const tempAuthClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      
      const { data, error } = await tempAuthClient.auth.signInWithPassword({
        email: normalizedUsername,
        password
      });

      if (!error && data?.session) {
        // Successful Supabase Auth login
        const profile = {
          role: 'admin',
          name: 'Admin',
          email: data.user.email
        };

        return res.status(200).json({ 
          token: data.session.access_token,
          user: data.user,
          profile
        });
      }
    }

    // 3. If everything failed
    return res.status(401).json({ error: 'Invalid username or password' });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // Check if the request was authenticated via custom JWT (Astrologer)
    if (req.user.type === 'custom') {
      const { data: profile, error } = await supabaseAdmin
        .from('astrologers')
        .select('*')
        .eq('id', req.user.id)
        .single();

      if (error || !profile) {
        return res.status(404).json({ error: 'Profile not found or access denied' });
      }
      return res.status(200).json({ profile, user: req.user });
    }

    // Otherwise, it was authenticated via Supabase Auth (Admin)
    return res.status(200).json({ 
      profile: { 
        role: 'admin', 
        name: 'Admin',
        email: req.user.email
      }, 
      user: req.user 
    });
  } catch (error) {
    console.error('getProfile server error:', error);
    res.status(500).json({ error: error.message });
  }
};
