const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const cors = require('cors');
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header("Access-Control-Allow-Methods", "*");
    res.set('Content-Type', 'application/json');
    next();
});
app.use(cors())
const { usersRouter } = require("./routers/usersRouter");   //login/register
app.use('/api/user', usersRouter);
app.use((req, res, next) => {   //check the token
    const header = req.headers['authorization'];
    if(typeof header !== 'undefined') {
        const bearer = header.split(' ');
        const token = bearer[1];
        req.token = token;
        jwt.verify(req.token, 'privatekey', (err) => {
            if (err){
                console.log(`AUTHORIZED ERROR: could not connect to the protected route ${err}`);
                res.status(403).json({status: 403 , msg: `authorized error ${err}`});
            }
            else {
                console.log('AUTHORIZED SUCCESS');
                next();
            }
        })
    } else {
        console.log('AUTHORIZED ERROR: the authorization field is empty');
        res.status(403).json({status: 403 , msg: `forbidden`});
    }
});
const { neighborhoodsystemRouter } = require("./routers/neighborhoodsystemRouter");
app.use('/api/neighborhoodsystem', neighborhoodsystemRouter);
const { programRouter } = require("./routers/programRouter");
app.use('/api/program', programRouter);
app.unsubscribe((req, res) => {
    res.status(400).send('Something is wrong!');
});

app.listen(port, () => console.log(`Express server is running on port ${port}`));