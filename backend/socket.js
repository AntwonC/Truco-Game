import { Server } from 'socket.io';
import { callbackify } from 'util';
import  gameObject from './dataServer.js';
import gameLoop from './gameLogic.js';

import { Collapse } from 'react-bootstrap';


let object = new gameObject([]);

console.log(`GameDataObject:`);
console.log(object.getUsersOnTable());

let gamesInSession = [];

let count = 0;

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
            socket.removeAllListeners("join-room");
            socket.removeAllListeners("leave-room");
            socket.removeAllListeners("start-game");
            socket.removeAllListeners("turn-play-card");
            socket.removeAllListeners("reset-next-turn"); 
            
           
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
            console.log("Socket listener count...");
            console.log(socket.listenerCount("join-room"));
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
            socket.emit("room-success");
            io.to(roomNumber).emit("room-success", user, roomNumber, numberOfUsersInRoom, usersOnTable);
          //  socket.emit("room-success", user, roomNumber, usersInRoom, usersOnTable);

            
        });

        socket.on("leave-room", (user, roomNumber) => {
            console.log(`${user} leaving room ${roomNumber}...`);
            socket.leave(roomNumber);
          //  console.log(`${socket.id} left!`);
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
            socket.emit("left-room");
            io.to(roomNumber).emit("user-left-room", user, userSlot, roomNumber, object.getUsersOnTable());
           // io.emit("updated-user-table", user, userSlot, roomNumber, object.getUsersOnTable());
          //  socket.to(roomNumber).emit() // "left-room" changes joinedRoom in <Dashboard />
        });

        socket.on("start-game", (playerOne, playerTwo, roomNumber) => {
            const sizeOfGameSession = gamesInSession.length;
            console.log(`------------------------------`);
            console.log(`sizeOfGameSession running multiple times, why?`);
            console.log(sizeOfGameSession);
            console.log(`------------------------------`);

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
                gameSession.dealTurnCard(gameSession.getDeck());
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

          //  console.log('Current game');
          //  console.log(currentGame);

            const gameBoardSize = currentGame.gameBoard.length;
            const board = currentGame.gameBoard;

            //io.to(roomNumber).emit("waiting-game-board");
            // 3 seconds wait so the players can see the cards
            setTimeout(() => {
                if(gameBoardSize === 2) {
                    const roundWinner = currentGame.checkWinnerRound(board);
                    // need to implement special card taking into effect, but
                    // first get turn working properly
    
                    // put the cards from gameboard back into deck.. reshuffle..
                    console.log(`RoundWinner....`)
                    console.log(roundWinner);
    
                    const winningPlayer = roundWinner.turn;
                    const playerOne = currentGame.getPlayerOne();
                    const playerTwo = currentGame.getPlayerTwo();
    
                    if(winningPlayer === playerOne) {
                       const p1RoundsTemp = currentGame.p1Rounds;
    
                       const roundIndex = p1RoundsTemp.findIndex((element) => element === -1);
                    /*   console.log("-------------------");
                       console.log(roundIndex);
                       console.log("-------------------"); */
                       currentGame.p1Rounds[roundIndex] = 0;
                       currentGame.playerTurn = [-1, 0];
    
    
                    } else if(winningPlayer === playerTwo) {
                        const p2RoundsTemp = currentGame.p2Rounds;
    
                        const roundIndex = p2RoundsTemp.findIndex((element) => element === -1);
                     /*   console.log("-------------------");
                        console.log(roundIndex);
                        console.log("-------------------"); */
                        currentGame.p2Rounds[roundIndex] = 0;
                        currentGame.playerTurn = [0, -1];
                    } else if(winningPlayer === 'tie') {
                        console.log("This is a tie!");
                        // person who last played the tie card will go first
                        // give both players a win for the round
                        const p1RoundsTemp = currentGame.p1Rounds;
                        const p2RoundsTemp = currentGame.p2Rounds;
    
                        const roundIndex1 = p1RoundsTemp.findIndex((element) => element === -1);
                        const roundIndex2 = p2RoundsTemp.findIndex((element) => element === -1);
                        
                        currentGame.p1Rounds[roundIndex1] = 0;
                        currentGame.p2Rounds[roundIndex2] = 0;

                        const lastPlayerTurn = currentGame.playerTurn;

                        if(lastPlayerTurn[0] === 0 && lastPlayerTurn[1] === -1) { // player two turn
                            currentGame.playerTurn = [-1, 0];
                        } else if(lastPlayerTurn[0] === -1 && lastPlayerTurn[1] === 0) { // player one turn
                            currentGame.playerTurn = [0, -1];
                        }
                        console.log("Tie:");
                        console.log(currentGame.playerTurn);
                        

                    }
    
                    // create a setter function for this..
                    for(let i = 0; i < currentGame.gameBoard.length; i++) {
                        
                       // currentGame.deck.push(currentGame.gameBoard[i]);
                        
                    }
    
                    // put turn card back into deck
                    //currentGame.deck.push(currentGame.turnCard);
    
                    // should be full deck now...
                   // console.log(currentGame.getDeck());
    
                    currentGame.gameBoard = [];
                    // possible bug where the ref doesn't update and now the player is stuck unable to click cards...
                    io.to(roomNumber).emit("waiting-game-board-finished"); // send a request to change waiting (ref)
                    io.to(roomNumber).emit("winner-round", roundWinner, currentGame.p1Rounds, currentGame.p2Rounds, currentGame.getPlayerOne(), currentGame.getPlayerTwo(), currentGame.playerTurn);
                    io.to(roomNumber).emit("turn-completed", currentGame, currentGame.getPlayerOneHand(), currentGame.getPlayerTwoHand(), currentGame.p1Rounds, currentGame.p2Rounds);
                    return;
                    // Idea: [-1, -1, -1] for p1 & p2 rounds won...
                    // Send to front-end
                    // map through the rounds for p1 & p2 then render the circles
                    // -1 -> white, 0 -> green
                    // use css to change the colors?
    
                }

            }, 3000);

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
            
           /*  console.log(`----------------------------`);
             console.log(`CurrentGame here`);
            console.log(currentGame);
            console.log(`----------------------------`); */
            

            
            io.to(roomNumber).emit("turn-completed", currentGame, currentGame.getPlayerOneHand(), currentGame.getPlayerTwoHand(), currentGame.p1Rounds, currentGame.p2Rounds);
            

        });

        socket.on("reset-next-turn", (player, roomNumber) => {
            // hacky way of fixing the problem of it being called multiple times? 
            // Could it possibly work with more players or will it introduce more bugs?
            if(count > 0) {
                count = 0;
                return ;
            }
            count++;

            console.log(`count: ${count}`);
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
                    console.log("inside reset-next-turn")
                    break;
                }
            }



            console.log(`current game in RESET-NEXT-TURN`);
            console.log(currentGame);

            const p1 = currentGame.getPlayerOne();
            const p2 = currentGame.getPlayerTwo();

            console.log(`p1: ${p1}`);
            console.log(`p2: ${p2}`);
            console.log(`player: ${player}`);

            const roundValue = currentGame.getRoundValue();

            if(p1 === player) {
                let currentScoreOne = currentGame.getTeamOneScore();
                console.log(`currentScoreOne: ${currentScoreOne}`);
                currentGame.setTeamOneScore(roundValue);
                
               
                currentGame.playerTurn = [-1, 0];
            } else if(p2 === player) {
                let currentScoreTwo = currentGame.getTeamTwoScore();
                console.log(`currentScoreTwo: ${currentScoreTwo}`);
                currentGame.setTeamTwoScore(roundValue);
               

                currentGame.playerTurn = [0, -1];
            }

            console.log(`Player Turns....`);
            console.log(currentGame.playerTurn);

            console.log(currentGame.getTeamOneScore());
            console.log(currentGame.getTeamTwoScore());

            // NOTE: When both players play cards that result in tie for 2 rounds.. give both players +1 score
            // can ONLY use 3 clowns if you have 3 cards
            // Check if the game limit has been reached
            const checkGameWinner = currentGame.checkReachedScoreLimit();
            console.log(`checkGameWinner: ${checkGameWinner}`);
            if(checkGameWinner === 1) { // team 1 won
                // delete the game from the server state
                for(let i = 0; i < sizeOfGameSession; i++) {
                    const gameObject = gamesInSession[i];
                   // console.log(`----------------------------`);
                   // console.log(`GameObject here`);
                  //  console.log(gameObject);
                  //  console.log(`----------------------------`);
                    if(gameObject.roomNumber === roomNumber) {
                        gamesInSession = gamesInSession.toSpliced(i, 1);
                    }
                }
                io.to(roomNumber).emit("game-winner", 1);
                return;
            } else if(checkGameWinner === 2) { // team 2 won
                // delete the game from the server state
                for(let i = 0; i < sizeOfGameSession; i++) {
                    const gameObject = gamesInSession[i];
                   // console.log(`----------------------------`);
                   // console.log(`GameObject here`);
                  //  console.log(gameObject);
                  //  console.log(`----------------------------`);
                    if(gameObject.roomNumber === roomNumber) {
                        gamesInSession = gamesInSession.toSpliced(i, 1);
                    }
                }
                io.to(roomNumber).emit("game-winner", 2);
                return;
            } else if(checkGameWinner === 0) { // nobody won yet
                // continue;
            }

            

          //  console.log(`----------------------`);
            currentGame.createDeck();
          //  console.log(currentGame.deck);
           // console.log(`----------------------`);
            currentGame.shuffleDeck();
            currentGame.shuffleDeck();
            currentGame.shuffleDeck();
            // winner goes first..
            currentGame.dealTurnCard(currentGame.getDeck());
            currentGame.dealSpecialCard();

            currentGame.setPlayerOneHand([]);
            currentGame.setPlayerTwoHand([]);
            currentGame.dealPlayerOne();
            currentGame.dealPlayerTwo();

            currentGame.p1Rounds = [-1, -1, -1];
            currentGame.p2Rounds = [-1, -1, -1];

            // Cheap Trick: The event is being called twice because of two clients and 
            // incrementing twice.. but can have a workaround by just decreasing the value once..?
        
            // io.to(roomNumber).emit("start-game-confirmed", gameSession.deck, gameSession.playerOneHand, gameSession.playerTwoHand, gameSession.getPlayerOne(), gameSession.getPlayerTwo(), gameSession.turnCard, gameSession.specialCard, gameSession);
            io.to(roomNumber).emit("reset-completed", currentGame.getPlayerOneHand(), currentGame.getPlayerTwoHand(), currentGame.turnCard, currentGame.specialCard, currentGame.getTeamOneScore(), currentGame.getTeamTwoScore(), currentGame.playerTurn);
           // io.emit("reset-completed", currentGame.getPlayerOneHand(), currentGame.getPlayerTwoHand(), currentGame.turnCard, currentGame.specialCard, currentGame.getTeamOneScore(), currentGame.getTeamTwoScore(), currentGame.playerTurn);
            



        }); 

        socket.on("truco-clicked", (player, roomNumber, acceptTruco, declineTruco) => {
           const trucoValue = 3;

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

           if(acceptTruco) {
    
               console.log(currentGame);
    
               currentGame.setRoundValue(trucoValue); // change the value for this round
               currentGame.setTrucoRound(true);
               //currentGame.set
    
               // notify the other player of the Truco call
               socket.to(roomNumber).emit("truco-called", currentGame.getRoundValue(), currentGame.getTrucoRound());
               io.to(roomNumber).emit("truco-called", currentGame.getRoundValue(), currentGame.getTrucoRound());
               
               return;
           } else if(declineTruco) {
                // reset the board and give the other team the point
                currentGame.setTrucoRound(false);

                console.log(`player: ${player}`);


                const p1 = currentGame.getPlayerOne();
                const p2 = currentGame.getPlayerTwo();


                if(player === p1) { // increment the score for team 2
                    const roundVal = currentGame.getRoundValue();
                    currentGame.setTeamTwoScore(roundVal);
                    currentGame.playerTurn = [0, -1];
                } else if(player === p2) { // increment the score for team 1
                    const roundVal = currentGame.getRoundValue();
                    currentGame.setTeamOneScore(roundVal);
                    currentGame.playerTurn = [-1, 0];
                }

                // Check if the game limit has been reached
                const checkGameWinner = currentGame.checkReachedScoreLimit();
                console.log(`checkGameWinner: ${checkGameWinner}`);
                if(checkGameWinner === 1) { // team 1 won
                    // delete the game from the server state
                    for(let i = 0; i < sizeOfGameSession; i++) {
                        const gameObject = gamesInSession[i];

                        if(gameObject.roomNumber === roomNumber) {
                            gamesInSession = gamesInSession.toSpliced(i, 1);
                        }
                    }
                    io.to(roomNumber).emit("game-winner", 1);
                    return;
                } else if(checkGameWinner === 2) { // team 2 won
                    // delete the game from the server state
                    for(let i = 0; i < sizeOfGameSession; i++) {
                        const gameObject = gamesInSession[i];

                        if(gameObject.roomNumber === roomNumber) {
                            gamesInSession = gamesInSession.toSpliced(i, 1);
                        }
                    }
                    io.to(roomNumber).emit("game-winner", 2);
                    return;
            } else if(checkGameWinner === 0) { // nobody won yet
                // continue;
            }
                

                currentGame.createDeck();

                currentGame.shuffleDeck();
                currentGame.shuffleDeck();
                currentGame.shuffleDeck();
                  
                // winner goes first..
                currentGame.dealTurnCard(currentGame.getDeck());
                currentGame.dealSpecialCard();
      
                currentGame.setPlayerOneHand([]);
                currentGame.setPlayerTwoHand([]);

                currentGame.dealPlayerOne();
                currentGame.dealPlayerTwo();
      
                currentGame.p1Rounds = [-1, -1, -1];
                currentGame.p2Rounds = [-1, -1, -1]; 

                
                io.to(roomNumber).emit("truco-declined", 
                    currentGame.getPlayerOneHand(), 
                    currentGame.getPlayerTwoHand(),
                    currentGame.turnCard,
                    currentGame.specialCard,
                    currentGame.getTeamOneScore(),
                    currentGame.getTeamTwoScore(),
                    currentGame.playerTurn
                );
               // io.to(roomNumber).emit("truco-called", 1, false);
                return;
           }

           io.to(roomNumber).emit("truco-called", -1, false);
           
           /*io.to(roomNumber).emit("reset-completed", 
           currentGame.getPlayerOneHand(), 
           currentGame.getPlayerTwoHand(), 
           currentGame.turnCard, 
           currentGame.specialCard, 
           currentGame.getTeamOneScore(), 
           currentGame.getTeamTwoScore(), 
           currentGame.playerTurn);
           */


        });

        socket.on("3-clowns-clicked", (player, roomNumber, acceptTruco, declineTruco) => {
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

            if(acceptTruco) {
                // other player thinks the player has 3 clowns
                // if other player gets it correct, +1 point else -1 point
                // 
                console.log("3 CLOWNS!");
                console.log(`player that accepted it.... ${player}`);

                const p1 = currentGame.getPlayerOne();
                const p2 = currentGame.getPlayerTwo();

                // want the other player to reveal the hand...
                // check the player hand for the clowns...
                if(p1 === player) {
                    const playerOneHand = currentGame.getPlayerOneHand();

                    const clownsResult = currentGame.checkForThreeClowns(playerOneHand);
                    
                    console.log(`clownsResult: ${clownsResult}`);
                    if(clownsResult) { // give point to other player
                        currentGame.setTeamTwoScore(1);
                        const teamOneScore = currentGame.getTeamOneScore();
                        const teamTwoScore = currentGame.getTeamTwoScore();
                        
                        io.to(roomNumber).emit("clowns-called", -2, p1, teamOneScore, teamTwoScore);
                        return;
                    }
                    
                    io.to(roomNumber).emit("clowns-called", 1, p1); 
                    return;
                } else if(p2 === player) {
                    const playerTwoHand = currentGame.getPlayerTwoHand();
                    
                    const clownsResult = currentGame.checkForThreeClowns(playerTwoHand);
                    
                    console.log(`clownsResult: ${clownsResult}`);
                    if(clownsResult) { // give point to other player
                        currentGame.setTeamOneScore(1);
                        const teamOneScore = currentGame.getTeamOneScore();
                        const teamTwoScore = currentGame.getTeamTwoScore();
                        io.to(roomNumber).emit("clowns-called", -3, p2, teamOneScore, teamTwoScore);
                        return;
                    }

                    // reveal p1 hand...
                    io.to(roomNumber).emit("clowns-called", 2, p2); // 1 -> reveal hand to ALL players
                    return;
                }



            } else if(declineTruco) {
                // Other Player declines 3 Clowns... give the player that called 3-Clowns a re-draw
                console.log("3 CLOWNS!");
                console.log(`player that declined it.... ${player}`);

                const p1 = currentGame.getPlayerOne();
                const p2 = currentGame.getPlayerTwo();

                if(p1 === player) { // p2 gets the re-draw
                    currentGame.setPlayerTwoHand([]);
                    currentGame.dealPlayerTwo();

                    const teamOneScore = currentGame.getTeamOneScore();
                    const teamTwoScore = currentGame.getTeamTwoScore();
                    const p2Hand = currentGame.getPlayerTwoHand();

                    io.to(roomNumber).emit("clowns-called", -4, p2, teamOneScore, teamTwoScore, p2Hand);
                    return;

                } else if(p2 === player) {
                    currentGame.setPlayerOneHand([]);
                    currentGame.dealPlayerOne();

                    const teamOneScore = currentGame.getTeamOneScore();
                    const teamTwoScore = currentGame.getTeamTwoScore();
                    const p1Hand = currentGame.getPlayerOneHand();

                    io.to(roomNumber).emit("clowns-called", -5, p1, teamOneScore, teamTwoScore, p1Hand);
                    return;
                }
            }

            io.to(roomNumber).emit("clowns-called", -1);
        });


        
    });
    

};

export default socketServer;