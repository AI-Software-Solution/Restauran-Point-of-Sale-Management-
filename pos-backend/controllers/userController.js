const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

require('dotenv').config()


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
    
        const newUser = await User.create({name, phone, email, password, role})
        
        const payload = { email: newUser.email, role: newUser.role, _id: newUser._id };
        const accessToken = jwt.sign(payload, config.accessTokenSecret, {expiresIn : '1d'});
        
        newUser.token = accessToken;
        await newUser.save();

        res.status(201).json({success: true, message: "New user created!", data: newUser
        });


    } catch (error) {
        next(error);
    }
}

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
        
        const isPassMatch = await bcrypt.compare(password, isUserPresent.password);
        if(!isPassMatch){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }        
        
        if (isUserPresent.status === true) {
            const accessToken = jwt.sign({_id: isUserPresent._id}, config.accessTokenSecret, {
                expiresIn : '1d'
            });
             
            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 *24 * 30,
                httpOnly: true,
                sameSite: 'none',
                secure: true
            })
        }
        
        res.status(200).json({success: true, message: "User login successfully!", 
            data: isUserPresent
        });
        
        
    } catch (error) {
        next(error);
    }
    
}

const checkToken = async (req, res, next) => {
    try {
        const {token, email} = req.body
        const validToken = await User.findOne({email})        
        
        if(token !== validToken.token){
            console.log(token);
           console.log(validToken.token);        
            throw new Error('Token is not valid, please try again')   
        }

        await User.findByIdAndUpdate(validToken._id, {
            $set: { status: true }
        })
   

            res.cookie('accessToken', token, {
                maxAge: 1000 * 60 * 60 *24 * 30,
                httpOnly: true,
                sameSite: 'none',
                secure: true
            })
            
            return res.status(200).json({message: "Token successfully verified"})
        }
        catch (error) {
        next(error)
    }
}

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find()        
        res.status(200).json(users)
    } catch (error) {
        next(error)
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




module.exports = { register, login, getUserData, logout, updateUserData, deleteUserData, getUsers, checkToken }