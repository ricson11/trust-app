const express = require ('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport');
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');
const env = require('dotenv');
require('../models/Story');
require('../models/Comment');
require('../models/User');
const {ensureAuthenticated} = require('../helpers/auth');
env.config({path: '../.env'});


router.get('/register', (req, res)=>{
    res.render('users/register')
})

router.get('/login', (req, res)=>{
    res.render('users/login')
})
router.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success_msg', 'You logged out');
    res.redirect('/')
})

router.post('/login', (req, res, next)=>{
     passport.authenticate('local', {
         successRedirect: '/',
         failureRedirect: '/login',
         failureFlash: true,
     })(req, res, next)
})

router.post('/register', (req, res)=>{
       let errors = [];

       if(req.body.password!==req.body.password2){
           errors.push({text: 'Password do not match'})
       }
       if(req.body.password.length < 4){
           errors.push({text: ' Password must be atleast 4 characters'})
       }else{
           if(errors.length > 0){
               res.render('users/register', {
                   errors: errors,
                   username: req.body.username,
                   password: req.body.password,
                   password2: req.body.password2,
                   gender: req.body.gender,
                   email: req.body.email,
               })
           }else{
               User.findOne({email: req.body.email})
               .then(user=>{
                   if(user){
                       req.flash('error_msg', 'The Email already exist')
                       res.redirect('back')
                   }else{
                       User.findOne({username: req.body.username})
                       .then(user=>{
                           if(user){
                            req.flash('error_msg', 'The username  already exist')
                            res.redirect('back')
                        }else{
                      
                       const newUser={
                           username: req.body.username,
                           email: req.body.email,
                           password: req.body.password,
                           gender: req.body.gender,
                       }
                        if(req.body.admin === process.env.isAdmin){
                            newUser.isAdmin=true;
                        }
                        if(req.body.username === process.env.superAdmin){
                            newUser.superAdmin=true;
                        }
                         bcrypt.genSalt(10, (err, salt)=>{
                             bcrypt.hash(newUser.password, salt, (err, hash)=>{
                                 if(err) throw err;
                                 newUser.password=hash;
                                 new User (newUser)
                                 .save()
                                 .then(user=>{
                                     console.log(newUser)
                                     req.flash('success_msg', 'Successfully signed up')
                                     res.redirect('/login')
                                 })
                                 .catch(err=>{
                                     console.log(err);
                                 })
                             })
                         })
                        }
                     })
                       
                   }
                   
               })
           }
       }
    
})

   router.get('/user/:id', async(req, res)=>{
     try{
        const user = await User.findOne({_id:req.params.id})
        const users = await User.find({_id:req.params.id})
        const stories = await Story.find({user:req.params.id}).populate('user')

        res.render('users/profile', {user, users, stories})
     }
     catch(err){
       console.log(err.message)
     }
   })


   router.get('/user/:id/:username', async(req, res)=>{
     try{
    const user = await User.findOne({_id:req.params.id})
    const users = await User.find({_id:req.params.id})
    const stories = await Story.find({user: req.params.id}).populate('user')

    res.render('users/person', {user, users, stories})
     }
     catch(err){
       console.log(err.message)
     }
})

   router.get('/email/user/:id/:username', async(req, res)=>{
     try{
       const user = await User.findOne({_id:req.params.id})
       const ask = await User.findOne({_id:req.user.id})
       res.render('users/email', {user, ask})
     }
     catch(err){
       console.log(err.message)
     }
   })

router.post('/email', (req, res)=>{
let transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 465,
     secure: true,
     tls:{
         rejectUnauthorized: false
     },
      auth:{
        user: process.env.GMAIL_EMAIL,
        pass:process.env.GMAIL_PASS
      }
});
   
 var mailOptions={
         from: 'trust.com<noreply.elizaofficial5@gmail.com>',
         to: req.body.mail,
         subject: ' message from Trust.com',
         replyTo: req.body.mail,
         text: req.body.message,
 };    
 
  transporter.sendMail(mailOptions, function(err, info){
       if(err){
           console.log(err.message)
           req.flash('error_msg', 'Message not sent try again')
           res.redirect('back')
       }else{
           console.log('message sent ' + info.response)
           req.flash('success_msg', 'Message sent successfully')
           res.redirect('back')
       }
  })
})

