const { Router } = require('express');
const { usersController } = require('../controllers/usersController');
const usersRouter = new Router();
module.exports = { usersRouter };

usersRouter.post('/login', usersController.loginUser);          // {host}/login
usersRouter.post('/register', usersController.registerUser);    // {host}/register
usersRouter.put('/:id',usersController.updateUser);             // {host}/:id
usersRouter.get('/',usersController.getAllUsers);               // {host}/
