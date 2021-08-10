function outputChatMessage(message, currentUsername) {
    const chat = document.querySelector('#chat')

    // Format Markdown to HTML
    // const converter = new showdown.Converter()
    // message.msg = converter.makeHtml(message.msg)

    // This user sent it
    if (message.username == currentUsername) {
        chat.innerHTML += `<div class="alert alert-success text-end" role="alert">
                Me - ${message.date}
                <br>
                ${message.msg}
            </div>`
    }
    else {
        chat.innerHTML += `<div class="alert alert-primary" role="alert">
                ${message.username} - ${message.date}
                <br>
                ${message.msg}
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
        date: new Date().toJSON()
    }
}

