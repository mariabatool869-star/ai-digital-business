const express = require('express');
const router = express.Router();
const { searchDomain, searchDomains } = require('../controllers/domainController');

router.get('/search', searchDomain);
router.get('/search-all', searchDomains);

module.exports = router;
