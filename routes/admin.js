const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');
const user = require('../models/User');
const story = require('../models/Story');
const User = require('../models/User');
const Story = require('../models/Story');
const { findOneAndDelete } = require('../models/User');
require('../models/Comment');
require('../models/Banner');

const layout = 'admin';

router.get('/home',ensureAuthenticated ,async (req, res)=>{
   if(req.user.isAdmin || req.user.superAdmin){
   const page = parseInt(req.query.page)||1
   const limit = parseInt(req.query.limit)||2
   const count = await Story.countDocuments({})
   const pages = Math.ceil(count/limit)
    startIndex = (page-1)
    nextIndex = (page+1)
   if(nextIndex > pages){
     nextIndex=false;
   };
  const stories = await Story.find({}).sort({date:-1}).skip((page*limit)-limit).limit(limit)
  const users = await  User.find({}).limit(2)
  const userCount = await User.countDocuments({})
  const storyCount = await Story.countDocuments({})
    res.render('admins/home', {layout, nextIndex, startIndex, page, limit,pages, stories, users, storyCount, userCount})
  }else{
      req.flash('error_msg', 'This is an admin page. you are not permitted')
      res.redirect('/')
   
   
  }
  });

router.get('/search_user', async(req, res)=>{
    const {query}=req.query;
    let q = new RegExp(query, 'i')
    const search = await User.find({$or:[{username: q}, {email:q}]})
    res.render('admins/home', {search})

})


/*router.get('/delete/user/:id', (req, res)=>{
       User.deleteOne({_id:req.params.id})
       .then(()=>{
         req.flash('success_msg', 'User deleted successfully!')
         res.render('admins/home')
       })
})*/


router.get('/delete/user/:id', (req, res)=>{
  User.findById(req.params.id, function(err, doc){
    if(err) throw err;
    else if(!doc)
    res.redirect('/admin/home')

    doc.remove(function (err, storyData, commentData){
      if(err){
        throw err;
      } else{
        console.log(storyData)
        
        req.flash('success_msg', 'The user and the user stories deleted successfully')
        res.redirect('/admin/home');
      }

    })
     
  })    
   
})

    
  


router.get('/only/story/:slug', async(req, res)=>{
  try{
      
      const story = await Story.findOne({slug:req.params.slug})
      .populate(' comments')
      .populate(' user')
         story.views++;
         story.save();
        
       var page = parseInt(req.query.page)||1
       var    limit =parseInt(req.query.limit)||2
        var nextIndex = (page+1)
       var startIndex = (page-1)
       const count = await Comment.countDocuments({story:req.params.slug})
       const  pages = Math.ceil(count/limit)
       var page2 = (pages>1)
       var page3 = (pages>2)
       var pageNext = (pages>3)

       if(nextIndex>pages || nextIndex<pageNext){
           pageNext=false;
       }
      const comments = await Comment.find({story:req.params.slug}).sort({commentDate:-1}).populate('commentUser').populate('story')
      .limit(limit).skip((limit*page)-limit);
       let q = new RegExp(story.title, 'i');
       const similar = await Story.find({title:q}).sort({date:-1}).limit(3)
     
       res.render('stories/show1', {story, comments,similar,count,nextIndex,pageNext,startIndex, limit, page, pages, page2, page3});
  }
  catch(err){
      console.log(err)
  }
})

module.exports = router;