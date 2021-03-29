const express = require('express');
const router = express.Router();
const env = require('dotenv');
const request = require('request');
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');
env.config({path: '../.env'});

require('../models/Contact');
require('../models/Notification');




router.post('/contact', async(req, res)=>{
    try{
     const newContact = {
         name: req.body.name,
          sender: req.body.sender,
          detail: req.body.detail
      }
      let contact = await Contact.create(newContact)
       console.log(contact)
      let newNotification={
        name: req.body.name,
        contactId: contact.id
    }
    Notification.create(newNotification)
    console.log(newNotification)
    
       req.flash('success_msg', 'Message delivered successfully!') 
       res.redirect('/')
      }   
       catch(err){
           console.log(err.message)
           req.flash('error_msg', 'An unknown error occured')
           res.redirect('back')
       }
        
    });


    router.get('/contacts/:id', async(req, res)=>{
        try{
          let contact = await Contact.findById(req.params.id)
          res.render('contacts/show', {contact})
        }
        catch(err){
            console.log(err.message)
  
        }
    });
    

router.get('/notifications/:contactId', async(req, res)=>{
    try{
       let notification = await Notification.findOne({contactId: req.params.contactId})
         notification.isRead = true;
        notification.save();
        
       res.redirect('/contacts/'+notification.contactId);
    
    }
    catch(err){
      console.log(err.message)
      req.flash('error_msg', 'An error occured')
      res.redirect('back')
    }
  });


  
router.post('/reply', async(req, res)=>{
  

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        tls:{
            rejectUnauthorized: false,
        },
        auth:{
         user: process.env.GMAIL_EMAIL,
         pass:process.env.GMAIL_PASS
        },
    });

     var mailOptions={
                   from:process.env.GMAIL_EMAIL,
                   to: req.body.sender,
                   replyTo: process.env.GMAIL_EMAIL,
                   subject: 'Message from trust.com ',
                   text: req.body.detail,
          };
       
         transporter.sendMail(mailOptions, function(err, info){
           if(err){
               console.log(err)
               req.flash('error_msg', 'Message not sent, try again')
               return res.redirect('back')
           }else{
               console.log('Message sent successfully' + info.response)
               req.flash('success_msg', 'Message delivered successfully')
               return res.redirect('/')
           }
       })

   })

/*
router.get('/delete/notification/:id', async(req, res)=>{
    try{
        let contact = await Contact.findOne({_id:req.params.id})
        if(!contact){
            req.flash('error_msg', 'No message found')
            res.redirect('back');
        }else{
            Contact.deleteOne({_id: req.params.id})
            .then(()=>{
                req.flash('success_msg', 'Message deleted successfully')
                res.redirect('/')
            })
        }
        
    }
    catch(err){
        console.log(err.message)
    }
}); */

router.get('/delete/notification/:id',async (req, res)=>{
   
    try{
   const contact = await Contact.findById(req.params.id)  
   if(!contact){
       res.redirect('back')
   }
    contact.remove();
    req.flash('success_msg', 'Message deleted')
    console.log(contact)
    res.redirect('/')
}
catch(err){
    console.log(err.message)
}
})

router.get('/messages', async(req, res)=>{
    const contacts = await Contact.find({}).sort({date:-1})
    const contacs = await Notification.find({}).sort({date:-1})

    res.render('contacts/index', {contacts, contacs});
});


router.post('/signup', (req, res)=>{
    const {email} = req.body;

    const data = {
        members: [
            {
                email_address: email,
                status: 'subscribed'
                //if firstname or lastname is included in the form add
               /* merge_fields: {
                    FNAME: firstname,
                    LNAME: lastname
                }*/
            }
        ]
    }
    const postData = JSON.stringify(data);
      const options={
          url: 'https://us1.api.mailchimp.com/3.0/lists/a3318170e1',
          method: 'POST',
          headers: {
              Authorization: 'auth 378301469466fe2940b28f5ccaf89cee-us1'
          },
          body: postData
      }
      request(options, (err, response, body)=>{
          if(err){
              console.log(err)
              req.flash('error_msg', 'An error occured')
              res.redirect('/');
          }else{
              if(response.statusCode === 200){
                  req.flash('success_msg', 'You have successfully subscribed to our newsletter');
                  res.redirect('/');
              }else{
                  console.log(err)
                req.flash('error_msg', 'An error occured ')
                res.redirect('/');
              }
          }
      })
})


module.exports = router;