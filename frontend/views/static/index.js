document.querySelector('#create-room').addEventListener('submit', e => {
    e.preventDefault()
    let name = document.querySelector('#room-name')
    let type = document.querySelector('#room-type')
    let description = document.querySelector('#room-description')
    let tags = document.querySelector('#room-tags')
    axios.post('http://127.0.0.1:3000/api/rooms', {
        name: name.value,
        type: type.value,
        description: description.value,
        tags: tags.value.split(',')
    },
        { withCredentials: true })
        .then(res => {
            alert(res.data)
            searchPublicRooms('')
        })
        .catch(err => {
            console.log(err.response)
            if (err.response.status == 409)
                alert('Room name already taken.')
        })
})

// Get and display user rooms
axios.get('http://127.0.0.1:3000/api/user-rooms', { withCredentials: true })
    .then(res => {
        document.querySelector('#user-rooms').innerHTML = displayRooms(res.data.rooms)
    })

// Get and display joined rooms
axios.get('http://127.0.0.1:3000/api/joined-rooms', { withCredentials: true })
    .then(res => {
        document.querySelector('#joined-rooms').innerHTML = displayRooms(res.data.rooms)
    })

// Get and display public rooms
axios.get('http://127.0.0.1:3000/api/rooms', { withCredentials: true })
    .then(res => {
        document.querySelector('#public-rooms').innerHTML = displayRooms(res.data.rooms)
    })


function displayRooms(rooms) {
    let html = ''
    if (rooms.length < 1)
        return '<h2>No rooms</h2>'
    rooms.forEach(room => {

        html += `<div class="card text-center m-1" style="display: inline-block;">
                <h5 class="card-header">
                    ${room.name}
                </h5>
                <div class="card-body">
                    <p class="card-text">
                        ${room.description}
                        <br>
                            Room type: ${room.type}
                    </p>
                        <div>
                            ${displayTags(room.tags)}
                        </div>
                        <a href="/rooms/${room.name}" class="btn btn-primary mt-2">Join Room</a>
                </div>
                </div>`
    })
    return html
}

function displayTags(tags) {
    let html = ''
    tags.forEach(tag => {
        html += `<span class="badge rounded-pill bg-primary">${tag}</span>`
    })
    return html
}
