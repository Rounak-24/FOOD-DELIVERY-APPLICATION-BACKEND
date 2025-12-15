const express = require('express');
const router = express.Router();
const jwtAuthMiddleware = require('../middlewares/jwtauth.middleware');

const {
    addItem,
    getItem
} = require('../controllers/item.controller')

router.post('/add-item',jwtAuthMiddleware,addItem)
router.get('/get-item',jwtAuthMiddleware,getItem)


module.exports = router