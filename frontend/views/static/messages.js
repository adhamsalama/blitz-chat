function outputChatMessage(message, currentUsername) {
    const chat = document.querySelector('#chat')

    // Format Markdown to HTML
    // const converter = new showdown.Converter()
    // message.msg = converter.makeHtml(message.msg)

    // This user sent it
    if (message.username == currentUsername) {
        chat.innerHTML += `<div class="alert alert-success text-end" role="alert">
                <a href="https://blitzchatapp.herokuapp.com/users/${message.username}">Me</a> - ${new Date(message.date).toLocaleString()}
                <br>
                ${DOMPurify.sanitize(marked(message.msg), {USE_PROFILES: {html: true}})}
            </div>`
    }
    else {
        chat.innerHTML += `<div class="alert alert-primary text-start" role="alert">
                <a href="https://blitzchatapp.herokuapp.com/users/${message.username}">${message.username}</a> - ${new Date(message.date).toLocaleString()}
                <br>
                ${DOMPurify.sanitize(marked(message.msg), {USE_PROFILES: {html: true}})}
            </div>`
    
    }
    chat.scrollTop = chat.scrollHeight
}

function outputServerMessage(msg) {
    const chat = document.querySelector('#chat')
    chat.innerHTML += `<div class="alert alert-info text-center" role="alert">
            ${msg}
        </div>`
    chat.scrollTop = chat.scrollHeight
}

function formatMessage(username, msg) {
    return {
        username: username,
        msg: msg,
        date: new Date().toUTCString()
    }
}

