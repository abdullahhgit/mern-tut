require ('dotenv').config()
const express = require('express');
const app = express();
const path = require('path');
// const {logger} = require('./middleware/logger');
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const {logger, logEvents} = require('./middleware/logger')

const PORT = process.env.PORT || 3500;

console.log(process.env.NODE_ENV);

connectDB()

app.use(logger); // [logger in logger.js] Custom middleware that tracks the time and date and path where the User request on website.

app.use(express.json());    // [express.json()] Built-in Middleware to make sure that your app accepts JSON data.

app.use('/', express.static(path.join(__dirname, 'public'))); // [express.static()] Built-in Middleware for getting static file in your project.

app.use('/', require('./routes/root'))

app.all('*', (req, res) => {    // if user enters invalid path returns 404 thriugh this method.
    res.status(404);
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    }

    else if(req.accepts('json')) {
        res.json({message : "404 Not Found"})
    }

    else {
        res.type('text').send("404 Not Found")
    }
})

mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB Successfully");
    app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));
})

mongoose.connection.on('error', err => {
    console.log(err);
})

// app.get('/', (req, res) => res.send("Hello Mern Project"));