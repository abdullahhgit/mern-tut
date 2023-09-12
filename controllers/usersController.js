const User = require('../models/User')
const Note = require('../models/Note')

const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const { boolean } = require('webidl-conversions')

// Fetch all users from DB
const getAllUsers = asyncHandler( async(req, res) => {
    const users = await User.find().select('-password').lean()  // .lean() used to return in JSON form

    if(!users?.length) {
        return res.status(400).json({message: "No Users Found"})
    }

    res.json(users)
})

// Create new user in DB
const createNewUser = asyncHandler( async(req, res) => {
    const {username, password, roles} = req.body;

    if(!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({message: 'All fields are required'})
    }

    const duplicate = await User.findOne({username}).lean().exec()

    if(duplicate) {
        return res.status(409).json({message: 'Username already exists'})
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const userObject = {username, "password": hashPassword, roles}

    const user = await User.create(userObject)

    if(user) {
        res.status(201).json({message: 'New User created successfully'})
    }

    else {
        res.status(400).json({message: 'Invalid User data Received'})
    }
})

// Update a user in DB
const updateUser = asyncHandler( async(req, res) => {
    const {id, username, password, roles, active} = req.body

    // Confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({message: 'Please fill all fields: It is required'})
    }

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({message: 'User Not Found'})
    }

    //Check for duplicate
    const duplicate = await User.findOne({username}).lean().exec()
    
    // Allow updates to original user
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({message: "Duplicate Username"})
    }

    user.username = username
    user.roles = roles
    user.active = active

    if(password) {
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()

    res.json({message: `${updatedUser.username} updated successfully`})
})

// Delete a user in DB
const deleteUser = asyncHandler( async(req, res) => {
    const {id} = req.body

    if(!id) {
        res.status(400).json({message: "User ID Required"})
    }

    const note = await Note.findOne({user: id}).lean().exec()
    if(note) {
        return res.status(400).json({message: "User has assigned notes"})
    }

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({message: "User Not Found"})
    }

    const result = await user.deleteOne();
    const reply = `Username ${result.username} with ID ${result.id} deleted successfully`
    
    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}