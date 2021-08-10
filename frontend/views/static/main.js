(async () => {
    const socket = io()
    const username = (await axios.get('/api/getCurrentUser')).data.username
    const room = location.pathname.split('/')[2]
    socket.emit('joinRoom', {username: username, room: room})
    socket.username = username
    socket.on('serverMessage', msg => outputServerMessage(msg))
    socket.on('chatMessage', message => {
        outputChatMessage(message, username)
    })
    socket.on('getRoomMessages', messages => {
        messages.forEach(message => outputChatMessage(message, username))
    })
    // Get and display users list
    socket.on('sendUsers', usernames => {
        let list = ''
        usernames.forEach(username => {
            list += `<li class="list-group-item">${username}</li>`
        })
        document.querySelector('#users').innerHTML = list
        
    })
    const chatForm = document.querySelector('#chat-form')
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const msg = e.target.elements.chatMessage.value;

        // Emit message to server
        socket.emit('chatMessage', formatMessage(username, msg), room)
        e.target.elements.chatMessage.value = ''
        e.target.elements.chatMessage.focus()
    })
})()