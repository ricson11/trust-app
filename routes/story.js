const express = require ('express');
const router = express.Router();
const env = require('dotenv');
var nodemailer = require('nodemailer');
const cloudinary = require('cloudinary');
const mongooseSlugPlugin = require('mongoose-slug-plugin');
require('../models/Story');
require('../models/Comment');
require('../models/Banner');
const upload = require('../middlewares/multer');
const {ensureAuthenticated}=require('../helpers/auth');

env.config({path: '../.env'});


router.get('/add', ensureAuthenticated,(req, res)=>{
     req.flash('error_msg', 'Login to complete this action')
    res.render('stories/add')
})


/*router.get('/api/stories', async (req, res) => {
    const stories = await Story.find().sort({_id: -1});
    res.json(stories)
})*/

router.get('/',   async(req, res)=>{
     const page = parseInt(req.query.page)||1
     const limit = parseInt(req.query.limit)||10
     const count = await Story.countDocuments({})
     const pages = Math.ceil(count/limit)
     const nextIndex = (page+1)
     const startIndex = (page-1)
     page2 = (pages>1)
     page3 = (pages>2)
     page4 = (pages>3)
     page5 = (pages>4)
     page6 = (pages>5)
     pageNext = (pages>6)

     if(nextIndex > pages || nextIndex<pageNext){
         pageNext=false;
     }
    
 
     const stories =  await Story.find({}).skip((limit*page)-limit).limit(limit).sort({date:-1}).populate('user')
     .populate('comments')
     const comments = await Comment.find({}).sort({commentDate:-1}).limit(3).populate('commentUser').populate('story')
      const trending = await Story.find({}).sort({views:-1}).limit(3).populate('user')
      const lagBan = await Banner.find({}).sort({date:-1}).limit(1) 
      const sideBan = await Banner.find({}).sort({date:-1}).skip(1).limit(1) 

     res.render('index', { stories, sideBan,lagBan,trending,pages,comments, page,page6, page2, page3, page4, page5, pageNext, limit,startIndex, nextIndex})
});


router.post('/story', upload.single('image'), (req, res)=>{
    if(req.body.allowComment){
        allowComment=true;
    }else{
        allowComment=false;
    }
      let errors=[];
    if(req.body.title.length > 95){
        errors.push({text: 'Reduce the length of the title'})
    }

    if(errors.length>0){
        res.render('stories/add', {
            errors:errors,
            title:req.body.title,
            details:req.body.details,
            allowComment: allowComment,
        })
    }else{
     
       if(req.file){
          cloudinary.v2.uploader.upload(req.file.path, {folder:'zenith'}, function(err, result){
              if(err){
                  console.log(err)
              }else{
            
                const newStory={
                    title:req.body.title,
                    details:req.body.details,
                    image:result.secure_url,
                  // image:'/uploads/'+ req.file.filename,
                   allowComment: allowComment,
                     user: req.user.id,
                      cloudinary_id: result.public_id
            
                     }   
                    Story.create(newStory, function(err){
                        if(err){
                            console.log(err)
                        }else{
                            console.log(newStory)
                            res.redirect('/')
                        }
                    })
              }
          })
     
           
       }else{
        const newStory={
            title:req.body.title,
            details:req.body.details,
           allowComment: allowComment,
             user: req.user.id,
    
    
             }   
             Story.create(newStory, function(err){
                if(err){
                    console.log(err)
                }else{
                    console.log(newStory)
                    res.redirect('/')
                }
            })
       }
        
  
}    
})



router.get('/edit/story/:id',ensureAuthenticated ,async(req, res)=>{
    try{
    const story  = await Story.findOne({_id:req.params.id})
    if(req.user.id == story.user || req.user.isAdmin || req.user.superAdmin){
    res.render('stories/edit', {story})
    }else{
        req.flash('error_msg', ' Not permitted')
        res.redirect('/');
    }
    }
    catch(err){
        console.log(err.message)
        res,redirect('/500')
    }
});

  router.get('/story/:id', async(req, res)=>{
     try{
         
         const story = await Story.findOne({_id:req.params.id})
         .populate(' comments')
         .populate(' user')
            story.views++;
            story.save();
           
          var page = parseInt(req.query.page)||1
          var    limit =parseInt(req.query.limit)||2
           var nextIndex = (page+1)
          var startIndex = (page-1)
          const count = await Comment.countDocuments({story:req.params.id})
          const  pages = Math.ceil(count/limit)
          var page2 = (pages>1)
          var page3 = (pages>2)
          var pageNext = (pages>3)

          if(nextIndex>pages || nextIndex<pageNext){
              pageNext=false;
          }
         const comments = await Comment.find({story:req.params.id}).sort({commentDate:-1}).populate('commentUser').populate('story')
         .limit(limit).skip((limit*page)-limit);
          let q = new RegExp(story.title, 'i');
          const similar = await Story.find({title:q}).sort({date:-1}).limit(3)

         // const story_body = decode(story.details);
        
          res.render('stories/show', {story, comments,similar,count,nextIndex,pageNext,startIndex, limit, page, pages, page2, page3});
     }
     catch(err){
         console.log(err)
     }
  })


