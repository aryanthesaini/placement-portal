const companies = require('./companies')
const mongoose = require('mongoose')
const Placement = require('../models/placements')
// const Placement = require('./models/placements')


mongoose.connect('mongodb://localhost:27017/placements',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false 
})


const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', ()=>{
    console.log('Database connected')
})


const seedDB = async ()=>{
    await Placement.deleteMany({})
    for(let i=0;i<5;i++){
        const price= Math.floor(Math.random()*20)+10
        const place = new Placement({
            name: companies[i].name,
            description: companies[i].description,
            hasApplied: companies[i].hasApplied,
            image:companies[i].image ,
            price:price,
            location:companies[i].location
        })
        await place.save()
    }
}

seedDB().then(()=>{
    mongoose.connection.close()
})