const express = require('express');
const router = express.Router();
const jwtAuthMiddleware = require('../middlewares/jwtauth.middleware');

const {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getProfile,
    changePassword,
    updateProfile,
    goOnline,
    goOffile
    
} = require('../controllers/driver.controller');

router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/logout',jwtAuthMiddleware, logoutUser);
router.post('/refresh-access-token', refreshAccessToken);
router.get('/get-profile', jwtAuthMiddleware, getProfile);
router.post('/change-password', jwtAuthMiddleware, changePassword);
router.patch('/update-profile', jwtAuthMiddleware, updateProfile);

router.patch('/go-online',jwtAuthMiddleware,goOnline);
router.patch('/go-offline',jwtAuthMiddleware,goOffile);

module.exports = router