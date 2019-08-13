const users = []

const addUser = ({id, username, room}) => {
  //Clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  //Validate the data
  if (!username || !room) {
    return {
      error: 'Nombre de Usuario y Channel son requeridos'
    }
  }

  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username
  })

  //Validate username
  if (existingUser) {
    return {
      error: 'El usuario ya existe...'
    }
  }

  //Store User
  const user = { id, username, room }
  
  users.push(user)
  return {user}
}

//Borrar usuario
const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id
  })
  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

//Obtener usuario
const getUser = (id) => {
  return users.find((user) => {
    return user.id === id
  })
}

//Usuarios de un room
const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room)
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}