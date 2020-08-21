module.exports = {
    ensureAuth :(req,res,next)=>{
        if (req.isAuthenticated) {
            return next()
        }
        req.flash('error_msg','login to view this resource')
        res.redirect('/users/login')
    }
}