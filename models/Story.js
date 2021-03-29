const mongoose = require('mongoose');
//const slugify = require('slugify');
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
    notifications:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'notifications'
    }],
   /* slug:{
        type: String,
        required: true,
        unique: true
    }, */
    
})


 /*StorySchema.pre('validate', function(){
    if(this.title){
        this.slug = slugify(this.title, {lower: true, strict: true})
    }
}) */

module.exports = Story = mongoose.model('stories', StorySchema);