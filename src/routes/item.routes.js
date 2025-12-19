const express = require('express');
const router = express.Router();
const jwtAuthMiddleware = require('../middlewares/jwtauth.middleware');
const upload = require('../middlewares/multer.middleware');

const {
    addItem,
    getItem,
    getAllItems,
    editItem,
    removeItem,
    searchItembyName,
    uploadItemImage
} = require('../controllers/item.controller')

router.post('/add-item',jwtAuthMiddleware,addItem)
router.get('/get-item',jwtAuthMiddleware,getItem)
router.get('/get-all-items',jwtAuthMiddleware,getAllItems)
router.patch('/edit-item',jwtAuthMiddleware,editItem)
router.delete('/remove-item/:_id',jwtAuthMiddleware,removeItem)
router.get('/search-item/:itemNameForSearch',searchItembyName)

router.put('/add-item-image/:itemId',jwtAuthMiddleware,upload.array("images", 5),uploadItemImage)

module.exports = router