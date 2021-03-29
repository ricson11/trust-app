const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    contactId:{
        type: String
    },
    name:{
        type: String,
    },
    isRead:{
        type: Boolean,
        default: false
    },
    date:{
        type: Date,
        default: Date.now
    },
})

module.exports = Notification = mongoose.model('notifications', NotificationSchema);