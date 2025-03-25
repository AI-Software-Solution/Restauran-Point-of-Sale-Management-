const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    },

    email : {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^([0-9A-Za-z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/.test(v);
            },
            message : "Email must be in valid format!"
        }
    },

    phone: {
        type: String,  // Store phone numbers as a string
        required: true,
        validate: {
            validator: function (v) {
                return /^\+998\d{9}$/.test(v); // Matches +998 followed by 9 digits
            },
            message: "Phone number must start with +998 and be followed by 9 digits!"
        }
    },
    

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        required: true
    },
    token: {type: String},
    status: {type:Boolean, default:false}
}, { timestamps : true })

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

module.exports = mongoose.model("User", userSchema);