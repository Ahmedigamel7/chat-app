const { search_username } = require("../models/user.model");



exports.manage_search = (socket) => {

        socket.on('getUserByUsername', data => {
            console.log('\ngetUserByUsername data', data, "\n")
            search_username(data).then(users => {
                socket.emit('userData', users); 
            }).catch(err => {
                console.log("manage_search error", err);
            })
        })
}