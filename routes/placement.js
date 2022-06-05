const express= require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsyncError')
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({extended: true});
const Placement = require('../models/placements')
const {isLoggedIn} = require('../middleware')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
// console.log(mapBoxToken)

const geocoder = mbxGeocoding({accessToken: mapBoxToken})

router.get('/new',urlencodedParser, catchAsync(async (req,res)=>{
    res.render('placements/new')
}))




router.get('/:id',isLoggedIn,urlencodedParser, catchAsync(async (req,res)=>{

    
    const company = await Placement.findById(req.params.id)
    // console.log(company)
    if(!company){
        req.flash('error', 'no such company found :(')
        return res.redirect('/placement')
    }

    const geoData = await geocoder.forwardGeocode({
        query:company.location,
        limit:1
    }).send()
    const {coordinates}= geoData.body.features[0].geometry
    // console.log(coordinates)
    res.render('placements/show', {company, coordinates})
}))

router.get('/:id/edit',urlencodedParser,isLoggedIn,catchAsync(async (req,res,next)=>{
    // console.log(req.body)
    const company = await Placement.findById(req.params.id)
    if(!company){
        req.flash('error', 'no such company found :(')
        return res.redirect('/placement')
    }
    res.render('placements/edit', {company})
}))

router.put('/:id', urlencodedParser ,catchAsync(async(req,res)=>{
    const {id} = req.params
    // console.log(id)
    
    // console.log(req.body)
    // console.log(req.user)


    const applied = req.body.hasApplied
    const appliedByauth= req.user.username
    const placement = await Placement.findByIdAndUpdate(id,{hasApplied: applied} )
    console.log(appliedByauth)
    if(applied=='true'){
        placement.appliedBy.push(appliedByauth)
        req.user.appliedCompanies.push(placement.name)
       
    }
    else if(applied == 'false'){
         
    for( var i = 0; i <  placement.appliedBy.length; i++){ 
        // console.log('false', appliedByauth)
        if (  placement.appliedBy[i] ==appliedByauth) { 
            // console.log(placement.appliedBy[i])
            placement.appliedBy.splice(i, 1); 
        }  
    }

    for( var i = 0; i <  req.user.appliedCompanies.length; i++){ 
        if (  req.user.appliedCompanies[i] ==placement.name) { 
            req.user.appliedCompanies.splice(i, 1); 
        }  
    }

    }
    placement.save()
    req.user.save()
    req.flash('success', 'Successfully edited your response')
    res.redirect(`/placements/${placement._id}`)

}))

router.delete('/:id',urlencodedParser, catchAsync(async (req,res)=>{
    const {id} = req.params
    await Placement.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted the company')
    res.redirect('/placement')
}))



module.exports= router