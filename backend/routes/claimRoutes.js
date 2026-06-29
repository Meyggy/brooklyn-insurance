const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const { auth, isAdmin } = require('../middleware/auth');

// Semua route di bawah ini wajib login (menggunakan middleware auth)
router.use(auth);

// Rute sesuai standar REST
router.post('/', claimController.createClaim);
router.get('/', claimController.getClaims);
router.get('/:id', claimController.getClaimById); // Pastikan ada fungsi ini di controller
router.put('/:id', isAdmin, claimController.updateClaimStatus); // Hanya admin yang bisa update status

module.exports = router;