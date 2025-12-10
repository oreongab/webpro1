const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;
const SALT_ROUNDS = 10;

app.use(cors());
app.use(express.json());

// 1.Register
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

// 2.Login
app.post('/login', async (req, res) => {
    const { user_email, user_password } = req.body;
    try {
        const sql = 'SELECT * FROM user WHERE user_email = ?';
        const [rows] = await db.execute(sql, [user_email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

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

// 3. ดึงข้อมูล User หน้า Edit
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

// 4.Get All Users
app.get('/users', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT user_id, user_name, user_email FROM user');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. ลบผู้ใช้ตาม ID 
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

// 6.Edit User
app.post('/edituser', async (req, res) => {
    const { user_id, user_name, first_name, last_name, user_email, user_password } = req.body;
    
    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const [currentUser] = await db.execute('SELECT * FROM user WHERE user_id = ?', [user_id]);
        
        if (currentUser.length === 0) {
            return res.status(404).json({ message: 'User not found' });
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
            res.json({ message: `User ID ${user_id} updated successfully` });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 7. ดึงสถานที่ทั้งหมด 
app.get('/places', async (req, res) => {
    try {
        const { page } = req.query;
        
        const orderBy = page === 'rank' 
            ? 'ORDER BY CAST(p.place_score AS DECIMAL(3,1)) DESC, p.place_id'
            : 'ORDER BY p.place_id';
        
        const sql = `
            SELECT 
                p.place_id,
                p.place_name,
                p.place_province,
                p.opening_hours,
                CAST(p.place_score AS DECIMAL(3,1)) as place_score,
                pi.image_path
            FROM place p
            LEFT JOIN place_images pi ON p.place_id = pi.place_id
            ${orderBy}
        `;
        const [rows] = await db.execute(sql);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching places:', error);
        res.status(500).json({ success: false, message: 'Error fetching places', error: error.message });
    }
});

// 7.1. Filter places by opening hours (ต้องอยู่ก่อน /places/:id)
app.get('/places/filter/opening', async (req, res) => {
    try {
        const { everyday, opennow, weekday, hours24, days, page } = req.query;
        
        console.log('=== Opening Hours Filter API ===');
        console.log('Filters:', { everyday, opennow, weekday, hours24, days });
        console.log('Page:', page || 'home');
        
        const orderBy = page === 'rank' 
            ? 'ORDER BY CAST(p.place_score AS DECIMAL(3,1)) DESC, p.place_id'
            : 'ORDER BY p.place_id';
        
        const sql = `
            SELECT DISTINCT 
                p.place_id,
                p.place_name,
                p.place_province,
                p.opening_hours,
                CAST(p.place_score AS DECIMAL(3,1)) as place_score,
                (SELECT image_path FROM place_images WHERE place_id = p.place_id LIMIT 1) as image_path
            FROM place p
            ${orderBy}
        `;
        
        const [rows] = await db.execute(sql);
        console.log('Total places:', rows.length);
        
        // ส่งข้อมูลทั้งหมดพร้อม filters ไปให้ Frontend กรองเอง
        res.json({ 
            success: true, 
            data: rows, 
            count: rows.length,
            filters: {
                everyday: everyday === 'true',
                opennow: opennow === 'true',
                weekday: weekday === 'true',
                hours24: hours24 === 'true',
                selectedDays: days ? (Array.isArray(days) ? days : [days]) : []
            }
        });
        
    } catch (error) {
        console.error('Opening hours filter error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 8. Place detail
app.get('/places/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid place ID' });
        }
        
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

        const imageSQL = `SELECT image_path FROM place_images WHERE place_id = ? ORDER BY image_id`;
        const [images] = await db.execute(imageSQL, [id]);
        
        place.images = images.map(img => img.image_path);

        res.json({ success: true, data: place });
        
    } catch (error) {
        console.error('Get place detail error:', error);
        res.status(500).json({ success: false, message: 'Error fetching place detail', error: error.message });
    }
});

// 9. กรอง categorybar
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
        const { page } = req.query;
        const dbCategoryName = categoryMapping[type]; 

        if (!dbCategoryName) {
            return res.status(404).json({ success: false, message: 'Category not found or invalid' });
        }

        const orderBy = page === 'rank' 
            ? 'ORDER BY CAST(p.place_score AS DECIMAL(3,1)) DESC, p.place_id'
            : 'ORDER BY p.place_id';

        const sql = `
            SELECT DISTINCT p.place_id,
                p.place_name,
                p.place_province,
                p.opening_hours,
                CAST(p.place_score AS DECIMAL(3,1)) as place_score,
                image_path 
            FROM place p
            LEFT JOIN place_images USING (place_id)
            JOIN place_category USING (place_id)
            JOIN category USING (category_id) 
            WHERE category_name = ?
            ${orderBy}
        `;

        const [rows] = await db.execute(sql, [dbCategoryName]);
        res.json({ success: true, data: rows });

    } catch (error) {
        console.error(`Error fetching category ${req.params.type}:`, error);
        res.status(500).json({ success: false, message: 'Error fetching category', error: error.message });
    }
});

// 10. category & province - รองรับทั้ง HOME และ RANK
app.get('/categories', async (req, res) => {
    try {
        const { types, provinces, page } = req.query;
        
        const orderBy = page === 'rank' 
            ? 'ORDER BY CAST(p.place_score AS DECIMAL(3,1)) DESC, p.place_id'
            : 'ORDER BY p.place_id';
        
        let sql = `
            SELECT DISTINCT 
                p.place_id,
                p.place_name,
                p.place_province,
                p.place_eng_province,
                p.opening_hours,
                CAST(p.place_score AS DECIMAL(3,1)) as place_score,
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
        }

        if (provinces) {
            const provinceList = Array.isArray(provinces) ? provinces : [provinces];
            const placeholders = provinceList.map(() => '?').join(',');
            sql += ` AND p.place_eng_province IN (${placeholders})`;
            params.push(...provinceList);
        }

        sql += ` ${orderBy}`;

        const [rows] = await db.execute(sql, params);
        res.json({ success: true, data: rows });

    } catch (err) {
        console.error('Filter error:', err);
        res.status(500).json({ success: false, message: 'Error filtering places', error: err.message });
    }
});

// 11. Get favorite
app.get('/favorites/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const sql = `
            SELECT DISTINCT
                p.place_id,
                p.place_name,
                p.place_province,
                p.opening_hours,
                CAST(p.place_score AS DECIMAL(3,1)) as place_score,
                (SELECT image_path FROM place_images WHERE place_id = p.place_id LIMIT 1) as image_path,
                f.favorite_id
            FROM favorite f
            INNER JOIN place p ON f.place_id = p.place_id
            WHERE f.user_id = ?
            ORDER BY f.favorite_id DESC
        `;
        
        const [rows] = await db.execute(sql, [userId]);
        res.json({ success: true, data: rows });
        
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ success: false, message: 'Error fetching favorites', error: error.message });
    }
});

// 12. Check favorited
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
        res.status(500).json({ success: false, message: 'Error checking favorite', error: error.message });
    }
});

// 13. Add favorite
app.post('/favorites', async (req, res) => {
    try {
        const { user_id, place_id } = req.body;
        
        if (!user_id || !place_id) {
            return res.status(400).json({ 
                success: false,
                message: 'user_id and place_id are required' 
            });
        }

        const checkSQL = 'SELECT * FROM favorite WHERE user_id = ? AND place_id = ?';
        const [existing] = await db.execute(checkSQL, [user_id, place_id]);
        
        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Place already in favorites' 
            });
        }

        const sql = 'INSERT INTO favorite (user_id, place_id) VALUES (?, ?)';
        const [result] = await db.execute(sql, [user_id, place_id]);
        
        res.status(201).json({ 
            success: true,
            message: 'Added to favorites', 
            favoriteId: result.insertId 
        });
        
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ success: false, message: 'Error adding favorite', error: error.message });
    }
});

// 14. Remove favorite
app.delete('/favorites/:userId/:placeId', async (req, res) => {
    try {
        const { userId, placeId } = req.params;
        
        const sql = 'DELETE FROM favorite WHERE user_id = ? AND place_id = ?';
        const [result] = await db.execute(sql, [userId, placeId]);
        
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Removed from favorites' });
        } else {
            res.status(404).json({ success: false, message: 'Favorite not found' });
        }
        
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ success: false, message: 'Error removing favorite', error: error.message });
    }
});



//rank
app.get('/places/rank', async (req, res) => {    
    try {
        console.log('=== Rank API called ===');
        
        const sql = `
            SELECT DISTINCT 
                p.place_id,
                p.place_name,
                p.place_province,
                p.opening_hours,
                CAST(p.place_score AS DECIMAL(3,1)) as place_score,
                image_path 
            FROM place p
            LEFT JOIN place_images USING (place_id)   
            LEFT JOIN place_category USING (place_id)
            LEFT JOIN category USING (category_id) 
            ORDER BY CAST(p.place_score AS DECIMAL(3,1)) DESC, p.place_id
        `;
        const [rows] = await db.execute(sql);
        
        console.log('Rank query results:', rows.length, 'places');
        if (rows.length > 0) {
            console.log('First 5 places:', rows.slice(0, 5).map(r => ({
                id: r.place_id,
                name: r.place_name,
                score: r.place_score
            })));
        }
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching rank:', error);
        res.status(500).json({ error: error.message });
    }
});

// 15. Search - ค้นหาสถานที่ตามชื่อหรือจังหวัด - รองรับทั้ง HOME และ RANK
app.get('/places/search', async (req, res) => {
    try {
        const { query, page } = req.query;
        
        if (!query || query.trim() === '') {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }
        
        const orderBy = page === 'rank' 
            ? 'ORDER BY CAST(p.place_score AS DECIMAL(3,1)) DESC, p.place_id'
            : 'ORDER BY p.place_id';
        
        const sql = `
            SELECT DISTINCT 
                p.place_id,
                p.place_name,
                p.place_province,
                p.opening_hours,
                CAST(p.place_score AS DECIMAL(3,1)) as place_score,
                (SELECT image_path FROM place_images WHERE place_id = p.place_id LIMIT 1) as image_path
            FROM place p
            WHERE p.place_name LIKE ? OR p.place_province LIKE ?
            ${orderBy}
        `;
        
        const searchTerm = `%${query}%`;
        const [rows] = await db.execute(sql, [searchTerm, searchTerm]);
        res.json({ success: true, data: rows });
        
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, message: 'Error searching places', error: error.message });
    }
});

    



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});