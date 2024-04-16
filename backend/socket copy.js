import { Server } from 'socket.io';
import { callbackify } from 'util';
import  gameObject from './dataServer.js';
import gameLoop from './gameLogic.js';
import e from 'cors';
import { Collapse } from 'react-bootstrap';


let object = new gameObject([]);

console.log(`GameDataObject:`);
console.log(object.getUsersOnTable());

let gamesInSession = [];


const socketServer = (server) => {
    
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
      /*  socket.on("disconnecting", () => {
            console.log(socket.rooms);
        }); */

        socket.on("disconnect", () => {
            console.log("Disconnecting...");
        })

        console.log(`socket connected with id: ${socket.id}`);
        //console.log(socket.id);
        /* Problem: Users are not separated when joining two different rooms...
           Potential Fix: Check for other users in the room
           Users are added to the room first so maybe check first
           Case 1: if none then do not get userTables
           Case 2: somebody is on table, therefore there is at least 1 user
        /*/
        socket.on("join-room", (roomNumber, user) => {
            console.log(`Joining room ${roomNumber}...`);

            const userExistsOnTable = object.findUserOnTable(user, roomNumber);
            
            if(userExistsOnTable === false) {
                object.addUserOnTable(user, roomNumber);
            }
            const usersOnTable = object.getUsersOnTable();

            console.log('-----------------------------------');
            console.log(`Users in this Room`);
            const usersInRoom = io.sockets.adapter.rooms.get(roomNumber);
            const numberOfUsersInRoom = usersInRoom ? usersInRoom.size : 0;
            console.log(io.sockets.adapter.rooms.get(roomNumber));
            console.log('-----------------------------------');

            socket.join(roomNumber); // socket joining room

            console.log(`Joined room ${roomNumber}`);


            //if(usersInRoom > 0) 
            // (userFromServer, room, usersInRoom, userTable)
            // emit to the roomNumber and place bottom user accordingly
            io.to(roomNumber).emit("room-success", user, roomNumber, numberOfUsersInRoom, usersOnTable);
          //  socket.emit("room-success", user, roomNumber, usersInRoom, usersOnTable);

            
        });

        socket.on("leave-room", (user, roomNumber) => {
            console.log(`${socket.id} leaving room ${roomNumber}...`);
            socket.leave(roomNumber);
            console.log(`${socket.id} left!`);
            console.log(`${user} is leaving room...`);

            // Get user slot
            const userSlot = object.findUserSlotOnTable(user, roomNumber);
           // userTable =  userTable.filter((element) => element.name !== user);
           // userTable = deleteUserInRoom(user, roomNumber, userTable);
            console.log(`Deleting users from userTable...`);
            object.removeUserOnTable(user, roomNumber);

            const usersInRoom = io.sockets.adapter.rooms.get(roomNumber);
            const numberOfUsersInRoom = usersInRoom ? usersInRoom.size : 0;

        /*    if(numberOfUsersInRoom < 5) {
                const sizeOfGameSession = gamesInSession.length;

                for(let i = 0; i < sizeOfGameSession; i++) {
                    const currGame = gamesInSession[i];

                    if(currGame.roomNumber === roomNumber) {
                         gamesInSession.slice(i);
                    }
                    
                }

                console.log(gamesInSession);
            } */

          //  console.log(userTable);
            // emit the user, userSlot, and roomNumber back
            console.log(`user that wants to leave... ${user}`);
            // current socket emits to user
            socket.emit("left-room", user, userSlot, roomNumber, object.getUsersOnTable());
            io.emit("user-left-room", user, userSlot, roomNumber, object.getUsersOnTable());
           // io.emit("updated-user-table", user, userSlot, roomNumber, object.getUsersOnTable());
          //  socket.to(roomNumber).emit() // "left-room" changes joinedRoom in <Dashboard />
        });

        socket.on("user-joined-table-1", (user, roomNumber) => {
            /*console.log('-----------------------------------');
            console.log(`Users in this table`);
            console.log(io.sockets.adapter.rooms.get(roomNumber));
            console.log('-----------------------------------'); */
            object.addUserOnTable(user, 1, roomNumber)
            io.to(roomNumber).emit('user-joined-confirm-1', user, object.getUsersOnTable());
           // userTable.push({name: user, slot: 1, room: roomNumber});
            object.getUsersOnTable();
        });

        socket.on("user-joined-table-2", (user, roomNumber) => {
            
            /*console.log('-----------------------------------');
            console.log(`Users in this table`);
            console.log(io.sockets.adapter.rooms.get(roomNumber));
            console.log('-----------------------------------'); */
            object.addUserOnTable(user, 2, roomNumber)
            io.to(roomNumber).emit('user-joined-confirm-2', user, object.getUsersOnTable());
            object.getUsersOnTable();
           // userTable.push({name: user, slot: 2, room: roomNumber});
           // console.log(userTable);
        });

        socket.on("get-users-on-table", () => {
            console.log(`Getting users from table...`);
            socket.emit("get-users-table", object.getUsersOnTable());
           // console.log(userTable);
           // socket.emit("get-users-table", userTable);
        })

        socket.on("check-user-joined-table", (user) => {
          /*  for(let i = 0; i < userTable.length; i++) {
                const userObject = userTable[i];

                if(userObject.name === user) {
                    socket.emit("confirmed-user-on-table", user, userTable);
                }
            } */

        });

        socket.on("start-game", (playerOne, playerTwo, roomNumber) => {
            const sizeOfGameSession = gamesInSession.length;
            console.log(sizeOfGameSession);

            if(sizeOfGameSession > 0) {
                for(let i = 0; i < sizeOfGameSession; i++) {
                    const gameObject = gamesInSession[i];

                    if(gameObject.roomNumber === roomNumber) {
                        
                    }
                }
            } else {
                console.log("Received the request to start the game...");
                let gameSession = new gameLoop(playerOne, playerTwo, []);
                console.log("Deck is being created....");
                gameSession.createDeck();
                gameSession.shuffleDeck();
                gameSession.dealPlayerOne();
                gameSession.dealPlayerTwo();
                gameSession.roomNumber = roomNumber;

                gamesInSession.push(gameSession);

                io.to(roomNumber).emit("start-game-confirmed", gameSession.deck, gameSession.playerOneHand, gameSession.playerTwoHand, gameSession.getPlayerOne(), gameSession.getPlayerTwo(), gameSession.turnCard, gameSession.specialCard, gameSession);

            }

        });

        socket.on("turn-play-card", (card, gameSession, playerTurns, roomNumber) => {
            const sizeOfGameSession = gamesInSession.length;
            let currentGame = {};
            console.log(`sizeOfGameSession: ${sizeOfGameSession}`);

            for(let i = 0; i < sizeOfGameSession; i++) {
                const gameObject = gamesInSession[i];
                console.log(gameObject);
                if(gameObject.roomNumber === roomNumber) {
                    currentGame = gameObject;
                    break;
                }
            }
            const player = card.turn;
            const clickedCardRank = card.rank;
            const clickedCardSuit = card.suit;

            if(playerTurns[0] === -1) {
                const playerOneHand = gameSession.playerOneHand;
                const len = playerOneHand.length;

                for(let i = 0; i < len; i++) {
                    const cardObject = playerOneHand[i];

                    if(cardObject.rank === clickedCardRank) {
                       // const getP1Hand = gamesInSession[]
                       currentGame.playerOneHand = playerOneHand.toSpliced(i, 1);
                       break;
                    }
                }
            } else if(playerTurns[1] == -1) {
                const playerTwoHand = gameSession.playerTwoHand;
                const len = playerTwoHand.length;

                for(let i = 0; i < len; i++) {
                    const cardObject = playerTwoHand[i];

                    if(cardObject.rank === clickedCardRank) {
                       // const getP1Hand = gamesInSession[]
                       currentGame.playerTowHand = playerTwoHand.toSpliced(i, 1);
                       break;
                    }
                }
            }

            console.log('Current game');
            console.log(currentGame);

            if(playerTurns[0] === -1) {
                playerTurns[0] = 0;
                playerTurns[1] = -1;
            } else if(playerTurns[1] === -1) {
                playerTurns[0] = -1;
                playerTurns[1] = 0;
            }

            currentGame.playerTurns = playerTurns;

            const p1Hand = currentGame.playerOneHand;
            let arr = [];
            for(let x = 0; x < p1Hand.length; x++) {
                arr.push(p1Hand[x]);
            }
            console.log(typeof p1Hand);
         
            console.log(typeof arr);
            const p2Hand = currentGame.playerTwoHand;

            socket.emit("turn-completed", (currentGame, arr, p2Hand));

        });



        
    });
    

};

export default socketServer;