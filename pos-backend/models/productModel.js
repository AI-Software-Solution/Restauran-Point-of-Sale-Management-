const { default: mongoose } = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: {
        type: Number,
        required: [true, 'Please enter product price']
    },
    category: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }
},{
 timestamps:true,
 versionKey:false
});

module.exports = mongoose.model("Product", productSchema);