//~~~~~~~~~INCLUDES~~~~~~~~~~~~
const NeighborhoodSystem = require('../models/neighborhoodSystem');
const Log = require('./logger');
//~~~~~~~EXPORTED FUNCTIONS~~~~~~~~~~
/*
GET REQUEST: getAllNeighborhoodSystems()
GET REQUEST: getSpecificNeighborhoodSystem(path = '/id')
POST REQUEST: createNeighborhoodSystem(body = all params except for id)
PATCH REQUEST: updateNeighborhoodSystem(path = '/id', body = all new params)
DELETE REQUEST: deleteNeighborhoodSystem(path = '/id')
*/
exports.neighborhoodSystemController = {
    async getAllNeighborhoodSystems(req, res) {
        Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER REQ: Get all neighborhood systems`);
        const answer = await NeighborhoodSystem.find()
            .catch(err => {
                Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER ERROR: getting the data from db ${err}`);
                res.status(500).json({status: 500 , msg: `Server error`});
            });
        if (answer.length!=0){
            Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER RES: Get all neighborhood systems`);
            res.json(answer);
        }
        else{
            Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER RES: no neighborhood systems in DB`);
            res.status(404).json({status: 404 , msg: `No Neighborhood systems in DB`});
        }
    },
    async getSpecificNeighborhoodSystem(req, res) {
        const NeighborhoodSystemId = req.path.substring(1)
        Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER REQ: Get specific neighborhood system number ${NeighborhoodSystemId}`);
        if (isNaN(NeighborhoodSystemId)){
            Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER RES: input is nan error "${NeighborhoodSystemId}"`);
            res.status(400).json({status: 400 , msg: `Input is nan error "${NeighborhoodSystemId}"`});
        }
        else{
            var neighborhoodSystemData = await NeighborhoodSystem.find({ id: Number(NeighborhoodSystemId)})
                .catch(err => {
                    Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER ERROR: getting the data from db ${err}`);
                    res.status(500).json({status: 500 , msg: `Server error`});
                });
            if (neighborhoodSystemData.length!=0){
                neighborhoodSystemData = neighborhoodSystemData[0];
                Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER RES: get neighborhood system data number: ${NeighborhoodSystemId}`);
                res.json(neighborhoodSystemData);
            }
            else{
                Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER RES: Didn't find neighborhood system number: ${NeighborhoodSystemId}`);
                res.status(404).json({status: 404 , msg: `Didn't find neighborhood system number: ${NeighborhoodSystemId}`});
            }
        }
    },
    async createNeighborhoodSystem(req, res) {
        Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER REQ: POST add an neighborhood system`);
        const body = req.body;
        const ip_duplicate = await NeighborhoodSystem.find({ip: body.ip})
            .catch(err => {
                Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER ERROR: Database retriving error ${err}`);
                res.status(503).json({ "status": 503, "msg": `Database retriving error ${err}` });
                return;
            });
        if (ip_duplicate.length!=0){
            Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER ERROR: IP already exists`);
            res.status(400).json({ "status": 400, "msg": `IP already exists` });
            return;
        }
        let NeighborhoodSystemId = await NeighborhoodSystem.find()
            .catch(err => {
                Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER ERROR: getting the data from db ${err}`);
                res.status(500).json({status: 500 , msg: `Server error`});
        });
        if (NeighborhoodSystemId.length!=0)
            NeighborhoodSystemId = NeighborhoodSystemId[(NeighborhoodSystemId.length)-1].id+1;
        else
            NeighborhoodSystemId=1;
        if (body.type && body.name && body.address &&
            body.ip && body.mode && body.program && body.group){
                const newNeighborhoodSystem = new NeighborhoodSystem({
                    "type": body.type,
                    "name": body.name,
                    "address": body.address,
                    "ip": body.ip,
                    "mode": body.mode,
                    "program": body.program,
                    "group": body.group,
                    "id": NeighborhoodSystemId
                });
                const result = newNeighborhoodSystem.save();
                if (result) {
                    Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER RES: add neighborhood system number ${NeighborhoodSystemId}`);
                    res.json(newNeighborhoodSystem);
                } else {
                    Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER ERROR: getting the data from db ${err}`);
                    res.status(500).json({status: 500 , msg: `Server error`});
                }
        } else {
            Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER RES: Input error!`);
            res.status(400).json({status: 400 , msg: `Input error!`});
        }
    },
    async updateNeighborhoodSystem(req, res) {
        const NeighborhoodSystemId = req.path.substring(1);
        Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER REQ: update an neighborhood system number: ${NeighborhoodSystemId}`);
        if (isNaN(NeighborhoodSystemId)){
            Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER RES: input is nan error "${NeighborhoodSystemId}"`);
            res.status(400).json({status: 400 , msg: `Input is nan error "${NeighborhoodSystemId}"`});
        }
        else {
            let body = req.body;
            let newNeighborhoodSystem = await NeighborhoodSystem.find({ id: Number(NeighborhoodSystemId)})
                .catch(err => {
                    Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER ERROR: getting the data from db ${err}`);
                    res.status(500).json({status: 500 , msg: `Server error`});
                });
            if (newNeighborhoodSystem.length == 0){
                Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER RES: Didn't find neighborhood system number: ${NeighborhoodSystemId}`);
                res.status(404).json({status: 404 , msg: `Didn't find neighborhood system number: "${NeighborhoodSystemId}"`});
            }
            else {
                newNeighborhoodSystem = newNeighborhoodSystem[0];
                if (body.type)
                    newNeighborhoodSystem.type=body.type;
                if (body.name)
                newNeighborhoodSystem.name=body.name;
                if (body.address)
                newNeighborhoodSystem.address=body.address;
                if (body.ip){
                    if (body.ip != newNeighborhoodSystem.ip){
                        const ip_duplicate = await NeighborhoodSystem.find({ip: body.ip})
                            .catch(err => {
                                Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER ERROR: Database retriving error`);
                                res.status(503).json({ "status": 503, "msg": `Database retriving error` });
                                return;
                            });
                        if (ip_duplicate.length!=0){
                            Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER ERROR: IP already exists`);
                            res.status(400).json({ "status": 400, "msg": `IP already exists` });
                            return;
                        }
                    }
                    newNeighborhoodSystem.ip=body.ip;
                }
                if (body.mode)
                    newNeighborhoodSystem.mode=body.mode;
                if (body.program)
                    newNeighborhoodSystem.program=body.program;
                if (body.group)
                    newNeighborhoodSystem.group=body.group;
                NeighborhoodSystem.updateOne({ id: NeighborhoodSystemId }, {
                type: newNeighborhoodSystem.type,
                name: newNeighborhoodSystem.name,
                address: newNeighborhoodSystem.address,
                ip: newNeighborhoodSystem.ip,
                mode: newNeighborhoodSystem.mode,
                program: newNeighborhoodSystem.program,
                group: newNeighborhoodSystem.group})
                    .catch(err => {
                        Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER ERROR: update neighborhood system ${err}`);
                        res.status(500).json({status: 500 , msg: `Error update a neighborhood system`});
                    });
                res.json(body)
            }
        }
    },
    async deleteNeighborhoodSystem(req, res) {
        const NeighborhoodSystemId = req.path.substring(1)
        Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER REQ: Get specific neighborhood system number ${NeighborhoodSystemId}`);
        if (isNaN(NeighborhoodSystemId)){
            Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER RES: input is nan error "${NeighborhoodSystemId}"`);
            res.status(400).json({status: 400 , msg: `Input is nan error "${NeighborhoodSystemId}"`});
        }
        else{
            Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER RES: delete neighborhood system number: ${NeighborhoodSystemId}`);
            NeighborhoodSystem.deleteOne ({ id: Number(NeighborhoodSystemId)})
                .then(docs => { res.json(docs)})
                .catch(err => {
                    Log.logger.info(`NEIGHBORHOOD SYSTEM CONTROLLER ERROR: deleting neighborhood system from db: ${err}`);
                    res.status(500).json({status: 500 , msg: `Server delete error`});
                });
        }
    }
};