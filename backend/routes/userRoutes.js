const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Register
router.post('/register', async (req, res) => {
    const { user_name, first_name, last_name, user_email, user_password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(user_password, SALT_ROUNDS);
        const sql = 'INSERT INTO user (user_name, first_name, last_name, user_email, user_password) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [user_name, first_name, last_name, user_email, hashedPassword]);
        
        res.status(201).json({ success: true, message: 'User created successfully', userId: result.insertId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: 'Email already exists' });
        } else {
            res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
        }
    }
});

// Login
router.post('/login', async (req, res) => {
    const { user_email, user_password } = req.body;
    try {
        const sql = 'SELECT * FROM user WHERE user_email = ?';
        const [rows] = await db.execute(sql, [user_email]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(user_password, user.user_password);
        
        if (isMatch) {
            res.json({ 
                success: true,
                message: 'Authentication successful', 
                user_id: user.user_id,
                user_name: user.user_name,
                first_name: user.first_name,
                last_name: user.last_name,
                user_email: user.user_email
            });
        } else {
            res.status(401).json({ success: false, message: 'Incorrect password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all users
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT user_id, user_name, user_email FROM user');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    const user_id = req.params.id;
    try {
        const sql = 'SELECT user_id, user_name, first_name, last_name, user_email FROM user WHERE user_id = ?';
        const [rows] = await db.execute(sql, [user_id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user for edit
router.get('/:id/edit', async (req, res) => {
    const user_id = req.params.id;
    try {
        const sql = 'SELECT * FROM user WHERE user_id = ?';
        const [rows] = await db.execute(sql, [user_id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update user
router.post('/edit', async (req, res) => {
    const { user_id, user_name, first_name, last_name, user_email, user_password } = req.body;
    
    if (!user_id) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    try {
        const [currentUser] = await db.execute('SELECT * FROM user WHERE user_id = ?', [user_id]);
        
        if (currentUser.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = currentUser[0];
        
        const updatedUserName = user_name || user.user_name;
        const updatedFirstName = first_name || user.first_name;
        const updatedLastName = last_name || user.last_name;
        const updatedEmail = user_email || user.user_email;
        
        let updatedPassword = user.user_password;
        if (user_password && user_password.trim() !== '') {
            updatedPassword = await bcrypt.hash(user_password, SALT_ROUNDS);
        }

        const sql = 'UPDATE user SET user_name = ?, first_name = ?, last_name = ?, user_email = ?, user_password = ? WHERE user_id = ?';
        const [result] = await db.execute(sql, [updatedUserName, updatedFirstName, updatedLastName, updatedEmail, updatedPassword, user_id]);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: `User ID ${user_id} updated successfully` });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    
    try {
        const sql = 'DELETE FROM user WHERE user_id = ?';
        const [result] = await db.execute(sql, [id]);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: `User ID ${id} deleted successfully` });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;