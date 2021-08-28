(async () => {
    const socket = io()
    const username = (await axios.get('/api/getCurrentUser')).data.username
    const user = location.pathname.split('/')[2]
    socket.emit('joinUser', {firstUser: username, secondUser: user})
    socket.on('hi', () => console.log('useToUserHi'))
    socket.on('getRoomMessages', messages => {
        console.log(messages)
        messages.forEach(message => outputChatMessage(message, username))
    })
    socket.on('serverMessage', msg => outputServerMessage(msg))
    socket.on('userMessage', message => {
        console.log(message)
        outputChatMessage(message, username)
    })
    // socket.on('getRoomMessages', messages => {
    //     messages.forEach(message => outputChatMessage(message, username))
    // })

    const chatForm = document.querySelector('#chat-form')
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const msg = e.target.elements.chatMessage.value;

        // Emit message to server
        socket.emit('userMessage', formatMessage(username, msg))
        e.target.elements.chatMessage.value = ''
        e.target.elements.chatMessage.focus()
    })
})()

function formatUserMessage(sender, msg) {
    return {
        sender: sender,
        msg: msg
    }
}
