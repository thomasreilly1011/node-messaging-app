const generateMessage = (username, text) => {
    return {
        username,
        text
    }
}

const generateLocationMessage = (username, url) => {
    return {
        username,
        url
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}