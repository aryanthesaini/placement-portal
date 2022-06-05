module.exports.isLoggedIn = (req,res,next)=>{
    // console.log(req.user)
    req.session.returnTo = req.originalUrl
    if(!req.isAuthenticated()){
    req.flash('error', 'you must be signed in!')
    return res.redirect('/login')
    }
    next()
}