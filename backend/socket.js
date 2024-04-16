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
            io.to(roomNumber).emit("user-left-room", user, userSlot, roomNumber, object.getUsersOnTable());
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
                        // update client with game data
                        io.to(roomNumber).emit("start-game-confirmed", gameObject.deck, gameObject.playerOneHand, gameObject.playerTwoHand, gameObject.getPlayerOne(), gameObject.getPlayerTwo(), gameObject.turnCard, gameObject.specialCard, gameObject);
                    }
                }
            } else {
                console.log("Received the request to start the game...");
                let gameSession = new gameLoop(playerOne, playerTwo, []);
                console.log("Deck is being created....");
                gameSession.createDeck();
                gameSession.shuffleDeck();
                gameSession.dealTurnCard();
                gameSession.dealSpecialCard();
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
               // console.log(`----------------------------`);
               // console.log(`GameObject here`);
              //  console.log(gameObject);
              //  console.log(`----------------------------`);
                if(gameObject.roomNumber === roomNumber) {
                    currentGame = gameObject;
                    break;
                }
            }
            const player = card.turn;
            const clickedCardRank = card.rank;
            const clickedCardSuit = card.suit;

            if(playerTurns[0] === -1) {
                const playerOneHand = currentGame.playerOneHand;
                const len = playerOneHand.length;

                for(let i = 0; i < len; i++) {
                    const cardObject = playerOneHand[i];

                    if(cardObject.rank === clickedCardRank) {
                       // const getP1Hand = gamesInSession[]
                       cardObject.turn = player;
                       currentGame.gameBoard.push(cardObject);
                       currentGame.setPlayerOneHand(playerOneHand.toSpliced(i, 1));
                       //currentGame.playerOneHand = playerOneHand.toSpliced(i, 1);
                       break;
                    }
                }
            } else if(playerTurns[1] == -1) {
                const playerTwoHand = currentGame.playerTwoHand;
                const len = playerTwoHand.length;

                for(let i = 0; i < len; i++) {
                    const cardObject = playerTwoHand[i];

                    if(cardObject.rank === clickedCardRank) {
                       // const getP1Hand = gamesInSession[]
                       cardObject.turn = player;
                       currentGame.gameBoard.push(cardObject);
                       currentGame.setPlayerTwoHand(playerTwoHand.toSpliced(i, 1));
                      // currentGame.playerTwoHand = playerTwoHand.toSpliced(i, 1);
                       break;
                    }
                }
            }

            console.log('Current game');
            console.log(currentGame);

            const gameBoardSize = currentGame.gameBoard.length;
            const board = currentGame.gameBoard;

            if(gameBoardSize === 2) {
                const roundWinner = currentGame.checkWinnerRound(board);
                // need to implement special card taking into effect, but
                // first get turn working properly
                console.log(`RoundWinner....`)
                console.log(roundWinner);

                const winningPlayer = roundWinner.turn;
                const playerOne = currentGame.getPlayerOne();
                const playerTwo = currentGame.getPlayerTwo();

                if(winningPlayer === playerOne) {
                   const p1RoundsTemp = currentGame.p1Rounds;

                   const roundIndex = p1RoundsTemp.findIndex((element) => element === -1);
                   console.log("-------------------");
                   console.log(roundIndex);
                   console.log("-------------------");
                   currentGame.p1Rounds[roundIndex] = 0;


                } else if(winningPlayer === playerTwo) {
                    const p2RoundsTemp = currentGame.p2Rounds;

                    const roundIndex = p2RoundsTemp.findIndex((element) => element === -1);
                    console.log("-------------------");
                    console.log(roundIndex);
                    console.log("-------------------");
                    currentGame.p2Rounds[roundIndex] = 0;
                }

                currentGame.gameBoard = [];
                io.to(roomNumber).emit("winner-round", roundWinner, currentGame.p1Rounds, currentGame.p2Rounds);
                // Idea: [-1, -1, -1] for p1 & p2 rounds won...
                // Send to front-end
                // map through the rounds for p1 & p2 then render the circles
                // -1 -> white, 0 -> green
                // use css to change the colors?

            }

        //    console.log(currentGame['playerOneHand']);

            if(playerTurns[0] === -1) {
                playerTurns[0] = 0;
                playerTurns[1] = -1;
            } else if(playerTurns[1] === -1) {
                playerTurns[0] = -1;
                playerTurns[1] = 0;
            }

            currentGame.playerTurn = playerTurns;

            const p1Hand = currentGame.playerOneHand;
            const p2Hand = currentGame.playerTwoHand; 
            
             console.log(`----------------------------`);
             console.log(`CurrentGame here`);
            console.log(currentGame);
            console.log(`----------------------------`);
            

            io.to(roomNumber).emit("turn-completed", currentGame, currentGame.getPlayerOneHand(), currentGame.getPlayerTwoHand(), currentGame.p1Rounds, currentGame.p2Rounds);

        });



        
    });
    

};

export default socketServer;