router.put('/story/:id', upload.single('image'), async(req, res)=>{
    if(req.body.allowComment){
        allowComment=true;
    }else{
        allowComment=false;
    }
       if(req.file){
          const story = await Story.findOne({_id:req.params.id})
          if(!story){
       res.redirect('/admin/home')
          } 
          cloudinary.v2.uploader.destroy(story.cloudinary_id)
         cloudinary.v2.uploader.upload(req.file.path, {folder: 'zenith'}, function(err, result){
             if(err){
                 console.log(err)
             }else{
          
      Story.findOne({_id:req.params.id})
      .then(story=>{
          story.image=result.secure_url,
          story.allowComment= allowComment,
          story.title=req.body.title,
          story.details=req.body.details,
          story.cloudinary_id=result.cloudinary_id,
          story.save()
          .then(story=>{
              console.log(story)
              res.redirect('/')
          })
      })
    }
})
    }else{
        Story.findOne({_id:req.params.id})
        .then(story=>{
            story.allowComment= allowComment,
            story.title=req.body.title,
            story.details=req.body.details,
            story.save()
            .then(story=>{
                console.log(story)
                res.redirect('/')
            })
        })
    }
})

router.get('/delete/story/:id', async(req, res)=>{
    try{
        const story = await  Story.findOne({_id:req.params.id})
    if(req.user.id==story.user || req.user.isAdmin || req.user.superAdmin){
     cloudinary.v2.uploader.destroy(story.cloudinary_id)
         
        Story.deleteOne({_id:req.params.id})
         .then(()=>{
            req.flash('success_msg', ' Story deleted')

           res.redirect('/admin/home')
         
         })
        }else{
            req.flash('error_msg', ' Unable to complete this action')
            res.redirect('/');
        }
    
    }
    catch(err){
        console.log(err.message)
    }
})


router.get('/search', async(req, res)=>{
    const {query} = req.query;
    const q = new RegExp(query, 'i')
    const page = parseInt(req.query.page)||1
    const limit =parseInt(req.query.limit)||5
    const nextIndex = (page+1)
    const startIndex = (page-1)
    const count = await Story.countDocuments({title:q})
    const pages = Math.ceil(count/limit) 
     page2 = (pages>1)
     page3 = (pages>2)
     page4 = (pages>3)
     page5 = (pages>4)
     pageNext = (pages>5)
    if(nextIndex>pages || nextIndex<pageNext){
        pageNext=false;
    }

    const searches = await Story.find({$or:[{title:q}, {details:q}]}).skip((page*limit)-limit)
    .limit(limit).populate('user')
    res.render('search_result', {searches,query, page2, page3, page4, page5, pageNext, count, pages, page, limit, nextIndex, startIndex});
})



router.post('/contact', (req, res)=>{
      
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
                      to: process.env.GMAIL_EMAIL,
                      replyTo: req.body.sender,
                      subject: 'New contact @trust.com from,'+" " + req.body.Name,
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
                  return res.redirect('back')
              }
          })
      })

router.get('/report/user/:username', async(req, res)=>{
    try{
    const user = await User.findOne({username:req.params.username})
    res.render('stories/report', {user})
    }
    catch(err){
        console.log(err.message)
    }
})



router.post('/report', (req, res)=>{
      
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
                   from:req.body.sender,
                   to: process.env.GMAIL_EMAIL,
                   
                   subject: 'New report @trust.com by,'+" " + req.body.sender + " "+ 'reportee @ user'+ " "+ req.body.receiver,
                   text: req.body.report,
          };
       
         transporter.sendMail(mailOptions, function(err, info){
           if(err){
               console.log(err)
               req.flash('error_msg', 'report not sent, try again')
               return res.redirect('back')
           }else{
               console.log('report sent successfully' + info.response)
               req.flash('success_msg', 'report delivered successfully')
               return res.redirect('/')
           }
       })
   })


router.get('/stories', async(req, res)=>{
    const page = parseInt(req.query.page)||1
   const limit = parseInt(req.query.limit)||5
   const count = await Story.countDocuments({user: req.user.id})
   const pages = Math.ceil(count/limit)
    startIndex = (page-1)
    nextIndex = (page+1)
   if(nextIndex > pages){
     nextIndex=false;
   };
  const stories = await Story.find({user: req.user.id}).sort({date:-1}).skip((page*limit)-limit).limit(limit)
   .populate('user')
  res.render('stories/myStory', {stories, nextIndex, startIndex, page, limit, pages})
})

router.get('/like/story/:id',async (req, res)=>{
    try{
        const story = await Story.findOne({_id:req.params.id})
        story.like++;
           story.save();
        res.redirect('/story/'+story._id)
    }
    catch(err){
        console.log(err.message)
    }
});

router.get('/dislike/story/:id',async (req, res)=>{
    try{
        const story = await Story.findOne({_id:req.params.id})
        story.dislike++;
        story.save();
        res.redirect('/story/'+story._id)
    }
    catch(err){
        console.log(err.message)
    }
});

router.get('/coming', (req, res)=>{
    res.send('coming soon')
})
    
module.exports = router;