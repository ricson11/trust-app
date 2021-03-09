const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BannerSchema = new Schema({
    ad:[{
     
        type: String
     }],
  
    
    url:{
        type: String
    },
    views:{
        type: Number,
    },
    date:{
        type: Date,
        default: Date.now,
    },
})

module.exports = Banner = mongoose.model('banners', BannerSchema);
