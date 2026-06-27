const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', async (req,res)=>{
  try{
    const user_id = req.headers['user_id'];
    const { policy_id, description } = req.body;

    if(!policy_id || !description){
      return res.json({ success:false, message:"Data tidak lengkap" });
    }

    const [result] = await db.query(
      "INSERT INTO claims (user_id, policy_id, description, status) VALUES (?,?,?,?)",
      [user_id, policy_id, description, 'pending']
    );

    res.json({
      success:true,
      claim_id: result.insertId
    });

  }catch(err){
    console.log("CREATE CLAIM ERROR:", err);
    res.json({ success:false });
  }
});

router.get('/', async (req,res)=>{
  try{
    const user_id = req.headers['user_id'];
    const role = req.headers['role'];

    let query = "SELECT * FROM claims";
    let params = [];

    if(role !== 'admin'){
      query += " WHERE user_id = ?";
      params.push(user_id);
    }

    const [data] = await db.query(query, params);

    res.json(data);

  }catch(err){
    console.log("GET CLAIM ERROR:", err);
    res.json([]);
  }
});


router.get('/:id', async (req,res)=>{
  try{
    const [data] = await db.query(
      "SELECT * FROM claims WHERE id = ?",
      [req.params.id]
    );

    res.json(data[0]);

  }catch(err){
    console.log("DETAIL CLAIM ERROR:", err);
    res.json({});
  }
});


router.put('/:id', async (req,res)=>{
  try{
    const role = req.headers['role'];

    // 🔥 hanya admin boleh
    if(role !== 'admin'){
      return res.json({ success:false, message:"Akses ditolak" });
    }

    const { status } = req.body;

    await db.query(
      "UPDATE claims SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

    res.json({ success:true });

  }catch(err){
    console.log("UPDATE CLAIM ERROR:", err);
    res.json({ success:false });
  }
});

module.exports = router;