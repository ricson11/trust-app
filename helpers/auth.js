module.exports={
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated()){
            return next()
        }
        req.flash('error_msg', 'Access restricted')
        res.redirect('/login')
    },
    checkUser: function(req, res, next){
        const comment =  Comment.findOne({_id:req.params.commentId})
        const user = User.findOne({_id:req.user.id})
        if(!comment){
            res.redirect('back')
        }
        if(user==comment.commentUser){
            return next();
        }else{
            req.flash('error_msg', 'no')
            res.redirect('back')
        }
    }
}