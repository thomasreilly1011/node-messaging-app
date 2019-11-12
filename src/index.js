//Npm modules to include
const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
//Other js files to include
const {generateMessage, generateLocationMessage} = require('./utils/messages.js')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users.js')

const app = express()//Sets up your express server in "app"
const server = http.createServer(app)//Sets up a http server in "server"
const io = socketio(server)//Sets up a socket server in "io"

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

//Runs when a connection is made to the socket server
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    //Runs when a client calls the 'join' event
    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit("message", generateMessage('God', "Welcome!"))
        socket.broadcast.to(user.room).emit('message', generateMessage('God', `${user.username} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    })

    //Runs when a client calls the 'sendMessage' event
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit("message", generateMessage(user.username, message))

        callback()

    })

    //Runs when a client calls the 'sendLocation' event
    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        var lat = location.latitude
        var long = location.longitude
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${lat},${long}`))
        
        callback()
    })

    //Runs when a client calls the 'disconnect' event
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('God' `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })
})

//Once all the above functions are compiled, make the server available on the given port.
server.listen(port, () => {
    console.log("Server is up on port " + port)
})