//The array of all users.
const users = [];

//Functions for adding & removing users, getting a user and getting an array of users in a given room.
//Emphasis on validation of results to prevent future errors. 

const addUser = ({id, username, room}) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    }) 

    //Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    //Store the user
    const user = { id: id, username: username, room: room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    //Finds the index in users of the user with the given id. (-1) if there is no match
    const index = users.findIndex((user) => {
        return user.id === id
    })


    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}
const getUser = (id) => {
    return users.find((user) => {
        return user.id === id
    })
}

const getUsersInRoom = (room) => {
    //array.filter() -> Filters through the array users and only keeps what satisfys the test provided.
    room = room.trim().toLowerCase() 
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
