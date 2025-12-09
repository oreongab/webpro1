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

// 3. API ดึงข้อมูล User สำหรับหน้า Edit
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

// 6. API แก้ไขข้อมูลผู้ใช้ (Edit User)
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

//7.API ดึงสถานที่
app.get('/places', async (req, res) => {
    try {
        const sql = `
            SELECT 
                p.place_id,
                p.place_name,
                p.opening_hours,
                p.place_score,
                pi.image_path
            FROM place p
            LEFT JOIN place_images pi ON p.place_id = pi.place_id
            ORDER BY p.place_id
        `;
        const [rows] = await db.execute(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching places:', error);
        res.status(500).json({ error: error.message });
    }
});

//place detail 
// ใน server.js - แก้ place detail API
app.get('/places/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid place ID' });
        }
        
        // ⚠️ แก้: ใช้ CAST เพื่อแปลง numeric เป็น DECIMAL
        const sql = `
            SELECT
                p.place_id,
                p.place_name,
                p.place_province,
                p.place_address,
                p.opening_hours,
                CAST(p.place_score AS DECIMAL(10,1)) as place_score,
                CAST(p.starting_price AS DECIMAL(10,0)) as starting_price,
                p.place_event,
                GROUP_CONCAT(DISTINCT c.category_name SEPARATOR ', ') as categories
            FROM place p
            LEFT JOIN place_category pc ON p.place_id = pc.place_id
            LEFT JOIN category c ON pc.category_id = c.category_id
            WHERE p.place_id = ?
            GROUP BY p.place_id
        `;
        
        const [rows] = await db.execute(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Place not found' });
        }

        const place = rows[0];

        // ดึงรูปภาพแยก
        const imageSQL = `SELECT image_path FROM place_images WHERE place_id = ? ORDER BY image_id`;
        const [images] = await db.execute(imageSQL, [id]);
        
        place.images = images.map(img => img.image_path);

        res.json({ 
            success: true, 
            data: place
        });
        
    } catch (error) {
        console.error('Get place detail error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// กรอง categorybar
const categoryMapping = {
    'cafes':      'Cafe & Restaurants',
    'temples':    'Temple',
    'natural':    'Natural',
    'sport':      'Sports',
    'art':        'Art',
    'museums':    'Museums',
    'markets':    'Markets',
    'beaches':    'Beaches',
    'parks':      'Parks & Garden',
    'historical': 'History',
    'malls':      'Mall',
    'other':      'Other'
};

app.get('/places/category/:type', async (req, res) => {
    try {
        const { type } = req.params; 
        const dbCategoryName = categoryMapping[type]; 

   
        if (!dbCategoryName) {
            console.warn(`Invalid category requested: ${type}`);
            return res.status(404).json({ error: 'Category not found or invalid' });
        }

        const sql = `
            SELECT DISTINCT p.place_id,
                p.place_name,
                p.opening_hours,
                p.place_score,
                image_path 
            FROM place p
            LEFT JOIN place_images USING (place_id)
            JOIN place_category USING (place_id)
            JOIN category USING (category_id) 
            WHERE category_name = ?
        `;

        const [rows] = await db.execute(sql, [dbCategoryName]);
        
        res.json(rows);

    } catch (error) {
        console.error(`Error fetching category ${req.params.type}:`, error);
        res.status(500).json({ error: error.message });
    }
});

//category
// API กรองตาม category และ province
app.get('/categories', async (req, res) => {
    try {
        const { types, provinces } = req.query;
        
        console.log('=== /categories endpoint ===');
        console.log('Types:', types);
        console.log('Provinces:', provinces);
        
        let sql = `
            SELECT DISTINCT 
                p.place_id,
                p.place_name,
                p.place_province,
                p.place_eng_province,
                p.opening_hours,
                p.place_score,
                (SELECT image_path FROM place_images WHERE place_id = p.place_id LIMIT 1) as image_path
            FROM place p
            LEFT JOIN place_category pc ON p.place_id = pc.place_id
            LEFT JOIN category c ON pc.category_id = c.category_id
            WHERE 1=1
        `;
        
        let params = [];

        if (types) {
            const typeList = Array.isArray(types) ? types : [types];
            const placeholders = typeList.map(() => '?').join(',');
            sql += ` AND c.category_name IN (${placeholders})`;
            params.push(...typeList);
            console.log('Filtering by types:', typeList);
        }

        if (provinces) {
            const provinceList = Array.isArray(provinces) ? provinces : [provinces];
            const placeholders = provinceList.map(() => '?').join(',');
            // ใช้ place_eng_province แทน place_province
            sql += ` AND p.place_eng_province IN (${placeholders})`;
            params.push(...provinceList);
            console.log('Filtering by provinces:', provinceList);
        }

        sql += ` ORDER BY p.place_id`;

        console.log('SQL:', sql);
        console.log('Params:', params);

        const [rows] = await db.execute(sql, params);
        console.log('Results count:', rows.length);
        
        res.json({ 
            success: true, 
            filters: { types, provinces }, 
            count: rows.length, 
            data: rows 
        });

    } catch (err) {
        console.error('Filter error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

//filter by opening days


//get favorite
app.get('/favorites/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        
        console.log('User ID:', userId);
        
        const sql = `
            SELECT DISTINCT
                p.place_id,
                p.place_name,
                p.place_province,
                p.opening_hours,
                p.place_score,
                (SELECT image_path FROM place_images WHERE place_id = p.place_id LIMIT 1) as image_path,
                f.favorite_id
            FROM favorite f
            INNER JOIN place p ON f.place_id = p.place_id
            WHERE f.user_id = ?
            ORDER BY f.favorite_id DESC
        `;
        
        const [rows] = await db.execute(sql, [userId]);
        
        console.log('Favorites found:', rows.length);
        console.log('Place IDs:', rows.map(r => r.place_id));
        
        res.json({ success: true, data: rows });
        
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});



// Check favorited
app.get('/favorites/:userId/:placeId', async (req, res) => {
    try {
        const { userId, placeId } = req.params;
        
        const sql = 'SELECT * FROM favorite WHERE user_id = ? AND place_id = ?';
        const [rows] = await db.execute(sql, [userId, placeId]);
        
        res.json({ 
            success: true, 
            isFavorite: rows.length > 0,
            favoriteId: rows.length > 0 ? rows[0].favorite_id : null
        });
        
    } catch (error) {
        console.error('Check favorite error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// add favorite
app.post('/favorites', async (req, res) => {
    try {
        const { user_id, place_id } = req.body;
        
        if (!user_id || !place_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'user_id and place_id are required' 
            });
        }

        // Check if already favorited
        const checkSQL = 'SELECT * FROM favorite WHERE user_id = ? AND place_id = ?';
        const [existing] = await db.execute(checkSQL, [user_id, place_id]);
        
        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Place already in favorites' 
            });
        }

        // Insert favorite
        const sql = 'INSERT INTO favorite (user_id, place_id) VALUES (?, ?)';
        const [result] = await db.execute(sql, [user_id, place_id]);
        
        res.status(201).json({ 
            success: true, 
            message: 'Added to favorites', 
            favoriteId: result.insertId 
        });
        
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});


//remove favorite
   app.delete('/favorites/:userId/:placeId', async (req, res) => {
    try {
        const { userId, placeId } = req.params;
        
        const sql = 'DELETE FROM favorite WHERE user_id = ? AND place_id = ?';
        const [result] = await db.execute(sql, [userId, placeId]);
        
        if (result.affectedRows > 0) {
            res.json({ 
                success: true, 
                message: 'Removed from favorites' 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Favorite not found' 
            });
        }
        
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});



//rank
    



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

