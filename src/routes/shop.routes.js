const express = require('express');
const router = express.Router();
const jwtAuthMiddleware = require('../middlewares/jwtauth.middleware')

const {
    searchShopbyName,
    getAllShopReviews
} = require('../controllers/shop.controller')

router.get('/search-shop/:shopNameForSearching',searchShopbyName)
router.get('/get-shop-reviews',jwtAuthMiddleware,getAllShopReviews)

module.exports = router