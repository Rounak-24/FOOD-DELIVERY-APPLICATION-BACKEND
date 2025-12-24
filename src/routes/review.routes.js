const express = require('express');
const router = express.Router();
const jwtAuthMiddleware = require('../middlewares/jwtauth.middleware');
const upload = require('../middlewares/multer.middleware')

const {
    postReview,
    getReviews,
    editReview,
    deleteReview
} = require('../controllers/review.controller')

router.post('/post-review',jwtAuthMiddleware,upload.array("reviewImgArr",5),postReview)
router.get('/get-reviews',jwtAuthMiddleware,getReviews)
router.patch('/edit-review',jwtAuthMiddleware,editReview)
router.delete('/delete-review/:reviewId',jwtAuthMiddleware,deleteReview)

module.exports = router