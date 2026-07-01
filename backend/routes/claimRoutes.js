const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const { auth, isAdmin } = require('../middleware/auth');

// Semua route di bawah ini wajib login (menggunakan middleware auth)
router.use(auth);

// Rute sesuai standar REST
router.post('/', auth, claimController.createClaim);
router.get('/', auth, claimController.getClaims);
router.get('/:id', auth, claimController.getClaimById); // Pastikan ada fungsi ini di controller
router.put('/:id', isAdmin, claimController.updateClaimStatus); // Hanya admin yang bisa update status

module.exports = router;