const express = require('express');
const router = express.Router();
const db = require('../db');

// Filter by category and province
router.get('/', async (req, res) => {
    try {
        const { types, provinces, page } = req.query;
        
        const orderBy = page === 'rank' 
            ? 'ORDER BY p.place_score DESC, p.place_id'
            : 'ORDER BY p.place_id';
        
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
            LEFT JOIN place_category pc USING (place_id)
            LEFT JOIN category c USING (category_id)
            WHERE 1=1
        `;
        
        let params = [];

        if (types) {
            const typeList = Array.isArray(types) ? types : types.split(',');
            const placeholders = typeList.map(() => '?').join(',');
            sql += ` AND c.category_name IN (${placeholders})`;
            params.push(...typeList);
        }

        if (provinces) {
            const provinceList = Array.isArray(provinces) ? provinces : provinces.split(',');
            const placeholders = provinceList.map(() => '?').join(',');
            sql += ` AND p.place_eng_province IN (${placeholders})`;
            params.push(...provinceList);
        }

        sql += ` ${orderBy}`;

        const [rows] = await db.execute(sql, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Filter error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;