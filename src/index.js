const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require ('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const appPublicPath = path.join(__dirname, '../public')

app.use(express.static(appPublicPath))

io.on('connection', (socket) => {
  console.log('New Websocket connection')

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room})

    if (error) {
      return callback(error)
    }

    socket.join(user.room)

    //envía el mensaje sólo al usuario que se conectó
    socket.emit('bienvenida', generateMessage('Admin', `Bienvenido ${username}, dejanos un mensaje`))
    //envía el mensaje a todos los usuarios excepto al que se conectó
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${username} se acaba de conectar al canal ${room}`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback()
  })

  socket.on('message', (mensaje, callback) => {
    const user = getUser(socket.id)
    const filter = new Filter()

    if (filter.isProfane(mensaje)){
      return callback('Sin malas palabras!')
    }
    io.to(user.room).emit('message', generateMessage(user.username, mensaje))
    callback('Enviado')
  })
  // envia a todos los usuarios el mensaje de que un usuario se desconectó
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user){
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} se desconectó...`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q+${coords.latitude},${coords.longitude}`) )
    callback()
  })
})


server.listen(port, () => {
  console.log(`Tenemos servidor en el puerto ${port}`)
})