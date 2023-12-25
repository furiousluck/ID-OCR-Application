const express = require('express');
const router = express.Router();
const { getAllData, removeData, updateData, searchData } = require('../controllers/dataController.js');

router.get('/', getAllData);
router.delete('/remove/:id', removeData);
router.patch('/update/:id', updateData);
router.get('/search', searchData);

module.exports = router;