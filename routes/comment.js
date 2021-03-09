const express = require('express');
const router = express.Router({mergeParams: true});
const env = require('dotenv');
const cloudinary = require('cloudinary');

const upload = require('../middlewares/multer');
const {ensureAuthenticated}=require('../helpers/auth');
 require('../models/Comment');
 require('../models/Story');
 require('../models/User');
 env.config({path: './.env'});


router.get('/comment',ensureAuthenticated, async(req, res)=>{
    console.log(req.params)
    const story = await Story.findOne({_id:req.params.id})
  
        res.render('comments/comment', {story});

});



router.post('/comment', upload.single('commentImage'),(req, res)=>{
    
       if(req.file){
           cloudinary.v2.uploader.upload(req.file.path, {folder: 'zenith'}, function(err, result){
               if(err){
                   console.log(err)
               }
           const newComment={
               commentBody:req.body.commentBody,
               commentImage:result.secure_url,
               story:req.params.id,
               commentUser:req.user.id,
               cloudinary_id: result.public_id,
           }
            Comment.create(newComment, function(err, newComment){
                if(err){
                    console.log(err)
                }else{
                    Story.findById(req.params.id, function(err, story){
                        if(err){
                            console.log(err)
                        }else{
                            story.comments.unshift(newComment);
                            story.save()
                               
                               console.log(newComment)
                                 res.redirect('/story/'+story._id)
                            
                            
                           
                        }
                    })
                }
            })
        })
       }else{
         
      const newComment={
        commentBody:req.body.commentBody,
        story:req.params.id,
        commentUser:req.user._id,
    }
    
     Comment.create(newComment,function(err, newComment){
         if(err){
             console.log(err)
         }else{
             Story.findById(req.params.id, function(err, story){
                 if(err){
                     console.log(err)
                 }else{
                     story.comments.unshift(newComment);
                    
                     story.save()
                       // console.log(story)
                        console.log(newComment)
                          res.redirect('/story/'+story._id)
                     
                     
                    
                 }
             })
         }
     })
 }
})


router.get('/comment/:commentId/edit/',async(req, res)=>{
    try{
      const comment = await Comment.findOne({_id:req.params.commentId})

   
         
            console.log(req.params.commentId)
            console.log(req.params.id)
            if(req.user.id==comment.commentUser){
                
            res.render('comments/edit', {story_id:req.params.id, comment,})

            }else{
                req.flash('error_msg', 'You cannot edit this comment')
                    res.redirect('back')
            }
          
        
    }
    catch(err){
        console.log(err)
    }  
     
})


router.put('/comment/:commentId',upload.single('commentImage'), async(req, res)=>{
     
       const comment = await Comment.findOne({_id: req.params.commentId})
       if(!comment){
           res.redirect('/')
       }
       cloudinary.v2.uploader.destroy(comment.cloudinary_id)    

      if(req.file){
        cloudinary.v2.uploader.upload(req.file.path, {folder: 'zenith'}, function(err, result){
            if(err){
                console.log(err)
            }
       Comment.findOne({_id:req.params.commentId})
       .then(comment=>{
           comment.commentBody=req.body.commentBody,
           comment.commentImage=result.secure_url,
           cloudinary_id = result.public_id,

           comment.save((err)=>{
               if(err){
                   console.log(err)
               }else{
                   console.log(comment)
                res.redirect('/story/'+ req.params.id)


               }
               
              
           })
        })
       })
      }else{

            Comment.findOne({_id:req.params.commentId})
       .then(comment=>{
           comment.commentBody=req.body.commentBody,
           comment.save((err)=>{
               if(err){
                   console.log(err)
               }else{
                   console.log(comment)
                res.redirect('/story/'+req.params.id)


               }
               
              
           })
          
       })
      }
})



router.get('/comment/delete/:commentId', async(req, res)=>{
    try{
      
        if(req.user.superAdmin){
            const comment = await Comment.findOne({_id:req.params.commentId})
            if(!comment){
                res.redirect('back')
            }
       cloudinary.v2.uploader.destroy(comment.cloudinary_id)    
        
    Comment.deleteOne({_id:req.params.commentId})
    .then(()=>{
        req.flash('success_msg', 'Comment deleted ')
        res.redirect('back')
    })
}else{
    req.flash('error_msg', 'You cannot delete this comment')
    res.redirect('back')
}
}
    catch(err){
        console.log(err.message)
    }
})



module.exports = router;