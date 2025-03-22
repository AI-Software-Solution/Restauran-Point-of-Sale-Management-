const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
// const TelegramBot = require('node-telegram-bot-api')
require('dotenv').config()

// const token = process.env.TG_TOKEN
// const bot = new TelegramBot(token, {polling:true});

const register = async (req, res, next) => {
    try {

        const { name, phone, email, password, role } = req.body;

        if(!name || !phone || !email || !password || !role){
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        const isUserPresent = await User.findOne({email});
        if(isUserPresent){
            const error = createHttpError(400, "User already exist!");
            return next(error);
        }
    /// create token
        const newUser = await User.create({name, phone, email, password, role})

        const payload = { email: newUser.email, id: newUser._id, role: newUser.role };
        const accessToken = jwt.sign(payload, config.accessTokenSecret, {expiresIn : '1d'});

        newUser.token = accessToken;
        await newUser.save();

        res.status(201).json({success: true, message: "New user created!", data: newUser
        });


    } catch (error) {
        next(error);
        // bot.on("polling_error", (error) => {
        //     console.error("Telegram Bot Error:", error);
        // });
        
    }
}

// const userSteps = {}

// // Handle start commant
// bot.onText(/\/start/, (msg) => {
//     const chatId = msg.chat?.id;
//     bot.sendMessage(chatId, `Assalam alaykum iltimos emailingizni kiriting:`)

// // Store that this user is entering their email
// userSteps[chatId] = 'waiting_for_email'
// });

// bot.on('message', async (msg) => {
//     const chatId = msg.chat?.id;

//     if(userSteps[chatId] === 'waiting_for_email'){
//         const email = msg.text.trim().toLowerCase(); // Get user email

//         try {
//             // Find user by email
//             let user = await User.findOne({email})

//             if(!user){
//                 bot.sendMessage(chatId, "Kechirasiz, bu email mavjud emas iltimos qayta tekshirib ko'ring")
//             }else{
//                 bot.sendMessage(chatId, `Sizning tokeningiz: ${user.token}`)
//             }
//         } catch (error) {
//             console.error('Error finding user: ', error);            
//         }

//         delete userSteps[chatId]
//     }
// });

// bot.on('polling_error', (error) => {
//     console.error('Telegram bot error: ', error);
    
// })


const login = async (req, res, next) => {

    try {
        
        const { email, password } = req.body;

        if(!email || !password) {
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        const isUserPresent = await User.findOne({email});
        if(!isUserPresent){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        const isMatch = await bcrypt.compare(password, isUserPresent.password);
        if(!isMatch){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        const accessToken = jwt.sign({_id: isUserPresent._id}, config.accessTokenSecret, {
            expiresIn : '1d'
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 *24 * 30,
            httpOnly: true,
            sameSite: 'none',
            secure: true
        })

        res.status(200).json({success: true, message: "User login successfully!", 
            data: isUserPresent
        });


    } catch (error) {
        next(error);
    }

}

const getUserData = async (req, res, next) => {
    try {
        
        const user = await User.findById(req.user._id);
        res.status(200).json({success: true, data: user});

    } catch (error) {
        next(error);
    }
}

const updateUserData = async(req, res, next) => {
    const id = req.user._id
    const newData = {...req.body}
    const data = await User.findByIdAndUpdate(id, newData, {new:true})
    if(!data){
        const error = createHttpError(404, "There is no such profile");
             return next(error);
     }
    res.status(200).json({message: 'Your profile udpated successfully', data})
}

const deleteUserData = async(req, res, next) => {
    const id = req.user._id
    const user = await User.findByIdAndDelete(id)
    if(!user){
        const error = createHttpError(404, "There is no such profile");
             return next(error);
     }
    res.status(200).send('Your profile was deleted successfully')
}

const logout = async (req, res, next) => {
    try {
        
        res.clearCookie('accessToken');
        res.status(200).json({success: true, message: "User logout successfully!"});

    } catch (error) {
        next(error);
    }
}




module.exports = { register, login, getUserData, logout, updateUserData, deleteUserData }