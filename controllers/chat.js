module.exports = function(app) {

    const chatService = require('../services/chatService.js');

    // Gets User ID from session.
    //
    // getUserId :: Request -> Promise[Integer, String] 
    function getUserId(req) {
        return new Promise((resolve, reject) => {
            if(req && req.user && req.user.userId) {
                resolve(req.user.userId);
            } else {
                reject("User not logged in");
            }
        });
    }

    // Checks if a provided value is a String and it's not empty.
    //
    // isNonEmptyString :: Any -> Boolean 
    function isNonEmptyString(value) {
        return (typeof value === 'string' || value instanceof String) && value !== "";
    }

    // GET /members
    // ------------
    //
    // Expects no input params
    // Returns:
    //          MIME-Type: Application/JSON
    //          JSON Structure: { members: [{user_id, User_Name}], error: String}
    //
    //          200 -> Member List found
    //          500 -> Error while retrieving Member List
    //
    app.get("/members", passport.authenticate('jwt', {session: false}), function(req, res) {
        chatService.listAllMembers().then(
            members => {
                res.status(200)
                   .setHeader('Content-Type', 'application/json')
                   .json({members: members});
            },
            error => {
                console.error("Error requesting member list: " + JSON.stringify(error));
                res.status(500)
                   .setHeader('Content-Type', 'application/json')
                   .json({error: "Could not retrieve member list"});
            }
        );
    });

    // GET /chats
    // ------------
    //
    // Input params:
    //          UserId: Member requesting the list of chat rooms (session).
    // Returns:
    //          The list of all chat rooms associated to the logged in member.
    //
    //          MIME-Type: Application/JSON
    //          JSON Structure: { chatRooms: [{chat_room_id, chat_room_name, chat_room_description}], error: String}
    //
    //          200 -> Member List found
    //          401 -> Member not logged in
    //          500 -> Error while retrieving Member List
    //
    app.get("/chats", passport.authenticate('jwt', {session: false}), function(req, res) {
        getUserId(req).then(
            userId => {
                chatService.listAllChatRooms(userId).then(
                    chatRooms => {
                        res.status(200)
                           .setHeader('Content-Type', 'application/json')
                           .json({chatRooms: chatRooms});
                    },
                    error => {
                        console.error("Could not retrieve the list of chat rooms: " + JSON.stringify(error));
                        res.status(500)
                           .setHeader('Content-Type', 'application/json')
                           .json({error: "Could not retrieve the list of chat rooms available"});
                    }
                );
            },
            error => {
                console.log("User not found in session: " + error);
                res.status(401)
                   .setHeader('Content-Type', 'application/json')
                   .json({error: "User not found in session"});
            }
        );
    });

    // POST /chats
    // ------------
    //
    // Input params:
    //          UserId: Member creating a chat room (session).
    //          Chat room name: Name for the chat room (Body's name attribute)
    //          Chat room description (optional): Description for the chat room (Body's description attribute)
    //          Chat room members (optional): List of user ids that will be part of this chat room (Body's members attribute)
    // Returns:
    //          A reference to the newly created chat room (in Location header) and empty body.
    //
    //          MIME-Type: Application/JSON
    //          JSON Structure: {error: String, fields: [String]}
    //
    //          201 -> Chat room created (Link in 'Location' header)
    //          400 -> Bad Request parameter (input values failed validation). Fields listed in 'fields' element.
    //          401 -> Member not logged in
    //          500 -> Error while retrieving Member List
    //
    app.post("/chats", passport.authenticate('jwt', {session: false}), function(req, res) {
        getUserId(req).then(
            userId => {
                if(req.params && isNonEmptyString(req.body.name)) {
                    chatService.createChatRoom(userId, req.body.name, req.body.description, req.body.members).then(
                        chatRoom => {
                            res.status(201)
                               .setHeader('Content-Type', 'application/json')
                               .setHeader('Location', '/chats/' + chatRoom + '/')
                               .json({});                    
                        },
                        error => {
                            console.log("Error while creating chat room: " + JSON.stringify(error));
                            res.status(500)
                               .setHeader('Content-Type', 'application/json')
                               .json({error: "Unable to create chat room"});
                        }
                    );
                } else {
                    console.log("No name provided in request");
                    res.status(400)
                       .setHeader('Content-Type', 'application/json')
                       .json({error: "No name provided", fields: ['name']});
                }
            },
            error => {
                console.log("User not found in session: " + error);
                res.status(401)
                   .setHeader('Content-Type', 'application/json')
                   .json({error: "User not found in session"});
            }
        );
    });

    // Close an existing chat room
    //
    // DELETE /chats/:chatRoom
    // -----------------------
    //
    // Input params:
    //          UserId: Member creating a chat room (session).
    //          chatRoom: Chat room identifier (path variable)
    // Returns:
    //          Empty response if deletion is successful.
    //
    //          MIME-Type: Application/JSON
    //          JSON Structure: {error: String, fields: [String]}
    //
    //          200 -> Chat room deleted
    //          400 -> Bad Request parameter (input values failed validation). Fields listed in 'fields' element.
    //          401 -> Member not logged in
    //          500 -> Error while trying to delete the chat room
    //
    app.delete("/chats/:chatRoom", passport.authenticate('jwt', {session: false}), function(req, res) {
        getUserId(req).then(
            userId => {
                if(req.params && isNonEmptyString(req.params.chatRoom) && !isNaN(req.params.chatRoom)) {
                    chatService.closeChatRoom(userId, req.params.chatRoom).then(
                        () => {
                            res.status(200)
                               .setHeader('Content-Type', 'application/json')
                               .json({});                    
                        },
                        error => {
                            console.log("Error while creating chat room: " + JSON.stringify(error));
                            res.status(500)
                               .setHeader('Content-Type', 'application/json')
                               .json({error: "Unable to create chat room"});
                        }
                    );
                } else {
                    console.log("No chat room provided in request");
                    res.status(400)
                       .setHeader('Content-Type', 'application/json')
                       .json({error: "Invalid chat room provided", fields: ['chatRoom']});
                }            
            },
            error => {
                console.log("User not found in session: " + error);
                res.status(401)
                   .setHeader('Content-Type', 'application/json')
                   .json({error: "User not found in session"});
            }
        );
    });

    
    // Get chat room information
    //
    // GET /chats/:chatRoom
    // --------------------
    //
    // Input params:
    //          UserId: Member creating a chat room (session).
    //          chatRoom: Chat room identifier (path variable)
    //          
    // Returns:
    //          Chat room information.
    //
    //          MIME-Type: Application/JSON
    //          JSON Structure: {error: String, fields: [String]}
    //
    //          200 -> List of Chat Room messages
    //          400 -> Bad Request parameter (input values failed validation). Fields listed in 'fields' element.
    //          401 -> Member not logged in
    //          500 -> Error while trying to retrieve messages from chat room
    //
    app.get("/chats/:chatRoom", passport.authenticate('jwt', {session: false}), function(req, res) {
        getUserId(req).then(
            userId => {
                if(req.params && isNonEmptyString(req.params.chatRoom) && !isNaN(req.params.chatRoom)) {
                    chatService.getChatRoomInformation(userId, req.params.chatRoom).then(
                        chatRoomInfo => {
                            res.status(200)
                               .setHeader('Content-Type', 'application/json')
                               .json(chatRoomInfo);                    
                        },
                        error => {
                            console.log("Error while retrieving messages from chat room: " + JSON.stringify(error));
                            res.status(500)
                               .setHeader('Content-Type', 'application/json')
                               .json({error: "Unable to retrieve messages from chat room"});
                            }
                    );
                } else {
                    console.log("No chat room provided in request");
                    res.status(400)
                       .setHeader('Content-Type', 'application/json')
                       .json({error: "Invalid chat room provided", fields: ['chatRoom']});
                }            
            },
            error => {
                console.log("User not found in session: " + error);
                res.status(401)
                   .setHeader('Content-Type', 'application/json')
                   .json({error: "User not found in session"});
            }
        );
    });

    // Get all messages from an especific chat room
    //
    // GET /chats/:chatRoom/messages
    // -----------------------------
    //
    // Input params:
    //          UserId: Member creating a chat room (session).
    //          chatRoom: Chat room identifier (path variable)
    //          messages: Last number of messages to return (request parameter). Integer (optional).
    //          
    // Returns:
    //          List of messages posted in the chat room.
    //
    //          MIME-Type: Application/JSON
    //          JSON Structure: {error: String, fields: [String]}
    //
    //          200 -> List of Chat Room messages
    //          400 -> Bad Request parameter (input values failed validation). Fields listed in 'fields' element.
    //          401 -> Member not logged in
    //          500 -> Error while trying to retrieve messages from chat room
    //
    app.get("/chats/:chatRoom/messages", passport.authenticate('jwt', {session: false}), function(req, res) {
        getUserId(req).then(
            userId => {
                if(req.params && isNonEmptyString(req.params.chatRoom) && !isNaN(req.params.chatRoom)) {
                    let messageCount = undefined;
                    if(req.query && req.query.messages && !isNaN(req.query.messages) && req.query.messages > 0) {
                        messageCount = req.query.messages;
                    } 
                    chatService.getMessages(userId, req.params.chatRoom, messageCount).then(
                        messages => {
                            res.status(200)
                               .setHeader('Content-Type', 'application/json')
                               .json({messages: messages});                    
                        },
                        error => {
                            console.log("Error while retrieving messages from chat room: " + JSON.stringify(error));
                            res.status(500)
                               .setHeader('Content-Type', 'application/json')
                               .json({error: "Unable to retrieve messages from chat room"});
                            }
                    );
                } else {
                    console.log("No chat room provided in request");
                    res.status(400)
                       .setHeader('Content-Type', 'application/json')
                       .json({error: "Invalid chat room provided", fields: ['chatRoom']});
                }            
            },
            error => {
                console.log("User not found in session: " + error);
                res.status(401)
                   .setHeader('Content-Type', 'application/json')
                   .json({error: "User not found in session"});
            }
        );
    });

    // Send a message to an especific chat room
    //
    // POST /chats/:chatRoom/messages
    // ------------------------------
    //
    // Input params:
    //          UserId: Member creating a chat room (session).
    //          chatRoom: Chat room identifier (path variable)
    //          messageText: Message to send (body attribute).
    //          
    // Returns:
    //          Empty response if successful.
    //
    //          MIME-Type: Application/JSON
    //          JSON Structure: {error: String, fields: [String]}
    //
    //          200 -> Message posted
    //          400 -> Bad Request parameter (input values failed validation). Fields listed in 'fields' element.
    //          401 -> Member not logged in
    //          500 -> Error while trying to post messages to chat room
    //
    app.post("/chats/:chatRoom/messages", passport.authenticate('jwt', {session: false}), function(req, res) {
        getUserId(req).then(
            userId => {
                if(req.params && isNonEmptyString(req.params.chatRoom) && !isNaN(req.params.chatRoom)) {
                    if(req.body && isNonEmptyString(req.body.messageText)) {
                        chatService.postMessageInRoom(userId, req.params.chatRoom, req.body.messageText).then(
                            () => {
                                res.status(200)
                                .setHeader('Content-Type', 'application/json')
                                .json({});                     
                            },
                            error => {
                                console.log("Error while posting message in chat room: " + JSON.stringify(error));
                                res.status(500)
                                   .setHeader('Content-Type', 'application/json')
                                   .json({error: "Unable to post message in chat room"});
                            }
                        );
                    }
                    else {
                        console.log("No message text provided in request");
                        res.status(400)
                           .setHeader('Content-Type', 'application/json')
                           .json({error: "Invalid message text provided", fields: ['messageText']});    
                    }
                } 
                else {
                    console.log("No chat room provided in request");
                    res.status(400)
                       .setHeader('Content-Type', 'application/json')
                       .json({error: "Invalid chat room provided", fields: ['chatRoom']});
                }
            },
            error => {
                console.log("User not found in session: " + error);
                res.status(401)
                   .setHeader('Content-Type', 'application/json')
                   .json({error: "User not found in session"});
            }
        );
    });

    // Update chat room members
    //
    // PUT /chats/:chatRoom
    // --------------------
    //
    // Input params:
    //          UserId: Member creating a chat room (session).
    //          chatRoom: Chat room identifier (path variable)
    //          members: Array of members for the group (body attribute).
    //          
    // Returns:
    //          Empty response if successful.
    //
    //          MIME-Type: Application/JSON
    //          JSON Structure: {error: String, fields: [String]}
    //
    //          200 -> Message posted
    //          400 -> Bad Request parameter (input values failed validation). Fields listed in 'fields' element.
    //          401 -> Member not logged in
    //          500 -> Error while trying to post messages to chat room
    //
    app.put("/chats/:chatRoom", passport.authenticate('jwt', {session: false}), function(req, res) {
        getUserId(req).then(
            userId => {
                if(req.params && isNonEmptyString(req.params.chatRoom) && !isNaN(req.params.chatRoom)) {
                    if(req.body && req.body.members) {
                        chatService.updateChatRoomMembers(userId, req.params.chatRoom, req.body.members).then(
                            () => {
                                res.status(200)
                                .setHeader('Content-Type', 'application/json')
                                .json({});                     
                            },
                            error => {
                                console.log("Error while updating chat room member list: " + JSON.stringify(error));
                                res.status(500)
                                   .setHeader('Content-Type', 'application/json')
                                   .json({error: "Unable to post message in chat room"});
                            }
                        );
                    }
                    else {
                        console.log("No members provided in request");
                        res.status(400)
                           .setHeader('Content-Type', 'application/json')
                           .json({error: "Invalid member list provided", fields: ['members']});    
                    }
                } 
                else {
                    console.log("No chat room provided in request");
                    res.status(400)
                       .setHeader('Content-Type', 'application/json')
                       .json({error: "Invalid chat room provided", fields: ['chatRoom']});
                }
            },
            error => {
                console.log("User not found in session: " + error);
                res.status(401)
                   .setHeader('Content-Type', 'application/json')
                   .json({error: "User not found in session"});
            }
        );
    });

};