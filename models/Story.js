const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StorySchema = new Schema({
     
     title:{
         type: String,
     },
     image:[{
         type:String
     }],
     cloudinary_id:{
         type: String
     },
     details:{
         type:String,
     },
     allowComment:{
           type:Boolean,
           default: true
     },
     date:{
         type:Date,
         default:Date.now,
     },
     comments:[{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'comments'
     }],
     user:{
       
         type: mongoose.Schema.Types.ObjectId,
         ref: 'users'
         },
        
    
     views:{
         type:Number,
         default:0,
     },
    
     like:{
         type: Number,
         default: 0
     },
     dislike:{
        type: Number,
        default: 0
    },
})


module.exports = Story = mongoose.model('stories', StorySchema);