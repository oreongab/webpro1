const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all places (with optional rank ordering)
router.get('/place', async (req, res) => {
    try {
        const { page } = req.query;
        
        const orderBy = page === 'rank' 
            ? 'ORDER BY p.place_score DESC, p.place_id'
            : 'ORDER BY p.place_id';
        
        const sql = `
            SELECT 
                p.place_id,
                p.place_name,
                p.place_province,
                p.opening_hours,
                p.place_score,
                pi.image_path
            FROM place p
            LEFT JOIN place_images pi USING (place_id)
            ${orderBy}
        `;
        
        const [rows] = await db.execute(sql);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching places:', error);
        res.status(500).json({ success: false, message: 'Error fetching places', error: error.message });
    }
});

// Get places ranked by score
router.get('/rank', async (req, res) => {
    try {
        const sql = `
            SELECT DISTINCT 
                p.place_id,
                p.place_name,
                p.place_province,
                p.opening_hours,
                p.place_score,
                image_path 
            FROM place p
            LEFT JOIN place_images USING (place_id)
            ORDER BY place_score DESC, p.place_id
        `;
        
        const [rows] = await db.execute(sql);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching rank:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search places
router.get('/search', async (req, res) => {
    try {
        const { query, page } = req.query;
        
        if (!query || query.trim() === '') {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }
        
        const orderBy = page === 'rank' 
            ? 'ORDER BY place_score DESC, p.place_id'
            : 'ORDER BY p.place_id';
        
        const sql = `
            SELECT DISTINCT 
                p.place_id,
                p.place_name,
                p.place_province,
                p.opening_hours,
                p.place_score,
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

// Filter by opening hours
router.get('/filter/opening', async (req, res) => {
    try {
        const { everyday, opennow, weekday, hours24, days, page } = req.query;
        
        const orderBy = page === 'rank' 
            ? 'ORDER BY place_score DESC, p.place_id'
            : 'ORDER BY p.place_id';
        
        const sql = `
            SELECT DISTINCT 
                p.place_id,
                p.place_name,
                p.place_province,
                p.opening_hours,
                p.place_score,
                (SELECT image_path FROM place_images WHERE place_id = p.place_id LIMIT 1) as image_path
            FROM place p
            ${orderBy}
        `;
        
        const [rows] = await db.execute(sql);
        
        res.json({ 
            success: true, 
            data: rows,
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

// Get places by category
router.get('/category/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { page } = req.query;
        
        const categoryMapping = {
            'cafes': 'Cafe & Restaurants',
            'temples': 'Temple',
            'natural': 'Natural',
            'sport': 'Sports',
            'art': 'Art',
            'museums': 'Museums',
            'markets': 'Markets',
            'beaches': 'Beaches',
            'parks': 'Parks & Garden',
            'historical': 'History',
            'malls': 'Mall',
            'other': 'Other'
        };
        
        const dbCategoryName = categoryMapping[type];

        if (!dbCategoryName) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const orderBy = page === 'rank' 
            ? 'ORDER BY place_score DESC, p.place_id'
            : 'ORDER BY p.place_id';

        const sql = `
            SELECT DISTINCT p.place_id,
                p.place_name,
                p.place_province,
                p.opening_hours,
                p.place_score,
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
        console.error(`Error fetching category:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get place detail by ID
router.get('/:id', async (req, res) => {
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
                p.place_score,
                p.starting_price,
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
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;