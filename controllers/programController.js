//~~~~~~~~~INCLUDES~~~~~~~~~~~~
const Program = require('../models/programs');
const Log = require('./logger');
const axios = require('axios');
//~~~~~~~INNER FUNCTIONS~~~~~~~~~~~~~
async function sunApi(_lat, _lng, _date, _timezone=0){
    Log.logger.info(`SUN API REQ: lat ${_lat} long ${_lng} date ${_date} timezone ${_timezone}`);
    const response = await axios.get('https://api.sunrise-sunset.org/json', { 
        params: {
            lat: _lat,
            lng: _lng,
            date: _date,
            formatted: 0 }
    });
    const responseData = response.data;
    Log.logger.info(`API RES: GET ANSWER ${JSON.stringify(responseData)}`);
    var localTimeRise = new Date(responseData.results.sunrise);
    localTimeRise = new Date(localTimeRise.setHours((localTimeRise.getHours())+_timezone));
    var localTimeSet = new Date(responseData.results.sunset);
    localTimeSet = new Date(localTimeSet.setHours((localTimeSet.getHours())+_timezone));
    var sunData = { status: responseData.status,
                    sunrise: localTimeRise,
                    sunset: localTimeSet};
                    Log.logger.info(`API SUNRISE RES: status-${sunData.status} sunrise-${sunData.sunrise} sunset-${sunData.sunset}`);
    return sunData;
}
//~~~~~~~EXPORTED FUNCTIONS~~~~~~~~~~
/*
GET REQUEST: getAllPrograms()
GET REQUEST: getSpecificProgram(path = '/id')
POST REQUEST: createProgram(body = all params except for id)
PUT REQUEST: updateStatus()
PUT REQUEST: updateProgram(path = '/id', body = all new params)
DELETE REQUEST: deleteProgram(path = '/id')
GET REQUEST: getSun(_lat, _lng, _date) (path= '/sun')
*/
exports.programController = {
    async getAllPrograms(req, res) {
        Log.logger.info(`PROGRAM CONTROLLER REQ: Get all programs`);
        const answer = await Program.find()
            .catch(err => {
                Log.logger.info(`PROGRAM CONTROLLER ERROR: getting the data from db ${err}`);
                res.status(500).json({status: 500 , msg: `Server error`});
            });
        if (answer.length!=0){
            Log.logger.info(`PROGRAM CONTROLLER RES: Get all programs`);
            res.json(answer);
        }
        else{
            Log.logger.info(`PROGRAM CONTROLLER RES: no programs in DB`);
            res.status(404).json({status: 404 , msg: `No programs in DB`});
        }
    },
    async getSpecificProgram(req, res, next) {
        const ProgramId = req.path.substring(1);
        if (ProgramId == "sun"){
            next();
            return;
        }
        Log.logger.info(`PROGRAM CONTROLLER REQ: Get specific program number ${ProgramId}`);
        if (isNaN(ProgramId)){
            Log.logger.info(`PROGRAM CONTROLLER RES: input is nan error "${ProgramId}"`);
            res.status(401).json({status: 400 , msg: `Input is nan error "${ProgramId}"`});
        }
        else{
            var ProgramData = await Program.find({ id: Number(ProgramId)})
                .catch(err => {
                    Log.logger.info(`PROGRAM CONTROLLER ERROR: getting the data from db ${err}`);
                    res.status(500).json({status: 500 , msg: `Server error`});
                });
            if (ProgramData.length!=0){
                ProgramData = ProgramData[0];
                Log.logger.info(`PROGRAM CONTROLLER RES: get program number: ${ProgramId}`);
                res.json(ProgramData);
            }
            else{
                Log.logger.info(`PROGRAM CONTROLLER RES: Didn't find program number: ${ProgramId}`);
                res.status(404).json({status: 404 , msg: `Didn't find program number: ${ProgramId}`});
            }
        }
    },
    async createProgram(req, res) {
        Log.logger.info(`PROGRAM CONTROLLER REQ: POST add an program`);
        const body = req.body;
        var ProgramId = await Program.find()
            .catch(err => {
                Log.logger.info(`PROGRAM CONTROLLER ERROR: getting the data from db ${err}`);
                res.status(500).json({status: 500 , msg: `Server error`});
        });
        if (ProgramId.length!=0)
            ProgramId = ProgramId[(ProgramId.length)-1].id+1;
        else
            ProgramId=1;
        if (body.name && body.startSource &&
            body.startDelay && body.finishSource && body.finishDelay){
                const newProgram = new Program({
                    "name": body.name,
                    "startSource": body.startSource,
                    "startDelay": body.startDelay,
                    "finishSource": body.finishSource,
                    "finishDelay": body.finishDelay,
                    "id": ProgramId,
                    "currentStatus": false
                });
                const result = newProgram.save();
                if (result) {
                    Log.logger.info(`PROGRAM CONTROLLER RES: add program number ${ProgramId}`);
                    res.json(newProgram);
                } else {
                    Log.logger.info(`PROGRAM CONTROLLER ERROR: getting the data from db ${err}`);
                    res.status(500).json({status: 500 , msg: `Server error`});
                }
        } else {
            Log.logger.info(`PROGRAM CONTROLLER RES: Input error!`);
            res.status(400).json({status: 400 , msg: `Input error!`});
        }
    },
    async updateProgram(req, res) {
        const ProgramId = req.path.substring(1);
        Log.logger.info(`PROGRAM CONTROLLER REQ: update an program number: ${ProgramId}`);
        if (isNaN(ProgramId)){
            Log.logger.info(`PROGRAM CONTROLLER RES: input is nan error "${ProgramId}"`);
            res.status(400).json({status: 400 , msg: `Input is nan error "${ProgramId}"`});
        }
        else {
            var body = req.body;
            var newProgram = await Program.find({ id: Number(ProgramId)})
                .catch(err => {
                    Log.logger.info(`PROGRAM CONTROLLER ERROR: getting the data from db ${err}`);
                    res.status(500).json({status: 500 , msg: `Server error`});
                });
            if (newProgram.length == 0){
                Log.logger.info(`PROGRAM CONTROLLER RES: Didn't find program number: ${ProgramId}`);
                res.status(404).json({status: 404 , msg: `Didn't find program number: "${ProgramId}"`});
            }
            else {
                newProgram = newProgram[0];
                if (body.name)
                    newProgram.name=body.name;
                if (body.startSource)
                    newProgram.startSource=body.startSource;
                if (body.startDelay)
                    newProgram.startDelay=body.startDelay;
                if (body.finishSource)
                    newProgram.finishSource=body.finishSource;
                if (body.finishDelay)
                    newProgram.finishDelay=body.finishDelay;
                Program.updateOne({ id: ProgramId }, {
                    name: newProgram.name,
                    startSource: newProgram.startSource,
                    startDelay: newProgram.startDelay,
                    finishSource: newProgram.finishSource,
                    finishDelay: newProgram.finishDelay
                })
                    .catch(err => {
                        Log.logger.info(`PROGRAM CONTROLLER ERROR: update program ${err}`);
                        res.status(500).json({status: 500 , msg: `Error update a program`});
                    });
                res.json(body)
            }
        }
    },
    async deleteProgram(req, res) {
        const ProgramId = req.path.substring(1)
        Log.logger.info(`PROGRAM CONTROLLER REQ: Get specific program number ${ProgramId}`);
        if (isNaN(ProgramId)){
            Log.logger.info(`PROGRAM CONTROLLER RES: input is nan error "${ProgramId}"`);
            res.status(400).json({status: 400 , msg: `Input is nan error "${ProgramId}"`});
        }
        else{
            Log.logger.info(`PROGRAM CONTROLLER RES: delete program number: ${ProgramId}`);
            Program.deleteOne ({ id: Number(ProgramId)})
                .then(docs => { res.json(docs)})
                .catch(err => {
                    Log.logger.info(`PROGRAM CONTROLLER ERROR: deleting program from db: ${err}`);
                    res.status(500).json({status: 500 , msg: `Server delete error`});
                });
        }
    },
    async updateStatus(req, res) {
        Log.logger.info(`PROGRAM CONTROLLER REQ: UPDATE programs`);
        const answer = await Program.find()
            .catch(err => {
                Log.logger.info(`PROGRAM CONTROLLER ERROR: getting the data from db ${err}`);
                res.status(500).json({status: 500 , msg: `Server error`});
            });
        if (answer.length!=0){
            const currentTimeAnswer = await axios.get('http://worldtimeapi.org/api/timezone/Asia/Jerusalem', {
            });
            console.log (currentTimeAnswer.data.utc_datetime);
            const currentTimeAnswerDate= new Date(currentTimeAnswer.data.utc_datetime);
            const currentTime = currentTimeAnswerDate.getHours()*60+currentTimeAnswerDate.getMinutes();
            const _lat=32.11;
            const _lng=34.86;
            const _date="today";
            const sunData = await sunApi(_lat, _lng, _date);
            const sunRise = new Date(sunData.sunrise).getHours()*60+new Date(sunData.sunrise).getMinutes();
            const sunSet = new Date(sunData.sunset).getHours()*60+new Date(sunData.sunset).getMinutes();
            console.log (`current time is: ${currentTime}`);
            console.log (`sunrise is: ${sunRise}`);
            console.log (`sunset is: ${sunSet}`);
            for (let index = 0; index < answer.length; index++) {
                var startTime = 0;
                var finishTime = 0;
                const element = answer[index];
                if (element.startSource=="sunrise"){
                    startTime = sunRise;
                }
                else if (element.startSource=="sunset"){
                    startTime = sunSet;
                }
                startTime = (startTime+element.startDelay)%(24*60);
                console.log(`program number ${element.id} start time: ${startTime}`);
                if (element.finishSource=="sunrise"){
                    finishTime = sunRise;
                }
                else if (element.finishSource=="sunset"){
                    finishTime = sunSet;
                }
                finishTime = (finishTime+element.finishDelay)%(24*60);
                console.log(`program number ${element.id} finish time: ${finishTime}`);
                if (finishTime>startTime){
                    if (currentTime>startTime && currentTime<finishTime){
                        console.log(`program number ${element.id} turn on1`);
                        Program.updateOne({ id: element.id }, {
                            currentStatus: true
                        }) .catch(err => {
                            Log.logger.info(`PROGRAM CONTROLLER ERROR: update program ${err}`);
                            res.status(500).json({status: 500 , msg: `Error update a program`});
                            return;
                        });  
                    } else {
                        console.log(`program number ${element.id} turn off1`);
                        Program.updateOne({ id: element.id }, {
                            currentStatus: false
                        }) .catch(err => {
                            Log.logger.info(`PROGRAM CONTROLLER ERROR: update program ${err}`);
                            res.status(500).json({status: 500 , msg: `Error update a program`});
                            return;
                        });  
                    }
                } else {
                    if (currentTime<startTime && currentTime>finishTime){
                        console.log(`program number ${element.id} turn off2`);
                        Program.updateOne({ id: element.id }, {
                            currentStatus: false
                        }) .catch(err => {
                            Log.logger.info(`PROGRAM CONTROLLER ERROR: update program ${err}`);
                            res.status(500).json({status: 500 , msg: `Error update a program`});
                            return;
                        });  
                    } else {
                        console.log(`program number ${element.id} turn on2`);
                        Program.updateOne({ id: element.id }, {
                            currentStatus: true
                        }) .catch(err => {
                            Log.logger.info(`PROGRAM CONTROLLER ERROR: update program ${err}`);
                            res.status(500).json({status: 500 , msg: `Error update a program`});
                            return;
                        });  
                    }
                }
                
            }
            Log.logger.info(`PROGRAM CONTROLLER RES: UPDATE all programs`);
            res.status(200).json({status: 200 , msg: `UPDATE STATUS SUCCESS`});
        }
        else{
            Log.logger.info(`PROGRAM CONTROLLER RES: no programs in DB`);
            res.status(404).json({status: 404 , msg: `No programs in DB`});
        }
    },
    async getSun(req, res) {
        var _lat=32.11;
        if (req.body._lat)
            _lat=req.body._lat;
        var _lng=34.86;
        if (req.body._lng)
            _lng=req.body._lng;
        var _date="today";
        if (req.body._date)
            _date=req.body._date;
        var _timezone=0;
        if (req.body._timezone)
            _timezone=req.body._timezone;
        const sunData = await sunApi(_lat, _lng, _date, _timezone);
        res.status(200).json(sunData);
    }
};
