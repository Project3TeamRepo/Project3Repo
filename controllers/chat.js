module.exports = function(app, passport) {

    const chatService = require('../services/chatService.js');

    // Gets User ID from session.
    //
    // getUserId :: Request -> Promise[Either[String, Integer]]
    async function getUserId(req) {
        if(req && req.user && req.user.userId) {
            console.log("User found in session scope");
            return { userId: req.user.userId };
        } else {
            console.warn("User not found in session scope. Session is expired or user has not logged in");
            return { error: "User not logged in" };
        }
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
    app.get("/members", passport.authenticate('jwt', {session: false}), async function(req, res) {
      try {
        const { members, error } = await chatService.listAllMembers();
        if(!error) {
          console.log("About to respond with members");
          res.status(200)
            .json({ members: members });
        } else {
          console.error("Error requesting member list: " + JSON.stringify(error));
          res.status(500)
            .json({ error: "Could not retrieve member list" });
        }
      } catch (error) {
        console.error("Error requesting member list: " + JSON.stringify(error));
        res.status(500)
          .json({ error: "Could not retrieve member list" });
      }
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
    app.get("/chats", passport.authenticate('jwt', {session: false}), async function(req, res) {
      try {
        const { userId, error } = await getUserId(req);
        if(!error && userId) {
          const { chatRooms, error } = await chatService.listAllChatRooms(userId);
          if(!error && chatRooms) {
            res.status(200)
               .json({chatRooms: chatRooms});
          } else {
            console.error("Could not retrieve the list of chat rooms: " + JSON.stringify(error));
            res.status(500)
               .json({error: "Could not retrieve the list of chat rooms available"});
          }
        } else {
          console.warn("User not found in session: " + error);
          res.status(401)
             .json({error: "User not found in session"});
        }
      } catch (error) {
        console.error(error.stack);
        res.status(500)
           .json({error: "Error while processing the request: " + error});

      }
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
    app.post("/chats", passport.authenticate('jwt', {session: false}), async function(req, res) {

      try {
        console.log("Attempting to create chat room " + req.body.name + " for user " + req.user.userId);
        const { userId, error } = await getUserId(req);
        if(!error && userId) {
          if(req.params && isNonEmptyString(req.body.name)) {
            const { chatRoom, error } = await chatService.createChatRoom(userId, req.body.name, req.body.description, req.body.members);
            if(!error && chatRoom) {
              res.setHeader('Location', '/chats/' + chatRoom.chat_room_id + '/');
              res.status(201)
                .json({});
            } else {
              console.log("Error while creating chat room: Unable to process request");
              res.status(500)
                .json({error: "Unable to create chat room"});
            }
          } else {
            console.log("No name provided in request");
            res.status(400)
              .json({error: "No name provided", fields: ['name']});
          }
        } else {
          console.warn("User not found in session: " + error);
          res.status(401)
            .json({error: "User not found in session"});
        }
      } catch (error) {
        console.error(error.stack);
        console.error("Error while creating chat room: " + JSON.stringify(error));
        res.status(500)
          .json({error: "Unable to create chat room"});
      }
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
    app.delete("/chats/:chatRoom", passport.authenticate('jwt', {session: false}), async function(req, res) {
      try {
        const { userId, error } = await getUserId(req);
        if(!error && userId) {
          if(req.params && isNonEmptyString(req.params.chatRoom) && !isNaN(req.params.chatRoom)) {
            const { error } = await chatService.closeChatRoom(userId, req.params.chatRoom);
            if(!error) {
              res.status(200)
                 .json({});
            } else {
              console.log("Error while deleting chat room: " + JSON.stringify(error));
              res.status(500)
                .json({error: "Unable to delete chat room"});
            }
          } else {
            console.log("No chat room provided in request");
            res.status(400)
              .json({error: "Invalid chat room provided", fields: ['chatRoom']});
          }
        } else {
          console.warn("User not found in session: " + error);
          res.status(401)
            .json({error: "User not found in session"});
        }
      } catch(error) {
        console.error(error.stack);
        res.status(500)
          .json({error: "Unable to process request: " + error});
      }
        getUserId(req).then(
            userId => {
            }).catch(
            error => {
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
    app.get("/chats/:chatRoom", passport.authenticate('jwt', {session: false}), async function(req, res) {
      try {
        const { userId, error } = await getUserId(req);

        if(!error && userId) {
          if(req.params && isNonEmptyString(req.params.chatRoom) && !isNaN(req.params.chatRoom)) {
            const { chatRoomInfo, error } = await chatService.getChatRoomInformation(userId, req.params.chatRoom);
            if(!error && chatRoomInfo) {
              res.status(200)
                 .json(chatRoomInfo);
            } else {
              const message = (error) ? error : "Error while retrieving information from chat room";
              console.error(message);
              res.status(500)
                 .json({ error: message });
            }
          } else {
            console.log("No chat room provided in request");
            res.status(400)
              .json({error: "Invalid chat room provided", fields: ['chatRoom']});
          }

        } else {
          console.warn("User not found in session: " + error);
          res.status(401)
            .json({error: "User not found in session"});
        }
      } catch(error) {
        console.error(error.stack);
        res.status(500)
           .json({error: "Unable to retrieve messages from chat room"});
      }
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
    app.get("/chats/:chatRoom/messages", passport.authenticate('jwt', {session: false}), async function(req, res) {

      try {
        const { userId, error } = await getUserId(req);
        if(!error && userId) {
          if(req.params && isNonEmptyString(req.params.chatRoom) && !isNaN(req.params.chatRoom)) {
            let messageCount = undefined;
            if(req.query && req.query.messages && !isNaN(req.query.messages) && req.query.messages > 0) {
              messageCount = req.query.messages;
            }

            const { messages, error } = await chatService.getMessages(userId, req.params.chatRoom, messageCount);

            if(!error && messages) {
              res.status(200)
                 .json({messages: messages});
            } else {
              const message = (error) ? error : "Error while retrieving messages from chat room";
              console.error(message);
              res.status(500)
                 .json({ error: message });
            }
          } else {
            console.log("No chat room provided in request");
            res.status(400)
              .json({error: "Invalid chat room provided", fields: ['chatRoom']});
          }
        } else {
          console.log("User not found in session: " + error);
          res.status(401)
             .json({error: "User not found in session"});
        }
      } catch(error) {
        console.error(error);
        res.status(500)
           .json({ error: "Error while retrieving messages from chat room: " + error });
      }
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
    app.post("/chats/:chatRoom/messages", passport.authenticate('jwt', {session: false}), async function(req, res) {

      try {
        const { userId, error } = await getUserId(req);

        if(!error && userId) {
          if(req.params && isNonEmptyString(req.params.chatRoom) && !isNaN(req.params.chatRoom)) {
            if(req.body && isNonEmptyString(req.body.messageText)) {

              const { message, error } = await chatService.postMessageInRoom(userId, req.params.chatRoom, req.body.messageText);

              if(!error && message) {
                res.status(200)
                   .json({});
              } else {
                const message = (error) ? error : "Error while posting message in chat room";
                console.error(message);
                res.status(500)
                  .json({ error: message });
              }
            }
            else {
              console.log("No message text provided in request");
              res.status(400)
                .json({error: "Invalid message text provided", fields: ['messageText']});
            }
          }
          else {
            console.log("No chat room provided in request");
            res.status(400)
              .json({error: "Invalid chat room provided", fields: ['chatRoom']});
          }
        } else {
          console.log("User not found in session: " + error);
          res.status(401)
            .json({error: "User not found in session"});
        }
      } catch(error) {
        console.error(error);
        res.status(500)
           .json({ error: "Error while retrieving messages from chat room: " + error });
      }
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
    app.put("/chats/:chatRoom", passport.authenticate('jwt', {session: false}), async function(req, res) {

      try {
        const { userId, error } = await getUserId(req);

        if(!error && userId) {
          if(req.params && isNonEmptyString(req.params.chatRoom) && !isNaN(req.params.chatRoom)) {
            if(req.body && req.body.members) {
              await chatService.updateChatRoomMembers(userId, req.params.chatRoom, req.body.members);
              res.status(200).json({});
            } else {
              console.log("No members provided in request");
              res.status(400)
                .json({error: "Invalid member list provided", fields: ['members']});
            }
          } else {
            console.log("No chat room provided in request");
            res.status(400)
              .json({error: "Invalid chat room provided", fields: ['chatRoom']});
          }
        } else {
          console.log("User not found in session: " + error);
          res.status(401)
            .json({error: "User not found in session"});
        }
      } catch(error) {
        console.error(error.stack);
        res.status(500)
           .json({error: "Unable to post message in chat room"});
      }
    });

};