module.exports = function(app, sequelize, DataTypes) {

    const ChatRooms = require ('../models/chatroom.js')(sequelize, DataTypes);
    const Members = require('../models/members.js')(sequelize, DataTypes);    
    const Messages = require('../models/chatMessages.js')(sequelize, DataTypes);    

    // Get the list of available members
    app.get("/members", function(req, res) {
        Members.all().then(members => {
                            let result;
                            if(!members) {
                                result = "{members: []}";
                            } else {
                                result = "{members: " + JSON.stringify(members) + "}";
                            }
                            res.status(200).send(result);
                        }).catch(error => {
                            console.error("Error requesting members: " + error);
                            res.status(500).send('{error: "' + JSON.stringify(error) + '"}');
                        });
    });

  // Get the list of available chat rooms
  app.get("/chats", function(req, res) {
    ChatRooms.all().then(chatRooms => {
                        let result;
                        if(!chatRooms) {
                            result = "{chatRooms: []}";
                        } else {
                            result = "{chatRooms: " + JSON.stringify(chatRooms) + "}";
                        }
                        res.status(200).send(result);
                   }).catch(error => {
                        console.error("Error requesting chat rooms: " + error);
                        res.status(500).send('{error: ' + JSON.stringify(error) + '}');
                   });
    });

  // Create a new chat room
  app.post("/chats", function(req, res) {
    // creator, name, description
    if(req.body) {
        let creator = req.body.creator;
        let name = req.body.name;
        let description = req.body.description;
        if(creator && name) {
            Members.findById(creator).then(member => {
                                        if(member) {
                                            let chatRoom = ChatRooms.build({chat_room_name: name, chat_room_description: description, chat_room_creator: member});
                                            chatRoom.save().then(room => {
                                                            member.addChatrooms(room);
                                                            member.save();
                                                            room.addMembers(member);
                                                            room.save();
                                                            res.status(201)
                                                               .set('Location', '/chats/' + room.chat_room_id + "/")
                                                               .send('{}');
                                                           })
                                                           .catch(error => {
                                                            res.status(500)
                                                               .send('{error: ' + JSON.stringify(error) + '}');
                                                           });
                                        } else {
                                            res.status(400)
                                               .send('{error: "Invalid member reference"}');
                                        }
                                     })
                                     .catch(error => {
                                        res.status(400)
                                           .send('{error: "Invalid member reference"}');
                                     });
        } else {
            res.status(400)
               .send('{error: "Invalid request: Both a name and a creator are needed"}');
        }
    } else {
        res.status(400)
           .send('{error: "Invalid request: Both a name and a creator are needed"}');
    }
  });

  // Close an existing chat room
  app.delete("/chats/:chatRoom", function(req, res) {
    if(req.params.chatRoom && req.body) {
        let requestorId = req.body.memberId;
        let chatRoomId = req.params.chatRoom;
        if(requestorId) {
            ChatRooms.findById(chatRoomId).then(chatRoom => {
                                            if(chatRoom.chat_room_creator.member_id === requestorId) {
                                                chatRoom.members.forEach(member => {
                                                    member.setChatRooms(member.getChatRooms().filter(cr => cr.chat_room_id !== chatRoomId)).save();
                                                });
                                                chatRoom.destroy().then(() => {
                                                                    res.status(200).send('{}');
                                                                  }).catch(error => {
                                                                    res.status(500)
                                                                       .send('{error: ' + JSON.stringify(error) + ' }');
                                                                  });
                                            } else {
                                                res.status(401).send('{error: "Current user is not the chat room creator"}');
                                            }
                                          }).catch(error => {
                                            res.status(500).send('{error: "Could not find chat room: ' + JSON.stringify(error) + '"}');
                                          });
        } else {
            res.status(400)
               .send('{error: "Invalid request: Chat room identifier and owner are needed"}');
         }
    } else {
        res.status(400)
           .send('{error: "Invalid request: Chat room identifier and owner are needed"}');
    }
  });

  // Get all messages from an especific chat room
  app.get("/chats/:chatRoom", function(req, res) {
    if(req.params.chatRoom) {
        ChatRooms.findById(req.params.chatRoom).then(chatRoom => {
                                                res.status(200).send('{messages: ' + JSON.stringify(chatRoom.getMessages()) + '}');
                                               }).catch(error => {
                                                res.status(500).send('{error: ' + JSON.stringify(error) + '}');
                                               });
    } else {
        res.status(400)
           .send('{error: "Invalid request: Chat room identifier is needed"}');
    }
  });

  // Send a message to an especific chat room
  app.post("/chats/:chatRoom", function(req, res) {
    if(req.params.chatRoom && req.body && req.body.memberId && req.body.messageText) {
        ChatRooms.findById(req.params.chatRoom).then(chatRoom => {
                                                if(chatRoom.getMembers().filter(m => m.member_id === req.body.memberId).length === 1) {
                                                    Members.findById(req.body.memberId).then(member => {
                                                                                        let currentDateTime = new Date();
                                                                                        let message = Messages.build({message_text: req.body.messageText, message_time_stamp: currentDateTime});
                                                                                        message.save().then(savedMessage => {
                                                                                                        message.setAuthor(member);
                                                                                                        message.setAudience(chatRoom);
                                                                                                        message.save();
                                                                                                        chatRoom.addMessages(message);
                                                                                                        chatRoom.save();
                                                                                                      }).catch(error => {
                                                                                                        res.status(500)
                                                                                                           .send('{error: "Could not post message: ' + JSON.stringify(error) + '"}');
                                                                                                      });
                                                                                       }).catch(error => {
                                                                                        res.status(400)
                                                                                           .send('{error: "Invalid member"}');
                                                                                       });
                                                } else {
                                                    res.status(401)
                                                       .send('{error: "Member cannot post to provided chatroom"}');
                                                }
                                               }).catch(error => {
                                                res.status(500)
                                                   .send('{error: "Could not find chat room: ' + JSON.stringify(error) + '"}');
                                               });
    } else {
        res.status(400)
           .send('{error: "Missing chat room, author or message"}');
    }
  });

};