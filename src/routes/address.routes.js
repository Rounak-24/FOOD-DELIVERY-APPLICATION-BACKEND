const express = require('express');
const router = express.Router();
const jwtAuthMiddleware = require('../middlewares/jwtauth.middleware');

const {
    addAddress,
    updateAddress,
    getAddress,
    removeAddress
} = require('../controllers/address.controller')

router.put('/add-address',jwtAuthMiddleware,addAddress);
router.patch('/update-address/:_id',jwtAuthMiddleware,updateAddress);
router.get('/:role/get-address',jwtAuthMiddleware,getAddress);
router.delete('/:role/remove-address/:_id',jwtAuthMiddleware,removeAddress);

module.exports = router