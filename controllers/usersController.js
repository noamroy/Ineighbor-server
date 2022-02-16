//~~~~~~~~~INCLUDES~~~~~~~~~~~~
const User = require('../models/user');
const Log = require('./logger');
const jwt = require('jsonwebtoken');
//~~~~~~~EXPORTED FUNCTIONS~~~~~~~~~~
/*
POST REQUEST: loginUser() (body = name and pass params)
POST REQUEST: registerUser() (body = name pass group params)
PUT REQUEST: updateUser() (body = group param)
GET REQUEST: getAllUsers()
*/
exports.usersController = {
    async loginUser(req, res) {
        const body = req.body;
        const userName = body.name;
        const userPassword = body.password;
        Log.logger.info(`LOGIN SYSTEM CONTROLLER REQ: Login Name:${userName}`);
        if (userName && userPassword) {
            const userDataResponse = await User.find({ name: userName })
                .catch(err => {
                    Log.logger.info(`LOGIN SYSTEM CONTROLLER ERROR: Database retriving error ${err}`);
                    res.status(503).json({ "status": 503, "msg": `Database retriving error ${err}` });
                    return;
                });
            if (userDataResponse.length != 0) {
                const userData = userDataResponse[0];
                if (userPassword == userData.password) {
                    jwt.sign({userData}, 'privatekey', { expiresIn: '120m'},(err, token) => {
                        if (err) {Log.logger(err) };
                        Log.logger.info(`Login SYSTEM CONTROLLER RES: Succesfull login: ${userData.name}`);
                        res.status(200).json({ "status": 200, "msg": "Succesfull login", "name": userData.name,"group":userData.group,"id":userData.id,"token":token});        
                    });                    
                } else {
                    Log.logger.info(`Login SYSTEM CONTROLLER ERROR: Failed login attempt: ${userData.id}`);
                    res.status(401).json({ "status": 401, "msg": `Incorrect password` });
                }
            } else {
                Log.logger.info(`Login SYSTEM CONTROLLER ERROR: Failed login attempt`);
                res.status(401).json({ "status": 401, "msg": `Incorrect username` });
            }
        } else {
            Log.logger.info(`Login SYSTEM CONTROLLER ERROR: LOGIN INPUT ERROR`);
            res.status(401).json({ "status": 401, "msg": `INPUT ERROR-Please enter username and password` });
        }
    },
    async registerUser(req, res) {
        Log.logger.info(`REGISTER SYSTEM CONTROLLER REQ: POST add a new user`);
        const body = req.body;
        var userId = 0;
        if (body.name && body.password ){
            const name_duplicate = await User.find({name: body.name})
                .catch(err => {
                    Log.logger.info(`REGISTER SYSTEM CONTROLLER ERROR: Database retriving error`);
                    res.status(503).json({ "status": 503, "msg": `Database retriving error` });
                    return;
                });
            if (name_duplicate.length!=0){
                Log.logger.info(`REGISTER SYSTEM CONTROLLER ERROR: Name already exists`);
                res.status(400).json({ "status": 400, "msg": `Name already exists` });
                return;
            }
            const userDataResponse = await User.find()
                .catch(err => {
                    Log.logger.info(`REGISTER SYSTEM CONTROLLER ERROR: Database retriving error ${err}`);
                    res.status(503).json({ "status": 503, "msg": `Database retriving error ${err}` });
                    return;
                });
            if (userDataResponse.length!=0)
                userId = userDataResponse[(userDataResponse.length)-1].id+1;
            else
                userId=1;
            try {
                const newUser = new User({
                    id: userId,
                    name: body.name,
                    password: body.password,
                    group: body.group
                });
                const result = newUser.save();
                Log.logger.info(`REGISTER SYSTEM CONTROLLER RES: User added id: ${body.id}`);
                res.json(result);
            } catch (err) {
                Log.logger.info(`REGISTER SYSTEM CONTROLLER ERROR: Error creating user ${err}`);
                res.status(503).json({ "status": 503, "msg": `Error creating user ${err}` });
            }
        } else {
            Log.logger.info(`REGISTER SYSTEM CONTROLLER ERROR: no Valid input`);
            res.status(401).json({ "status": 401, "msg": `Please enter valid data` });
        }
    },
    async updateUser(req, res) {
        const header = req.headers['authorization'];
        if(typeof header !== 'undefined') {
            const bearer = header.split(' ');
            const token = bearer[1];
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g,'+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const tokenGroup= (JSON.parse(jsonPayload)).userData.group;
            if (tokenGroup !== 0){
                Log.logger.info('AUTHORIZED ERROR: the authorization fail');
                res.status(403).json({status: 403 , msg: `forbidden`});
                return;
            }
        } else {
            Log.logger.info('AUTHORIZED ERROR: the authorization field is empty');
            res.status(403).json({status: 403 , msg: `forbidden`});
            return;
        }
        const userId = req.path.substring(1);
        Log.logger.info(`Update User CONTROLLER REQ: PUT edit a user id:${userId}`);
        if (isNaN(userId)){
            Log.logger.info(`Update User CONTROLLER RES: input is nan error "${userId}"`);
            res.status(400).json({status: 400 , msg: `Input is nan error "${userId}"`});
        } else {
            const body = req.body;
            var newUser = await User.find({ id: Number(userId)})
                .catch(err => {
                    Log.logger.info(`Update User CONTROLLER ERROR: getting the data from db ${err}`);
                    res.status(500).json({status: 500 , msg: `Server error`});
                });
            if (newUser.length == 0){
                Log.logger.info(`Update User CONTROLLER CONTROLLER RES: Didn't find user number: ${userId}`);
                res.status(404).json({status: 404 , msg: `Didn't find user number: "${userId}"`});
            }
            else {
                newUser = newUser[0];
                /*if (body.name)
                    newUser.name=body.name;*/       //INVALID
                if (body.group!=newUser.group)
                    newUser.group=body.group;
                /*if (body.password)
                    newUser.password=body.password;*/  //INVALID
                User.updateOne({ id: userId }, {
                    //name: newUser.name,               //INVALID
                    //password: newUser.password,       //INVALID
                    group: newUser.group
                })  .catch(err => {
                        Log.logger.info(`Update User CONTROLLER ERROR: ${err}`);
                        res.status(500).json({status: 500 , msg: `Error update an user: ${err}`});
                });
                res.json(newUser);
            }
        }
    },
    async getAllUsers(req, res) {
        Log.logger.info(`User CONTROLLER REQ: Get all users`);
        const answer = await User.find()
            .catch(err => {
                Log.logger.info(`USER CONTROLLER ERROR: getting the data from db ${err}`);
                res.status(500).json({status: 500 , msg: `Server error`});
            });
        for (let index = 0; index < answer.length; index++) {       //CLEAN PASS FIELD
            const element = answer[index];
            answer.password = "PPPPPPPP";            
        }
        if (answer.length!=0){
            Log.logger.info(`PROGRAM CONTROLLER RES: Get all users`);
            res.json(answer);
        }
        else{
            Log.logger.info(`PROGRAM CONTROLLER RES: no users in DB`);
            res.status(404).json({status: 404 , msg: `No users in DB`});
        }
    },
};