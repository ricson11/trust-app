const mongoose = require('mongoose');



const Schema = mongoose.Schema;
   
const CommentSchema = new Schema({
     commentBody:{
         type: String,
     },
     commentImage:{
         type:String
     },
     cloudinary_id:{
         type: String,
     },
     commentDate:{
         type:Date,
         default:Date.now,
     },
     story:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'stories'
    },
    commentUser:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
     },
     like:{
         type: Number,
         default: 0,
     },
     
    
})

module.exports = Comment = mongoose.model('comments', CommentSchema);