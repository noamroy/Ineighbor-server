const winston_lib = require('winston');
const logger = winston_lib.createLogger({
    level: 'debug',
    format: winston_lib.format.simple(),
    transports: [
        new winston_lib.transports.File({ filename: 'logs.txt' }),
        new winston_lib.transports.Console()
    ]
});
module.exports = {
    logger
};