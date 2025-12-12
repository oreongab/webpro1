const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all favorites for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        //get all favorite places
        const sql = `
            SELECT DISTINCT
                p.place_id,
                p.place_name,
                p.place_province,
                p.place_eng_province,
                p.opening_hours,
                p.place_score,
                f.favorite_id
            FROM favorite f
            JOIN place p USING (place_id)
            WHERE f.user_id = ?
            ORDER BY f.favorite_id DESC
        `;
        
        const [rows] = await db.execute(sql, [userId]);
        
        // For each place, get images and categories
        const placesWithDetails = await Promise.all(rows.map(async (place) => {
            // Get first image
            const [images] = await db.execute(
                'SELECT image_path FROM place_images WHERE place_id = ? LIMIT 1',
                [place.place_id]
            );
            
            // Get all categories for this place
            const [categories] = await db.execute(`
                SELECT c.category_name 
                FROM place_category pc 
                JOIN category c USING (category_id)
                WHERE pc.place_id = ?
            `, [place.place_id]);
            
            const categoryString = categories.map(cat => cat.category_name).join(',');
            console.log(`Place ${place.place_id} (${place.place_name}):`);
            console.log('  Categories from DB:', categories);
            console.log('  Category string:', categoryString);
            
            return {
                ...place,
                image_path: images[0]?.image_path || null,
                categories: categoryString
            };
        }));
        
        console.log('Favorites with categories:', placesWithDetails);
        
        res.json({ success: true, data: placesWithDetails });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Check if place is favorited
router.get('/:userId/:placeId', async (req, res) => {
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

// Add favorite
router.post('/', async (req, res) => {
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
        res.status(500).json({ success: false, error: error.message });
    }
});

// Remove favorite
router.delete('/:userId/:placeId', async (req, res) => {
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
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;