const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

// Get user's finances
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT money, bitcoins FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ finances: users[0] });
  } catch (error) {
    console.error('Get finances error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bank accounts
router.get('/bank', authenticateToken, async (req, res) => {
  try {
    const [accounts] = await db.execute(
      'SELECT * FROM bank_accounts WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json({ accounts });
  } catch (error) {
    console.error('Get bank accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create bank account
router.post('/bank', authenticateToken, async (req, res) => {
  try {
    const accountNumber = generateAccountNumber();
    const password = generatePassword();

    const [result] = await db.execute(
      'INSERT INTO bank_accounts (account_number, password, user_id) VALUES (?, ?, ?)',
      [accountNumber, password, req.user.userId]
    );

    res.status(201).json({
      message: 'Bank account created successfully',
      account: {
        id: result.insertId,
        account_number: accountNumber,
        password: password
      }
    });
  } catch (error) {
    console.error('Create bank account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bitcoin wallets
router.get('/bitcoin', authenticateToken, async (req, res) => {
  try {
    const [wallets] = await db.execute(
      'SELECT * FROM bitcoin_wallets WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json({ wallets });
  } catch (error) {
    console.error('Get bitcoin wallets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create bitcoin wallet
router.post('/bitcoin', authenticateToken, async (req, res) => {
  try {
    const address = generateBitcoinAddress();
    const privateKey = generatePrivateKey();

    const [result] = await db.execute(
      'INSERT INTO bitcoin_wallets (address, user_id, private_key) VALUES (?, ?, ?)',
      [address, req.user.userId, privateKey]
    );

    res.status(201).json({
      message: 'Bitcoin wallet created successfully',
      wallet: {
        id: result.insertId,
        address: address,
        private_key: privateKey
      }
    });
  } catch (error) {
    console.error('Create bitcoin wallet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transfer money between accounts
router.post('/transfer', authenticateToken, async (req, res) => {
  try {
    const { from_type, from_id, to_type, to_id, amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      let fromBalance = 0;
      let toBalance = 0;

      // Get source balance
      if (from_type === 'wallet') {
        const [wallets] = await connection.execute(
          'SELECT balance FROM users WHERE id = ?',
          [req.user.userId]
        );
        fromBalance = parseInt(wallets[0].money);
      } else if (from_type === 'bank') {
        const [accounts] = await connection.execute(
          'SELECT balance FROM bank_accounts WHERE id = ? AND user_id = ?',
          [from_id, req.user.userId]
        );
        if (accounts.length === 0) {
          throw new Error('Bank account not found');
        }
        fromBalance = parseInt(accounts[0].balance);
      }

      // Check if enough balance
      if (fromBalance < amount) {
        throw new Error('Insufficient funds');
      }

      // Deduct from source
      if (from_type === 'wallet') {
        await connection.execute(
          'UPDATE users SET money = money - ? WHERE id = ?',
          [amount, req.user.userId]
        );
      } else if (from_type === 'bank') {
        await connection.execute(
          'UPDATE bank_accounts SET balance = balance - ? WHERE id = ? AND user_id = ?',
          [amount, from_id, req.user.userId]
        );
      }

      // Add to destination
      if (to_type === 'wallet') {
        await connection.execute(
          'UPDATE users SET money = money + ? WHERE id = ?',
          [amount, req.user.userId]
        );
      } else if (to_type === 'bank') {
        await connection.execute(
          'UPDATE bank_accounts SET balance = balance + ? WHERE id = ? AND user_id = ?',
          [amount, to_id, req.user.userId]
        );
      }

      await connection.commit();
      connection.release();

      res.json({
        message: 'Transfer completed successfully',
        amount: amount
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Helper functions
function generateAccountNumber() {
  return Math.floor(Math.random() * 900000000000) + 100000000000;
}

function generatePassword() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateBitcoinAddress() {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 34; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generatePrivateKey() {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = router;