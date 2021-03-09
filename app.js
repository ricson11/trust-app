const express = require('express');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const bodyparser = require('body-parser');
const mongoose =  require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const {allowInsecurePrototypeAccess}=require('@handlebars/allow-prototype-access');
const path = require('path');
const env = require('dotenv');
//const axios = require('axios');
//var AdminBro = require('admin-bro');
//const AdminBroExpress = require('@admin-bro/express');
//const AdminBroMongoose = require('admin-bro-mongoose');
require('./config/passport')(passport);

const Story = require('./models/Story');
const User = require('./models/User');
const Comment = require('./models/Comment');
const banner = require('./models/Comment');

env.config({path: './.env'});


const app = express();



mongoose.promise = global.promise;
//development
/*mongoose.connect('mongodb://localhost/trust', {
     useNewUrlParser:true, useUnifiedTopology:true,useCreateIndex: true,
})
.then(()=>console.log('mongodb is connected'))
.catch(err=>console.log(err)); */

//production
mongoose.connect('mongodb+srv://wonder:wonder5555@cluster0.t7kmz.mongodb.net/trust?retryWrites=true&w=majority',


{
    useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true
})
.then(()=>console.log('mongodb is connected'))
.catch(err=>console.log(err));
 
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json());

 const { formatDate} = require('./helpers/hps');
app.engine('handlebars', exphbs({
    helpers:{
            formatDate: formatDate 
    },
    handlebars:allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: 'main'
}))
app.set('view engine', 'handlebars');

app.use(methodOverride('_method'));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized:true,
    store: new MongoStore({mongooseConnection: mongoose.connection})
     
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null;
    next();
});


      
app.use('/', require('./routes/user'));
app.use('/', require('./routes/story'));
app.use('/story/:id', require('./routes/comment'));
app.use('/banner', require('./routes/banner'));
app.use('/admin', require('./routes/admin'));
app.use('/css', express.static(__dirname +'/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/dist', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/dist', express.static(__dirname + '/node_modules/popper.js/dist'));
app.use('/fa', express.static(__dirname + '/node_modules/font-awesome/css'));
app.use('/fonts', express.static(__dirname + '/node_modules/font-awesome/fonts'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/dist', express.static(__dirname + '/node_modules/summernote/dist'));
app.use('/ckeditor4', express.static(__dirname + '/node_modules/ckeditor4'));
app.use('/dist', express.static(__dirname + '/node_modules/axios/dist'));

app.set('port', process.env.PORT || 500);
app.listen(app.get('port'),()=>console.log('server is running on port' + " "+ app.get('port')));

