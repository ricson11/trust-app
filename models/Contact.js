const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    name:{
        type: String
    },
    sender:{
        type: String,
    },
    detail:{
        type: String
    },
    date: {
        type: Date,
        default: Date.now,
    },
    notifications:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'notifications'
    }],
})




module.exports = Contact = mongoose.model('contacts', ContactSchema);