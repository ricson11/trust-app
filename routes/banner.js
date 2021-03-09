const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary');
const fs = require('fs');
const path = require('path');
const upload = require('../middlewares/multer');
//const cloudinary = require('../middlewares/cloudinary');
const {ensureAuthenticated} = require('../helpers/auth');
//const multer = require('../middlewares/multer');
const { pathToFileURL } = require('url');
const { fstat } = require('fs');
require('../models/Banner');
require('../models/User');

/*const cloudinaryImageUploadMethod = async file=>{
    return new Promise(resolve=>{
        cloudinary.uploader.upload(file, (err, res)=>{
            if(err) return res.status(500).send("upload image error")
            console.log(res.secure_url)
            resolve({
                res: res.secure_url
            })
        }
        )
    })
}*/



 
 

    const uploadMethod = async file=>{
        return new Promise(resolve=>{
            cloudinary.uploader.upload(file, (result)=>{
                resolve({
                    result:result.secure_url,
                    id: result.public_id,
                })
            }, {
                resource_type: 'auto',
                folder: 'zenith'
            })
        })
    }

    router.post('/', upload.array('ad'), async(req, res)=>{
      
        try{

       // const uploader = async (path) => await cloudinary.uploads(path, 'ad')
        if(req.method === 'POST'){
            const urls = [];
            const files = req.files;
            for(const file of files){
                const {path} = file;
                const newPath = await uploadMethod(path)
                urls.push(newPath)
                fs.unlinkSync(path)
            } 
          
               const newBanner={
                   url: req.body.url,
                   ad:urls.map(url=>url.result)
               }
               Banner.create(newBanner)
               console.log(newBanner)
               res.redirect('/banner/adhome');
        }
     
    }
    catch(err){
        console.log(err.message)
    }
    })


   /* router.post('/', upload.fields([{name: 'ad3'},{name: 'ad2'},{name: 'ad'}, {name: 'ad1'}]), async(req, res)=>{
         
        //multer upload.fields
        try{
       
    
          
          
            if(req.files.ad3){
              
                const newBanner = {
                    url: req.body.url,
                    ad:'/uploads/' + req.files.ad[0].filename,
                    ad1:'/uploads/' + req.files.ad1[0].filename,
                    ad2:'/uploads/' + req.files.ad2[0].filename,
                    ad3:'/uploads/' + req.files.ad3[0].filename,

                }
            
                Banner.create(newBanner)
                console.log(newBanner)
               return res.redirect('/banner/adhome');
            }  
            

            if(req.files.ad2){
             
                const newBanner = {
                    url: req.body.url,
                    ad:'/uploads/' + req.files.ad[0].filename,
                    ad1:'/uploads/' + req.files.ad1[0].filename,
                    ad2:'/uploads/' + req.files.ad2[0].filename,

                }
            
                Banner.create(newBanner)
                console.log(newBanner)
               return res.redirect('/banner/adhome');
            }  
            
            if(req.files.ad1){
               
                const newBanner = {
                    url: req.body.url,
                    ad:'/uploads/' + req.files.ad[0].filename,
                    ad1:'/uploads/' + req.files.ad1[0].filename,

                }
            
                Banner.create(newBanner)
                console.log(newBanner)
               return res.redirect('/banner/adhome');
              
            }
            if(req.files.ad){
               
                const newBanner = {
                    url: req.body.url,
                    ad:'/uploads/' + req.files.ad[0].filename,
                   

                   
                        
                    
                }
            
                Banner.create(newBanner)
                console.log(newBanner)
               return res.redirect('/banner/adhome');
                
            }
         
            
        
                const newBanner = {
                    url: req.body.url,
                 
                }
                Banner.create(newBanner)
                console.log(newBanner)
               return res.redirect('/banner/adhome');
       
            
        }
    
    catch(err){
        console.log(err.message)
    }
})  */

    

router.get('/add', ensureAuthenticated, (req, res)=>{
    if(req.user.isAdmin || req.user.superAdmin){
    res.render('banners/add');
    }else{
        req.flash('error_msg', ' Unable to complete this action');
        res.redirect('/')
    }
})

router.get('/adhome', ensureAuthenticated,async(req, res)=>{
    if(req.user.isAdmin || req.user.superAdmin){
    const banner1 = await Banner.find({}).sort({date:-1}).limit(1)
    const banners = await Banner.find({}).sort({date:-1}).limit(2)
     res.render('banners/adhome', {banner1, banners})
    }else{
        req.flash('error_msg', ' Unable to complete this action');
        res.redirect('/')
    }
})



router.get('/advert', ensureAuthenticated,(req, res)=>{
    if(req.user.isAdmin || req.user.superAdmin){
    res.render('banners/advert')
    }else{
        req.flash('error_msg', ' Unable to complete this action');
        res.redirect('/')
    }
});

router.get('/delete/:id', (req, res)=>{
    if(req.user.isAdmin || req.user.superAdmin){
        Banner.deleteOne({_id:req.params.id})
        .then(()=>{
            req.flash('success_msg', 'Ad deleted');
            res.redirect('back')
        })
    }else{
        req.flash('error_msg', ' Unable to complete this action');
        res.redirect('/')
    }
})

module.exports = router;


