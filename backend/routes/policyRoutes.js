const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const policyController = require('../controllers/policyController');

router.post('/', auth, policyController.createPolicy);
router.get('/user', auth, policyController.getUserPolicies);
router.get('/', auth, isAdmin, policyController.getAllPolicies);
router.post('/calculate', auth, policyController.calculatePremium);
module.exports = router;