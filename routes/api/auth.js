const express = require('express');
const { isValidUserId, authenticate, upload } = require("../../middlewares");


const ctrl = require('../../controler/auth')
const router = express.Router();

router.post('/register', ctrl.register)

router.post('/login', ctrl.login)

router.get('/current', authenticate, ctrl.getCurrent)

router.post('/logout', authenticate, ctrl.logOut)

router.patch('/:id/subscription', authenticate, isValidUserId, ctrl.updateSubscriptionUser);

router.patch('/avatars', authenticate, upload.single('avatar'), ctrl.updateAvatar)

module.exports = router;
