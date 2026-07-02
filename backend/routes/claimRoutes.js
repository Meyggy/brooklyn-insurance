const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const { auth, isAdmin } = require('../middleware/auth');

router.use(auth);

router.post('/', claimController.createClaim);
router.get('/', claimController.getClaims);
router.get('/:id', claimController.getClaimById);
router.put('/:id', isAdmin, claimController.updateClaimStatus); 

module.exports = router;