const mongoose = require('mongoose')
const Schema = mongoose.Schema

const placementSchema = new Schema({
    name: String,
    description: String,
    image:String,
    hasApplied: Boolean,
    price: Number,
    location: String,
    appliedBy: [
        {
            type: Schema.Types.String,
        }
    ]
})


module.exports = mongoose.model('Placement', placementSchema)