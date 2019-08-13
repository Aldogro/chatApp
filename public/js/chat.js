const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormBoton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('bienvenida', (bienvenida) => {
  document.querySelector('#display').innerHTML = `${bienvenida.username} dice: ${moment(bienvenida.createdAt).format('DD/MM/YYYY kk:mm')} - ${bienvenida.text}`
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  
  $messageFormBoton.setAttribute('disabled', 'disabled')
  
  const mensaje = e.target.elements.mensaje.value
  socket.emit('message', mensaje, (error) => {
    $messageFormBoton.removeAttribute('disabled')
    $messageFormInput.value = ``
    $messageFormInput.focus()
    if (error){
      return console.log(error)
    }
    console.log('Mensaje enviado!')
  })
})

$sendLocation.addEventListener('click', () => {
  if (!navigator.geolocation){
    return alert('No tenés geolocalización, croto')
  }
  $sendLocation.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    const {latitude, longitude } = position.coords
    const pos = {latitude, longitude}
    socket.emit('sendLocation', pos, () => {
      $sendLocation.removeAttribute('disabled')
    })
  })
})

const autoscroll = () => {
  //new message element
  const $newMessage = $messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseFloat(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  //Visible height
  const visibleHeight = $messages.offsetHeight + newMessageMargin
  
  //Height of messages container
  const containerHeight = $messages.scrollHeight
  
  //How far have i scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight
  
  if(containerHeight - newMessageHeight < scrollOffset) {
    console.log($newMessage.offsetHeight)
    $messages.scrollTop = $messages.scrollHeight
}
}

socket.on('message', (mensaje) => {
  const html = Mustache.render(messageTemplate, {
    username: mensaje.username,
    message: mensaje.text,
    createdAt: moment(mensaje.createdAt).format('DD/MM/YY - kk:mm')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('locationMessage', (message) => {
  console.log(message)
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('DD/MM/YY - kk:mm')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})

socket.on('positionSend', (message) => {
  console.log(message)
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(pos.createdAt).format('DD/MM/YYYY - kk:mm')
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})