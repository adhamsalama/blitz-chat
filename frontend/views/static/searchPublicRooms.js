
let form = document.querySelector("#search-form");
form.onsubmit = () => false;

let searchField = document.querySelector("#search-public-rooms");
searchField.oninput = (input) => {
    // Search passwords only when entering characters, numbers, symbols
    // or deleting a character by pressing backspace
    axios.get(`http://127.0.0.1:3000/api/rooms/search?q=${searchField.value}`).then(rooms => {
        // Display Rooms
        console.log(rooms.data)
        let newRooms = ''
        rooms.data.forEach(room => {
            console.log(room)
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
        document.querySelector('.rooms').innerHTML = newRooms
    })
}