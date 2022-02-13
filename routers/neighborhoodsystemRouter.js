const { Router } = require('express');
const { neighborhoodSystemController } = require('../controllers/neighborhoodSystemController');
const neighborhoodsystemRouter = new Router();
module.exports = { neighborhoodsystemRouter };

neighborhoodsystemRouter.get('/', neighborhoodSystemController.getAllNeighborhoodSystems); // {host}/api/neighborhoodsystem
neighborhoodsystemRouter.get('/:id', neighborhoodSystemController.getSpecificNeighborhoodSystem); // {host}/api/neighborhoodsystem/:id
neighborhoodsystemRouter.post('/', neighborhoodSystemController.createNeighborhoodSystem); // {host}/api/neighborhoodsystem
neighborhoodsystemRouter.put('/:id', neighborhoodSystemController.updateNeighborhoodSystem); // {host}/api/neighborhoodsystem/:id
neighborhoodsystemRouter.delete('/:id', neighborhoodSystemController.deleteNeighborhoodSystem); // {host}/api/neighborhoodsystem/:id