const { Schema, model } = require('mongoose');
const programSchema = new Schema({
    id: {type : Number, required: true },
    name: {type : String, required: true },
    startSource: {type : String, required: true },
    startDelay: {type : Number, required: true},
    finishSource: {type : String, required: true },
    finishDelay: {type : Number, required: true},
    currentStatus: {type : Boolean, required: true}
}, { collection: 'programs' });
const Program = model('program', programSchema);
module.exports = Program;