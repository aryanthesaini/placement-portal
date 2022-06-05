const express = require('express')
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../utils/catchAsyncError')
const bodyParser = require('body-parser')
const passport = require('passport')
const { nextTick } = require('process')
var urlencodedParser = bodyParser.urlencoded({extended: true});


router.get('/register',(req,res)=>{
    res.render('user/register')
})

router.post('/register',urlencodedParser, catchAsync(async(req,res)=>{
    // res.send(req.body)
    try{
        const {email,username,password} = req.body;
        const user = await new User({email,username})
        const registeredUser = await User.register(user,password)
        req.login(registeredUser, err=>{
            if(err) return next(err)
            req.flash('success',`Welcome to NSUT placements ${registeredUser.username}`)
            res.redirect('/placement')
        })
       
    }catch(e){
        req.flash('error', e.message)
         res.redirect('register')
    }

    // console.log(registeredUser)
    
}))



router.get('/login', (req,res)=>{
    res.render('user/login')
})


router.post('/login',urlencodedParser,passport.authenticate('local', {failureFlash:true, failureRedirect:'/login'}), (req,res)=>{
    // res.send(req.body)
    req.flash('success','Welcome back, we successfully logged you in')
    const redirectUrl = req.session.returnTo || 'placement'
    delete req.session.returnTo
    res.redirect(redirectUrl)
})

router.get('/logout', urlencodedParser, (req,res)=>{
    req.logout()
    req.flash('success', "Goodbye!")
    res.redirect('/')
})


module.exports= router