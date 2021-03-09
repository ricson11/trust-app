const mongoose = require('mongoose');
const story = require('../models/Story');
const comment = require('../models/Comment')


const Schema = mongoose.Schema;
const UserSchema = new Schema({
     username:{
         type: String,
     },
     email:{
         type: String
     },
     gender:{
         type: String
     },
     password:{
         type: String
     },
     isAdmin:{
         type: Boolean,
          default: false
     },
     superAdmin:{
         type: Boolean,
          default: false
     },
     date:{
         type: Date,
         default: Date.now
     },
     story:{
       
        type: mongoose.Schema.Types.ObjectId,
        ref: 'stories'
        },
      resetPasswordToken:String,
      resetPasswordExpires: Date,

});


UserSchema.pre('remove', function(next){
    let id = this._id
    story.deleteMany({user: id}, function(err, result){
        if(err){
            next(err)
        }
        else{
            next();
        }
    })
    comment.deleteMany({user: id}, function(err, result){
        if(err){
            next(err)
        }
        else{
            next();
        }
    })
     
});

module.exports = User = mongoose.model('users', UserSchema);
