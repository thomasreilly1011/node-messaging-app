//FOR REVISION
const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
//Destructures username and room from the query string sent by the join form
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visisbleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visisbleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

//Runs when the server calls the 'message' event 
socket.on('message', (message) => {
    //Renders the message by sending it to the messageTemplate
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

//Runs when the server calls the 'locationMessage' event
socket.on('locationMessage', (message) => {
    //Renders the message by sending it to the locationMessageTemplate
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    
    document.querySelector('#sidebar').innerHTML = html
})

//Runs when the submit button is clicked on the message form
$messageForm.addEventListener('submit', (e) => {
    //Prevents the page from refreshing with the form data as default.
    e.preventDefault()

    $messageFormButton.setAttribute("disabled", 'disabled')

    const message = e.target.elements.message.value

    //Calls the sendMessage event
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute("disabled")
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

//Runs when the location button is clicked
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute("disabled", 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => { //The acknowlegement function. Runs when its been sucessfully called
            $sendLocationButton.removeAttribute("disabled")
            console.log('Location shared!')  
        })
    })
})

//Sends the username and room to the server 
socket.emit('join', {username, room}, (error) => {
    alert(error)
    location.href = '/'
})
