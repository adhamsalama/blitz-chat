let form = document.querySelector("#search-form");
form.onsubmit = () => false;

let searchField = document.querySelector("#search-public-rooms");
searchField.oninput = () => {
    searchPublicRooms(searchField.value)
}

function searchPublicRooms(roomName) {
    axios.get(`http://127.0.0.1:3000/api/rooms/search?q=${roomName}`).then(rooms => {
        // Display Rooms
        let newRooms = ''
        rooms.data.forEach(room => {
            newRooms += `<div class="card text-center m-1" style="display: inline-block;">
                            <h5 class="card-header">
                                ${room.name}
                            </h5>
                            <div class="card-body">
                                <p class="card-text">
                                    ${room.description}
                                </p>
                                <a href="/rooms/${room.name}" class="btn btn-primary">Join Room</a>
                            </div>
                        </div>`
        })
        document.querySelector('#public-rooms').innerHTML = newRooms
    })
}