const express = require('express');
const router = express.Router();
const jwtAuthMiddleware = require('../middlewares/jwtauth.middleware');

const {
    placeOrder,
    getAllOrders,
    getAllShopOrders
} = require('../controllers/order.controller')

router.post('/place-order',jwtAuthMiddleware,placeOrder)
router.get('/get-orders',jwtAuthMiddleware,getAllOrders)
router.get('/get-shop-orders',jwtAuthMiddleware,getAllShopOrders)

module.exports = router