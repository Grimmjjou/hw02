const express = require('express');
const { isValidUserId, authenticate } = require("../../middlewares");


const ctrl = require('../../controler/auth')
const router = express.Router();

router.post('/register', ctrl.register)

router.post('/login', ctrl.login)

router.get('/current', authenticate, ctrl.getCurrent)

router.post('/logout', authenticate, ctrl.logOut)

router.patch('/:id/subscription', authenticate, isValidUserId, ctrl.updateSubscriptionUser);

module.exports = router;
