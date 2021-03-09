const moment = require('moment');
const comment = require('../models/Comment');
const user = require('../models/User');
const story = require('../models/Story');
module.exports={
             
    formatDate: function (date, format){
      return moment(date).format(format)
    },
    

}