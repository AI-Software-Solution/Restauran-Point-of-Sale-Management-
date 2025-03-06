const User = require('../models/userModel')
const createHttpError = require("http-errors");

const getProfile = async(req, res, next) =>{
  const id = req.user.userId
  const user = await User.findById(id)
  if(!user){
     const error = createHttpError(404, "There is no such profile");
          return next(error);
  }
 res.status(200).json( user )
}

const updateProfile = async(req, res, next) => {
    const id = req.user.userId
    const newData = {...req.body}
    if(req.fileUrl){
        newData.image = req.fileUrl
    }
    const data = await User.findByIdAndUpdate(id, newData, {
        new:true, runValidators:true
    })
    if(!data){
        const error = createHttpError(404, "There is no such profile");
             return next(error);
     }
    res.status(200).json({message: 'Your profile udpated successfully', data})
}

const deleteProfile = async(req, res, next) => {
    const id = req.user.userId
    const user = await User.findByIdAndDelete(id)
    if(!user){
        const error = createHttpError(404, "There is no such profile");
             return next(error);
     }
    res.status(200).send('Your profile was deleted successfully')
}

module.exports = {
    getProfile,
    updateProfile,
    deleteProfile
}