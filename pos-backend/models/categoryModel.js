const { default: mongoose } = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
},{
 timestamps:true,
 versionKey:false
});

module.exports = mongoose.model("Category", categorySchema);