const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;
const SALT_ROUNDS = 10;


app.use(cors()); // อนุญาตให้เชื่อมต่อข้ามโดเมนได้
app.use(express.json()); // อ่านข้อมูล JSON ที่ส่งมาจาก Frontend

// 1. API สมัครสมาชิก (Register)
app.post('/register', async (req, res) => {
    const { user_name, first_name, last_name, user_email, user_password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(user_password, SALT_ROUNDS);
        const sql = 'INSERT INTO user (user_name, first_name, last_name, user_email, user_password) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [user_name, first_name, last_name, user_email, hashedPassword]);
        
        res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ message: 'Email already exists' });
        } else {
            res.status(500).json({ message: 'Error creating user', error: error.message });
        }
    }
});

// 2. API ล็อกอิน (Login)
app.post('/login', async (req, res) => {
    const { user_email, user_password } = req.body;
    try {
        const sql = 'SELECT * FROM user WHERE user_email = ?';
        const [rows] = await db.execute(sql, [user_email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // แก้ไข: rows[0] คือ object ไม่ต้องใส่ [] ครอบ
        const user = rows[0]; 

        const isMatch = await bcrypt.compare(user_password, user.user_password);
        if (isMatch) {
            res.json({ 
                message: 'Authentication successful', 
                user_id: user.user_id,
                user_name: user.user_name,
                first_name: user.first_name,
                last_name: user.last_name,
                user_email: user.user_email
            });
            console.log(`User ${user.user_name} logged in successfully`);
        } else {
            res.status(401).json({ message: 'Incorrect password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 3. API ดึงข้อมูล User สำหรับหน้า Edit (รวมรหัสผ่าน) - ต้องอยู่ก่อน /users/:id
app.get('/users/:id/edit', async (req, res) => {
    const user_id = req.params.id;
    console.log('Edit API called for user_id:', user_id);
    try {
        const sql = 'SELECT * FROM user WHERE user_id = ?';
        const [rows] = await db.execute(sql, [user_id]);
        
        console.log('Query result:', rows);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Edit API error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3.1 API ดึงข้อมูล User ที่ Login (Get Current User)
app.get('/users/:id', async (req, res) => {
    const user_id = req.params.id;
    try {
        const sql = 'SELECT user_id, user_name, first_name, last_name, user_email FROM user WHERE user_id = ?';
        const [rows] = await db.execute(sql, [user_id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. API ดึงข้อมูลทั้งหมด (Get All Users)
app.get('/users', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT user_id, user_name, user_email FROM user');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. API ลบผู้ใช้ตาม ID (Delete User by ID)
app.delete('/users/:id', async (req, res) => {
    const id = req.params.id; 
    
    try {
        const sql = 'DELETE FROM user WHERE user_id = ?';
        const [result] = await db.execute(sql, [id]);

        if (result.affectedRows > 0) {
            res.json({ message: `User ID ${id} deleted successfully` });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/edituser', async (req, res) => {
    const { user_id, user_name, first_name, last_name, user_email, user_password } = req.body;
    
    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        // ดึงข้อมูลปัจจุบันของ user
        const [currentUser] = await db.execute('SELECT * FROM user WHERE user_id = ?', [user_id]);
        
        if (currentUser.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = currentUser[0];
        
        // ใช้ค่าเดิมถ้าไม่มีการส่งมา
        const updatedUserName = user_name || user.user_name;
        const updatedFirstName = first_name || user.first_name;
        const updatedLastName = last_name || user.last_name;
        const updatedEmail = user_email || user.user_email;
        
        // อัปเดตรหัสผ่านเฉพาะถ้ามีการส่งมา
        let updatedPassword = user.user_password;
        if (user_password && user_password.trim() !== '') {
            updatedPassword = await bcrypt.hash(user_password, SALT_ROUNDS);
        }

        const sql = 'UPDATE user SET user_name = ?, first_name = ?, last_name = ?, user_email = ?, user_password = ? WHERE user_id = ?';
        const [result] = await db.execute(sql, [updatedUserName, updatedFirstName, updatedLastName, updatedEmail, updatedPassword, user_id]);

        if (result.affectedRows > 0) {
            res.json({ message: `User ID ${user_id} updated successfully` });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// เริ่มต้น Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

