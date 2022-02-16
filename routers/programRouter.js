const { Router } = require('express');
const { programController } = require('../controllers/programController');
const programRouter = new Router();
module.exports = { programRouter };
programRouter.get('/', programController.getAllPrograms); // {host}/api/program
programRouter.get('/:id', programController.getSpecificProgram); // {host}/api/program/:id
programRouter.post('/', programController.createProgram); // {host}/api/program
programRouter.put('/:id', programController.updateProgram); // {host}/api/program/:id
programRouter.put('/', programController.updateStatus); // {host}/api/program
programRouter.delete('/:id', programController.deleteProgram); // {host}/api/program/:id
programRouter.get('/sun', programController.getSun); // {host}/api/program/sun
