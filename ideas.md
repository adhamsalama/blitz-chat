# private rooms

# index user count

# friends

# 1:1 chat between friends

// Commands sent from room creator
api.post('/admin-command', async (req, res) => {
    let room = req.body.room
    let command = req.body.command
    let user = req.body.user
    Room.findOne({ name: room, creator: req.user.username }, async (err, room) => {
        if (err) {
            res.sendStatus(403)
            return
        }
        if (room) {
            console.log('this room', room, room.name)
            if (command == 'add') {
                // Username already in list
                if (room.users.indexOf(user) < 0) {
                        res.json({message: 'user already in list'})
                        return;
                    }
                // Username not in list
                else {
                    // Check if username is valid
                    let userToBeAdded = await User.findOne({username: user})
                    console.log(userToBeAdded)
                    res.json({message: 'ay'})
                }
            }

        }
    
    
    })
})


document.querySelector('.admin-control').addEventListener('submit', e => {
    e.preventDefault()
    let commandList = document.querySelector('.command').value.split(' ')
    console.log(commandList)
    axios.post('/api/admin-command', {
        room: location.pathname.split('/')[2],
        command: commandList[0],
        username: commandList[1]
    })
    .then(res => console.log(res))
})
