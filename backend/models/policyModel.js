const db = require('../config/db');

const createPolicy = async (userId, productId, premium) => {
    const [result] = await db.query(
        "INSERT INTO policies (user_id, product_id, premium, status) VALUES (?, ?, ?, 'active')", 
        [userId, productId, premium]
    );
    return result.insertId;
};

const getUserPolicies = async (userId) => {
    const [rows] = await db.query("SELECT * FROM policies WHERE user_id = ?", [userId]);
    return rows;
};

const getAllPolicies = async () => {
    const [rows] = await db.query("SELECT * FROM policies");
    return rows;
};

module.exports = { createPolicy, getUserPolicies, getAllPolicies };