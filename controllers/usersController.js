//~~~~~~~~~INCLUDES~~~~~~~~~~~~
const User = require('../models/user');
const Log = require('./logger');
const jwt = require('jsonwebtoken');
//~~~~~~~EXPORTED FUNCTIONS~~~~~~~~~~
/*
POST REQUEST: loginUser() (body = name and pass params)
POST REQUEST: registerUser() (body = name pass group params)
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
                        res.status(200).json({ "status": 200, "msg": `Succesfull login: ${userData.name}`,"group":`${userData.group}`,"id":`${userData.id}`,"token":token});        
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
        if (body.name && body.password && (Number.isInteger(body.group))){
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

    }
};