router.get('/forgot', (req, res)=>{
     res.render('users/forgot')
});

router.get('/reset', (req, res)=>{
    res.render('users/reset')
});




router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error_msg', 'No account with that email address exists.');
            return res.redirect('back');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        let transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.GMAIL_EMAIL,
            pass:process.env.GMAIL_PASS
             
          },
          tls:{
            rejectUnauthorized:false,
          }
      });
        var mailOptions = {
          to: user.email,
          from: 'trust.com <noreply.elizaofficial5@gmail.com>',
          subject: 'trust.com Forum Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.hostname + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        transporter.sendMail(mailOptions, function(err) {
          req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });

  //end of forget post

//Gettin the reset token


router.get('/reset/:token', function(req, res) {
User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
  if (!user) {
    req.flash('error_msg', 'Password reset token is invalid or has expired.');
    return res.redirect('/forgot');
  }
  res.render('users/reset',{token: req.params.token});
});
});









router.post('/reset/:token', function(req, res) {
async.waterfall([
  function(done) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error_msg', 'Password reset token is invalid or has expired.');
        return res.redirect('back');
      }
        if(req.body.password.length < 4){
           req.flash('error_msg', 'Password must be atleast 4 character.')
           return res.redirect('back')
        }
       if(req.body.password === req.body.password2){

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
            
       bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(user.password, salt, (err,hash)=>{
         if(err) throw err;
        user.password = hash;
        console.log(user.password)
      user.save(function(err) {
        req.logIn(user, function(err) {
          done(err, user);
        });
      });
    });
    });
  } else{
    req.flash('error_msg', 'Passwords do not match.');
     return res.redirect('back');
  }
  })
  },
  function(user, done) {
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass:process.env.GMAIL_PASS
         
      },
      tls:{
        rejectUnauthorized:false,
      }
  });
    var mailOptions = {
      to: user.email,
      from: 'trust.com password reset<noreply.elizaofficial5@gmail.com>',
      subject: 'Your password has been changed',
      text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
    };
    transporter.sendMail(mailOptions, function(err) {
     
      req.flash('success_msg', 'Success! Your password has been changed.');
      done(err);
    });
  }
], function(err) {
  res.redirect('/');
});
});


router.get('/edit/user/:id',ensureAuthenticated, async(req, res)=>{
  try{
   const user = await User.findOne({_id:req.params.id})
   if(req.user.id == req.params.id){
   res.render('users/edit', {user})
   }else{
    req.flash('error_msg', ' Unable to complete this action');
    res.redirect('/')
   }
  }
  catch(err){
    console.log(err.message)
  }
})

router.get('/update/user/:id',ensureAuthenticated, async(req, res)=>{
  try{
    if(req.user.isAdmin){
  const user = await User.findOne({_id:req.params.id})
  res.render('users/edito', {user})
    }else{
      req.flash('error_msg', ' Unable to complete this action');
      res.redirect('/')
    }
  }
  catch(err){
    console.log(err)
  }
})

router.put('/user/:id', (req, res)=>{
   User.findOne({_id:req.params.id})
   .then(user=>{
     user.email=req.body.email;
    
    
       user.save()
       console.log(user)
       res.redirect('/')
   })
})



router.put('/update/user/:id', (req, res)=>{
  User.findOne({_id:req.params.id})
  .then(user=>{
    if(req.body.admin===process.env.isAdmin){
       user.isAdmin=true;
    }else{
      if(req.body.admin === process.env.notAdmin){
        user.isAdmin=false;
      }
    };
      user.save()
      console.log(user)
      res.redirect('/')
  })
})


module.exports=router;