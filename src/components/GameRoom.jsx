import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Card from './Card';
import TrucoContainer from './TrucoContainer';
import ThreeClownsContainer from './ThreeClownsContainer';
import LastHandOptions from './LastHandOptions';
import SpecialCards from './SpecialCards';
import e from "cors";

const GameRoom = ({ socket, roomNumber, user }) => {

  const URL = "http://localhost:3001";

  const navigate = useNavigate();

  const [joinSlotOne, setJoinSlotOne] = useState(false);
  const [joinSlotTwo, setJoinSlotTwo] = useState(false);
  const [joinSlotThree, setJoinSlotThree] = useState(false);
  const [joinSlotFour, setJoinSlotFour] = useState(false);

  const [userSlotOne, setUserSlotOne] = useState("");
  const [userSlotTwo, setUserSlotTwo] = useState("");
  const [userSlotThree, setUserSlotThree] = useState("");
  const [userSlotFour, setUserSlotFour] = useState("");

  const [bottomUserOne, setBottomUserOne] = useState(user);
  const [topUserOne, setTopUserOne] = useState("");

  const [userTable, setUserTable] = useState([]);

  const [playerOneHand, setPlayerOneHand] = useState([]);
  const [playerTwoHand, setPlayerTwoHand] = useState([]);
  const [fakeHand, setFakeHand] = useState([{suit: 'S', rank: 3}, {suit: 'S', rank: 3}, {suit: 'S', rank: 3}]);
  const [fakeHandTwo, setFakeHandTwo] = useState([{suit: 'S', rank: 3}, {suit: 'S', rank: 3}, {suit: 'S', rank: 3}]);
  
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");


  const [playerOneRound, setPlayerOneRound] = useState([]);
  const [playerTwoRound, setPlayerTwoRound] = useState([]);
  const [userWonRound, setUserWonRound] = useState("");

  const [gameStarted, setGameStarted] = useState(false);

  const [numInRoom, setNumInRoom] = useState(-1);

  const [mahila, setMahila] = useState({});
  const [turnCard, setTurnCard] = useState({});

  const [teamOne, setTeamOne] = useState(-1);
  const [teamTwo, setTeamTwo] = useState(-1);

  const [playerTurns, setPlayerTurns] = useState([]);
  const [gameBoard, setGameBoard] = useState([]);

  const [gameSession, setGameSession] = useState({});
  
  const [gameWinner, setGameWinner] = useState(0);

  const [clicked, setClicked] = useState(false);

  const [roundValue, setRoundValue] = useState(1);
 // const [trucoPressed, setTrucoPressed] = useState(false);
  const [acceptTruco, setAcceptTruco] = useState(false);
  const [acceptClown, setAcceptClown] = useState(false);

  const [renderAgain, setRenderAgain] = useState(false);

  const [isDisable, setIsDisable] = useState(false);

  //const [waiting, setWaiting] = useState(false);
  // NOTE: For some reason, player using a special card to win the round will keep it true
  // Spam clicking seems to cause the problem of waiting to stay "true"
  const waiting = useRef(false); 
  
  const trucoPressed = useRef(false);
  const threeClownsPressed = useRef(false);

  const revealPlayerOneHand = useRef(false);
  const revealPlayerTwoHand = useRef(false);

  const lastHandShowdownOne = useRef(false);
  const lastHandShowdownTwo = useRef(false);



  const trucoClicked = (player, number) => {
   // setAcceptTruco(true);
    trucoPressed.current = true;
    socket.emit("truco-clicked", player, number, false, false);
  }

  
  const clickedAcceptTruco = (player, number) => {
    trucoPressed.current = false;
    setAcceptTruco(false);
    // socket.emit("truco-accepted", )
    socket.emit("truco-clicked", player, roomNumber, true, false)
  }
  
  const clickedDeclineTruco = (player, number) => {
    trucoPressed.current = false;
    
    console.log("trucoPressed....");
    console.log(trucoPressed.current);
    setAcceptTruco(false);
    // setDeclineTruco(!declineTruco);
    socket.emit("truco-clicked", player, roomNumber, false, true);
    // setRoundValue(1);
  }
  
  const threeClownsClicked = (player, number) => {
    threeClownsPressed.current = true;
    socket.emit("3-clowns-clicked", player, number, false, false);
  }
  
  const clickedAcceptClowns = (player, number) => {
    threeClownsPressed.current = false;
    setAcceptClown(true);
    socket.emit("3-clowns-clicked", player, number, true, false);
    // socket.emit("truco-accepted", )
    //  socket.emit("truco-clicked", player, roomNumber, true, false)
  }
  
  const clickedDeclineClowns = (player, number) => {
    threeClownsPressed.current = false;
    
    setAcceptClown(false);
    socket.emit("3-clowns-clicked", player, number, false, true);
    // setDeclineTruco(!declineTruco);
   // socket.emit("truco-clicked", player, roomNumber, false, true);
    // setRoundValue(1);
  }

  const lastHandAccepted = (player, number) => {
    
    if(p1 === player) {
      console.log(`Player 1 is making the decision...`);
      lastHandShowdownOne.current = false;
    } else if(p2 === player) {
      console.log(`Player 2 is making the decision...`);
      lastHandShowdownTwo.current = false;
    }
    socket.emit("last-hand-before-winning", player, number, true, false);
  }

  const lastHandDeclined = (player, number) => {
    if(p1 === player) {
      console.log(`Player 1 is making the decision......`);
      lastHandShowdownOne.current = false;
    } else if(p2 === player) {
      console.log(`Player 2 is making the decision......`);
      lastHandShowdownTwo.current = false;
    }

    socket.emit("last-hand-before-winning", player, number, false, true);
  }

  

  

  const getUsersOnTable = async () => {
    await fetch(`${URL}/dashboard/user-joined-table`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      
      .then((res) => {
        console.log(`Res here...`);
         console.log(res);


        if (res.status === 205) {
          // Show name instead
          console.log("Got back request");
          // Reconnecting to room may go here

          //   console.log(res.fullName);
          //   const newData = { userName: res.fullName };
          //   setInfo(newData);

          // console.log(info.userName);
        } else if (res.status === 405) {
          
        }
      });
  };


 const joinTableButtonThree = () => {
    setJoinSlotThree(true);
    
 }

 const joinTableButtonFour = () => {
    setJoinSlotFour(true);
 }

  const leaveRoomButton = () => {
    //setJoin(false);
    socket.emit("leave-room", user, roomNumber);
   
   // socket.emit("get-slot-of-leaving-user", user, roomNumber);
   // navigate('/dashboard');

    //dePopulateRoom();
  };

  const decideTurn = (playerTurns) => {
    // [-1, 0]
    if(playerTurns[0] === -1) { // player 1 goes first
      setPlayerTurns([0, -1]);
    } else if(playerTurns[1] === -1) { // player 2 goes next
      setPlayerTurns([-1, 0]);
    }
  }

  const populateRoom = () => {
      console.log("Calling popuateRoom()...");
     // socket.emit("check-user-joined-table", user);
      socket.emit("get-users-on-table");

      socket.on("get-users-table", (userTable) => {
        console.log(userTable);
        setUserTable([...userTable]);
        for(let i = 0; i < userTable.length; i++) {
            const userObject = userTable[i];
            console.log(userObject.name);
            console.log(userObject.slot);
            console.log(userObject.room);
            if(userObject.slot === 1 && userObject.room === roomNumber) {
                setUserSlotOne(userObject.name);
                setJoinSlotOne(true);
            } else if(userObject.slot === 2 && userObject.room === roomNumber) {
                setUserSlotTwo(userObject.name);
                setJoinSlotTwo(true);
            }
        }

    })
      
      console.log("---------------------------");
      console.log(`Users on the Table currently`);
      console.log(userTable)
      console.log("---------------------------");
  }

  const gameStart = () => {
    console.log(joinSlotOne);
    console.log(joinSlotTwo);
    if(joinSlotOne && joinSlotTwo) {
        console.log("START THE GAME!!");
        socket.emit('start-game', userSlotOne, userSlotTwo, roomNumber);

        if(bottomUserOne !== userSlotOne) {
          console.log(bottomUserOne);
          console.log(`top should be userSlot1`);
          setTopUserOne(userSlotOne);
        }
        
        if(bottomUserOne !== userSlotTwo) {
          console.log(bottomUserOne);
          console.log(`top should be userSlot2`);
          setTopUserOne(userSlotTwo);
        }
        
        console.log(`AFTER CALLING THE SETTER`);
        console.log(bottomUserOne);
        

    }
  }

  const cardClicked = (evt) => {
    
    console.log(`A card has been clicked`);
    const { suit, value } = evt.target.dataset;
    console.log(`suit: ${suit} | rank :${value}`);
    console.log(evt.target.dataset);

    if(suit === undefined || value === undefined) { // bug where clicking the corner would make it the other player's turn without playing a card
      return ;
    }
    // when card is clicked, send event to server using socket
    // send -> {user: -1 or 0, suit, rank}
    // [-1, 0]
    const ex = playerTurns[0] === -1 ? p1 : p2;
    const card = {turn: ex, suit: suit, rank: value};



    decideTurn(playerTurns);
    const turnObject = [0, -1];
    console.log(playerTurns);
    console.log(card);
   
    
    socket.emit("turn-play-card", card, gameSession, playerTurns, roomNumber);
   
  }
    
  const showHand = (playerHand) => {
    

    return ( <div className="player-cards">
        {playerHand.map((element) => {
          return <Card suit={element.suit} rank={element.rank} key={element.key} onClick={cardClicked} click={true}/>
        })}
    </div>)
  }

  const disableClickRevealHand = (playerHand) => {
    return ( <div className="player-cards">
                {playerHand.map((element) => {
                  return <Card suit={element.suit} rank={element.rank} key={element.key} click={true}/>
                })}
             </div>)
  }

  const disableClickShowHand = (playerHand, player) => {

    if(player === user ) {
      return ( <div className="player-cards">
      {playerHand.map((element) => {
        return <Card suit={element.suit} rank={element.rank} key={element.key}  click={true} />
      })}
      </div>)
    } else {
    return ( <div className="player-cards">
    {playerHand.map((element) => {
      return <Card suit={element.suit} rank={element.rank} key={element.key}  click={false} />
    })}
    </div>)

    }
  }

  const updateRound = (round, player, userWonRound) => {
    if(player === userWonRound) {
      return (
        <div>{round.map((element) => {
          if(element === 0) {
            return <div className="green-circle"> </div>
          } else {
            return <div className="circle"></div>
          }
        })}</div>
      )
    } else if(player === userWonRound) {
      return (
        <div>{round.map((element) => {
          if(element === 0) {
            return <div className="green-circle"> </div>
          } else {
            return <div className="circle"></div>
          }
        })}</div>
      )
    }

    return (
      <div>{round.map((element) => {
        if(element === 0) {
          return <div className="green-circle"> </div>
        } else {
          return <div className="circle"></div>
        }
      })}</div>
    )
  } 

  const updateRoundTwo = (round, player, userWonRound) => {
    if(player === userWonRound) {
      return (
        <div>{round.map((element) => {
          if(element === 0) {
            return <div className="green-circle"> </div>
          } else {
            return <div className="circle"></div>
          }
        })}</div>
      )
    }
  }


 /* useEffect(() => {

    socket.on("left-room", (userFromTable, slot, room) => {
      console.log(`left-room getting triggered in GameRoom.jsx`);
      console.log(slot);
      console.log(userFromTable);
      console.log(room);
      if(slot === 1 && room === roomNumber && user === userFromTable) {
          setJoinSlotOne(false);
          setUserSlotOne("");
      } else if(slot === 2 && room === roomNumber && user === userFromTable) {
          setJoinSlotTwo(false);
          setUserSlotTwo("");
      }
    });

  }, [leftState]); */

  useEffect(() => {

        // need to find the slot the user has taken and is leaving the room

  /*  socket.on("reconnect", () => {
        console.log("Reconnecting....");
    });

    socket.on("connect", () => {
        console.log("Rejoining room....");
        socket.emit("join-room", roomNumber);
    }); */

    // socket on event that populates the userTable state
    socket.on("confirmed-user-on-table", (user, userTable) => {
        console.log("User already on table...");
        if(userSlotOne === user || userSlotTwo === user) {
           
        }
        console.log(`Getting userTable from sever...`);
        console.log(userTable);
        //setUserTable(userTable);
    });




    socket.on("user-left-room", (userFromTable, room, userArray, usersInRoom) => {
      console.log(`user-left-room getting triggered in GameRoom.jsx`);
      
      console.log(`${usersInRoom} in room ${room} now after leaving...`);
      console.log(userFromTable);
      setGameStarted(false);
      setNumInRoom(usersInRoom);
      //console.log(room);
      setUserTable([...userArray]);
    });
    
    socket.on("start-game-confirmed", (deck, p1Hand, p2Hand, p1, p2, turnCard, specialCard, gameSession, roundValue) => {

      console.log(`RoundValue: ${roundValue}`);
      console.log("Generate cards on the frontend now to the players...");
      console.log(deck);
      console.log(`Player 1 Hand: ${p1}`);
      console.log(p1Hand);
      console.log(`Player 2 Hand: ${p2}`);
      console.log(p2Hand);

      console.log(`Game Session:`);
      console.log(gameSession);
     // const parsedGameData = JSON.parse(gameSession);
     // console.log(parsedGameData);

      console.log(`This is the turn card..`);
      console.log(turnCard);

      console.log(`This is the special card..`);
      console.log(specialCard);

      setGameSession(gameSession);

      setTeamOne(gameSession.teamOneScore);
      setTeamTwo(gameSession.teamTwoScore);

      setP1(p1);
      setP2(p2);

      setRoundValue(roundValue);

      setPlayerTurns(gameSession.playerTurn)


      setTurnCard(turnCard);
      setMahila(specialCard);


    /*  if(topUserOne === p1) {
        setPlayerOneHand([...p1Hand]);
      } else if(topUserOne === p2) {
        setPlayerOneHand([...p2Hand]);
      } */

      
      if(p1 === user) {
        setPlayerOneHand([...p1Hand]);
        setPlayerTwoHand([...p2Hand]);
      }
      
      if(p2 === user) {
        setPlayerOneHand([...p1Hand]);
        setPlayerTwoHand([...p2Hand]);
      }

   //   setPlayerOneHand([...p1Hand]);

      console.log('bottom User One');
      console.log(bottomUserOne);
      
     // setTopUserOne(bottomUserOne === userSlotTwo ? userSlotOne : userSlotTwo);
     // setGameStarted(true);

     console.log(`Who's the current user in this room? ${user}`);
    // socket.emit("current-user", user, roomNumber);
     


    });

    socket.on("place-user-on-bottom", (user) => {
      const userTemp = userSlotTwo;

      const temp = [...playerOneHand];
      const p2Temp = [...playerTwoHand];

      return;
    });

    socket.on("room-success", (userFromServer, room, usersInRoom, userTable) => {
      console.log(`${userFromServer} joined room ${roomNumber}`);
      console.log(usersInRoom);
      console.log(`${usersInRoom} users in room ${roomNumber}`);

      setNumInRoom(usersInRoom);
      
      setUserTable(userTable);



      if(usersInRoom === 2) {
       // setBottomUserOne(user);
        setGameStarted(true);
        let tempVar = "";
        for(let i = 0; i < userTable.length; i++) {
          const userObject = userTable[i];
          console.log(`BottomUserOne: ${bottomUserOne}`);
          console.log(`userFromServer: ${userFromServer}`);
          if(userObject.name !== user && userObject.room === roomNumber) {
            console.log(`userObject.name: ${userObject.name}`);
            tempVar = userObject.name;
            
            setTopUserOne(userObject.name);
          }
        }
        
        console.log(tempVar);

        socket.emit("start-game", tempVar, user, roomNumber);

      } 

      
    });

    socket.on("turn-completed", (gameSess, p1Hand, p2Hand, roundOne, roundTwo) => {
     // revealHand.current = false;

      waiting.current = false;

      console.log(`-------------------------`);
      console.log('Game Sess:');
      console.log(gameSess);
      console.log(`-------------------------`);
      console.log(`Did the turns change?`);
      console.log(gameSess.playerTurn);
      console.log(`Did the gameSession object change?`);
      console.log(typeof gameSess);

      setGameSession(gameSess);

      setPlayerOneRound([...roundOne]);
      setPlayerTwoRound([...roundTwo]);
      // Why is p1Hand not iterable? Could it not be an array?
      console.log(p1Hand);
    //  console.log(p2Hand);

     // const hand1 = [...p1Hand];
     // const hand2 =[...p2Hand];
   //  if(p1Hand === undefined) {
    //  console.log(`p1Hand is undefined?`);
    //  return ;
    // }

      setPlayerOneHand([...p1Hand]);
      setPlayerTwoHand([...p2Hand]);

      setPlayerTurns(gameSess.playerTurn);
     /* setTimeout(() => {

      }, 1500); */
      
      if(gameSess.gameBoard.length === 0) {
        // put animation here??
       
          setGameBoard([]);

      
      } else {
        setGameBoard(gameSess.gameBoard);
      }

    });

    socket.on("winner-round", (winner, p1RoundsArr, p2RoundsArr, playerOne, playerTwo, turns) => {
      const winnerUser = winner.turn;

      setUserWonRound(winnerUser);

      console.log(`Turns...`);
      console.log(turns);

     /* setTimeout(() => {
        
      }, 1500); */
      
      setPlayerTurns([...turns]);
      // check if anybody has won this turn...
      const p1TempArr = [...p1RoundsArr];
      const p2TempArr = [...p2RoundsArr];

      if(winnerUser === playerOne) {
        // increment round for the user...
        setPlayerOneRound([...p1RoundsArr]);
      } else if(winnerUser === playerTwo) {
        setPlayerTwoRound([...p2RoundsArr]);
      }


      // [0, -1, -1]
      // [0, 0, -1]

      // [-1, 0, -1]
      // [0, -1, 0]

      // Check for double tie first... then increment score based on that..
      let checkDoubleTieCounter1 = 0;
      
      for(let x = 0; x < p1TempArr.length; x++) {
        const currentIndex = p1TempArr[x];
        
        if(checkDoubleTieCounter1 === 2) {
          
        } else if(currentIndex === 0) {
          checkDoubleTieCounter1++;
        }
      }
      
      let checkDoubleTieCounter2 = 0;

      for(let x = 0; x < p2TempArr.length; x++) {
        const currentIndex = p2TempArr[x];

        if(checkDoubleTieCounter2 === 2) {

        } else if(currentIndex === 0) {
          checkDoubleTieCounter2++;
        }
    }

      // Should give both teams the point, if reaches the limit then it will be handled.
      // Person that initiated the tie should go first..  -> 05/10/2024
      if(checkDoubleTieCounter1 === 2 && checkDoubleTieCounter2 === 2) {
        console.log("We got a double tie! Give a point to both teams");
        const tieString = "tie";
        socket.emit("reset-next-turn", tieString, roomNumber);
        return;
      }


      let p1Counter = 0;
      //console.log(`p1Counter: ${p1Counter}`);

      for(let i = 0; i < p1TempArr.length; i++) {
        const currentIndex = p1TempArr[i];
        console.log(`p1Counter: ${p1Counter} ${i}`);
        if(p1Counter === 2) {
          // p1 won the turn...reset the state for next turn...
          console.log(`player 1 won this turn! ${playerOne}`);
          socket.emit("reset-next-turn", playerOne, roomNumber);
          return ;
        } else if(currentIndex === 0) {
          p1Counter++;
        }
      }

      let p2Counter = 0;
     
      //console.log(`p2Counter: ${p2Counter}`);

      for(let i = 0; i < p2TempArr.length; i++) {
        const currentIndex = p2TempArr[i];
        console.log(`p2Counter: ${p2Counter} ${i}`);
        if(p2Counter === 2) {
          // p2 won the turn...
          console.log(`player 2 won this turn! ${playerTwo}`);
          socket.emit("reset-next-turn", playerTwo, roomNumber);
          return ;
        } else if(currentIndex === 0) {
          p2Counter++;
        }
      }



    });

    socket.on("reset-completed", (p1Hand, p2Hand, turnCard, specialCard, teamOneScore, teamTwoScore, playerTurn, roundValue, p1Rounds, p2Rounds) => {

      revealPlayerOneHand.current = false;
      revealPlayerTwoHand.current = false;

      setRenderAgain(false);
    //  revealHand.current = false;
      // currentGame.getPlayerOneHand(),
      // currentGame.getPlayerTwoHand(), 
      //currentGame.turnCard, currentGame.specialCard, 
      //currentGame.getTeamOneScore(), currentGame.getTeamTwoScore()

      
    //  const nextHand = p1Hand.map((card => {
    //    return card;
    //  }));

      //console.log(nextHand);
      setRoundValue(roundValue);
      // To have delay to show how many rounds each team/player won
      setTimeout(() => {
        setPlayerOneRound([...p1Rounds]);
        setPlayerTwoRound([...p2Rounds]);
      }, 1500);
      
      setPlayerTurns([...playerTurn]);
      
      setPlayerOneHand([...p1Hand]);
      setPlayerTwoHand([...p2Hand]);

      setTurnCard(turnCard);
      setMahila(specialCard);

      console.log(`teamOneScore: ${teamOneScore}`);
      console.log(`teamTwoScore: ${teamTwoScore}`);

      
      setTeamOne(teamOneScore);
      setTeamTwo(teamTwoScore);

      
    
    });

    socket.on("score-threshold", (player, beforeWinningScore, t1Score, t2Score) => {
      console.log("Score-threshold being called!");

      console.log(`t1Score: ${t1Score}`);
      console.log(`t2Score: ${t2Score}`);
      console.log(`beforeWinningScore: ${beforeWinningScore}`);
      console.log(`player: ${player}`);

      if(beforeWinningScore === t1Score) {
        lastHandShowdownOne.current = true;
      } else if(beforeWinningScore === t2Score) {
        lastHandShowdownTwo.current = true;
      }
    //  socket.emit("last-hand-before-winning", )
    });

    socket.on("game-winner", (value) => {
      if(value === 1) { // p1 won
        setGameWinner(1);
      } else if(value === 2) { // p2 won
        setGameWinner(2);
      } else {
        setGameWinner(0);
      }

    });

    socket.on("game-started-already", () => {
      console.log(`Game already started for that room`);

    });

    socket.on("truco-called", (value, isTruco) => {
      console.log("Truco was called by the other player!");
      console.log(`value: ${value}`);


     // trucoPressed.current = true;

      if(value === -1) { // other player has not made the decision yet
        trucoPressed.current = true;
        setAcceptTruco(true); // forces re-render, use ref will be alive
      } else if(value === 1) {
        setRoundValue(1);
        trucoPressed.current = false;
        setAcceptTruco(false);
        //trucoPressed.current = false;
      } else if(value === 3) {
        setRoundValue(3);
        trucoPressed.current = false;
        setAcceptTruco(false);
      //  trucoPressed.current = false;
      }
    });

    socket.on("truco-declined", (p1Hand, p2Hand, turnCard, specialCard, teamOneScore, teamTwoScore, playerTurn) => {
        setAcceptTruco(false);
        trucoPressed.current = false;

        setPlayerOneHand([...p1Hand]);
        setPlayerTwoHand([...p2Hand]);


        setTurnCard(turnCard);
        setMahila(specialCard);

        setTeamOne(teamOneScore);
        setTeamTwo(teamTwoScore);

        setPlayerTurns([...playerTurn]);
    });

    socket.on("clowns-called", (value, player, teamOneScore, teamTwoScore, playerHand) => {
      // Player can call 3 Clowns ANY turn... 
      console.log("Clowns called!!!");
      console.log(`player: ${player}`);
      console.log(`p1: ${p1}`);
      console.log(`p2: ${p2}`);
      if(value === -1) {
          threeClownsPressed.current = true;
          setRenderAgain(false);
          setAcceptClown(true);
      } else if(value === 1) { // 1 -> reveal hand, player thinks the other player has 3 Clowns
          console.log("Player 1 has accepted the 3 Clowns!");
          threeClownsPressed.current = false;
          revealPlayerTwoHand.current = true;
 
          
          //revealHand.current = true;
          setRenderAgain(true);
          setAcceptClown(false);
      } else if(value === 2) { // reveal hand to players
          console.log("Player 2 has accepted the 3 Clowns!");
          threeClownsPressed.current = false;
          revealPlayerOneHand.current = true;

          setRenderAgain(true);
          setAcceptClown(false);
      } else if(value === -2) { // there was not a 3 clowns somewhere... update team 2 score
        console.log("3-Clowns NEGATIVE 2 is here");
          threeClownsPressed.current = false;
          setTeamTwo(teamTwoScore);

          setPlayerTwoHand([]);

          setPlayerTwoHand([...playerHand]);

          setRenderAgain(false);
          setAcceptClown(false);
      } else if(value === -3) { // p2 giving point to team1
          console.log("3-Clowns NEGATIVE 3 is here");
          threeClownsPressed.current = false;
          setTeamOne(teamOneScore);

          setPlayerOneHand([]);
          setPlayerOneHand([...playerHand]);
          setRenderAgain(false);
          setAcceptClown(false);
      } else if(value === -4) { // declined a 3-Clowns call, p2 gets new hand
          console.log("in -4");
          threeClownsPressed.current = false;

          setAcceptClown(false);
          setRenderAgain(false);

          setPlayerTwoHand([]);

          setPlayerTwoHand([...playerHand]);

      } else if(value === -5) { // p1 gets a new hand, declined 3-Clowns call
          console.log("in -5");
          threeClownsPressed.current = false;

          setRenderAgain(false);
          setAcceptClown(false);

          setPlayerOneHand([]);
          setPlayerOneHand([...playerHand]);
      }
    });

    socket.on("waiting-game-board", () => {
      console.log("Change acceptTruco to true");
     // setWaiting(true);
     
    });
    
    socket.on("waiting-game-board-finished", () => {
      console.log("Change acceptTruco to false");
    //  setWaiting(false);
      waiting.current = false;
    });
    // ask server to check for user already on a table in a room
   // socket.emit("check-user-joined-table", user);
    // ask server to give back table
    //socket.emit("get-users-on-table");
    socket.emit("join-room", roomNumber, user);
  //  populateRoom();
    
  //  gameStart();
  /*  socket.emit("get-users-on-table");

    socket.on("get-users-table", (userTable) => {
     // console.log(userTable);
      setUserTable([...userTable]);
      for(let i = 0; i < userTable.length; i++) {
          const userObject = userTable[i];

          if(userObject.slot === 1 && userObject.room === roomNumber) {
              setUserSlotOne(userObject.name);
              setJoinSlotOne(true);
          } else if(userObject.slot === 2 && userObject.room === roomNumber) {
              setUserSlotTwo(userObject.name);
              setJoinSlotTwo(true);
          }
      }

  }); */

    /*
      when slot1 and slot2 are true
      start countdown of game
      then start game...
    */
    


    // clean-up
    return () => {
      socket.off("start-game-confirmed");
      socket.off("room-success");
      socket.off("turn-completed");
      socket.off("confirmed-user-on-table");
      socket.off("update-left-room");
      socket.off("reset-completed");
      socket.off("turn-completed");
      socket.off("winner-round");
      socket.off("waiting-game-board-finished");
      socket.off("clowns-called");
      socket.off("truco-called")
    //  socket.removeAllListeners();
    }

    /* We want to position the current user's hand in front of them
       unique identifier => user
       -> client has unique identifier 
       -> user is always on the bottom
       -> other user is always on the other side
       -> 
       */


  }, [socket])

  return (
    <>
      <Navbar
        className="bg-body-tertiary"
        bg="dark"
        data-bs-theme="dark"
        fixed="top"
      >
        <Container>
          <Navbar.Brand>Truco Online</Navbar.Brand>
        </Container>
      </Navbar>


      
              <div className="rectangle-container">
                <div className="turn-container">
                  <div className="top-user-turn">
                    {p1 === "" ? "" : p1

                     }
                    {updateRound(playerOneRound, p1, userWonRound)}
                    
                  </div>
                  <div className="top-user-turn">
                    {p2 === "" ? "" : p2}
                    {updateRound(playerTwoRound, p2, userWonRound)}
                    </div>
                </div>
                
                <div className="score-container">
                  Score
                  <div>{teamOne}</div>
                  <div>{teamTwo}</div>
                </div>

                <div className="value-container">
                     Value
                     <div>{roundValue}</div>
                </div>
              <div className="special-card-container">
                <div>
                  Turn
                  <Card suit={turnCard.suit} rank={turnCard.rank} click={true} />
                </div>

              <div >
                Special
                <Card suit={mahila.suit} rank={mahila.rank} key={mahila.key} click={true}/>
              </div>


              
              </div>
                
              </div>
 
            <div>
            {gameWinner === 1 ?
            <h3>{p1} has won!</h3>
            : 
            <></>
            }

            {gameWinner === 2 ?
            <h3>{p2} has won!</h3>
            : 
            <></>
            }
            </div>
      <Container>

            
              
        <div className="game-table-container">
            <div className="game-table">


              {gameBoard.map((element) => {
                if(gameBoard.length === 2) {
                  waiting.current = true;
                } else {
                  waiting.current = false;
                }
                return (<Card suit={element.suit} rank={element.rank} key={element.key}  click={true} />)
              })}
            </div>
                {gameStarted && gameWinner === 0
                  ?
                  <>
                    <div className="player-one-hand-container">

                    <h3 className="user-name-table-one">
                      {topUserOne.length > 0 ? topUserOne : ""}
                      </h3>
                      
                    <div>

                    {p1 === topUserOne
                      ?
                      <>
                      {playerTurns[0] === -1 
                      ?
                      <>
                        <div className="circle"></div>
                        { revealPlayerOneHand.current === true && renderAgain
                        ?
                        <> 
                          {disableClickRevealHand(playerOneHand)}
                        </>
                        :
                        <>
                          {disableClickShowHand(playerOneHand, p1)}
                        </>
                        }
                      </>
                      :
                      <>{disableClickShowHand(playerOneHand, p1)}</>
                      }
                    
                      
                      </>
                      :
                      <></>
                    }

                    {p2 === topUserOne
                      ?
                      <>
                      {playerTurns[1] === -1 
                      ?
                      <>
                      <div className="circle"></div>
                      { revealPlayerTwoHand.current === true && renderAgain
                        ?
                        <> 
                          {disableClickRevealHand(playerTwoHand)}
                        </>
                        :
                        <>
                          {disableClickShowHand(playerTwoHand, p2)}
                        </>
                        }
                     
                      </>
                      :
                      <>{disableClickShowHand(playerTwoHand, p2)}</>
                      }
                    
                      
                      </>
                      :
                      <>

                      </>
                    }


                      


                      
                    
                      </div>
                    </div> 
                      
                      <div className="player-two-hand-container">
                      {p1 === user
                      ?
                      <>
                      {playerTurns[0] === -1 
                      ?
                      <>
                      <div className="circle"></div>
                      <div className="option-container">
                        <button type="button" className="btn btn-info" onClick={() => {trucoClicked(p1, roomNumber)}}>Truco</button>
                        <button type="button" className="btn btn-info" onClick={() => {threeClownsClicked(p1, roomNumber)}} disabled={playerOneHand.length < 3 ? true : false}>3 Clowns</button>

                      </div>
                        
                      {acceptTruco || waiting.current === true || acceptClown || lastHandShowdownOne.current === true
                      ?
                      <>
                      {disableClickShowHand(playerOneHand, p1)}
                      </>
                      :
                      <>
                      {showHand(playerOneHand)}
                      </>
                      }

                      
                      </>
                      :
                      <>
                      <TrucoContainer 
                        show={trucoPressed.current === true} 
                        acceptClicked={clickedAcceptTruco} 
                        declineClicked={clickedDeclineTruco}
                        rNumber={roomNumber}
                        player={p1}
                      ></TrucoContainer>
                      
                      <ThreeClownsContainer
                        show={threeClownsPressed.current === true}
                        acceptClicked={clickedAcceptClowns}
                        declineClicked={clickedDeclineClowns}
                        rNumber={roomNumber}
                        player={p1}
                        
                      />
                      {disableClickShowHand(playerOneHand, p1)}
                      </>
                     }
                    
                      
                      </>
                      :
                      <>
                        {lastHandShowdownOne.current === true
                          ?
                          <>
                            <LastHandOptions 
                              show={lastHandShowdownOne.current === true}
                              acceptClicked={lastHandAccepted}
                              declineClicked={lastHandDeclined}
                              rNumber={roomNumber}
                              player={p1}
                            />
                          </>
                            :
                          <></>
                        }
                      </>
                    }


                      { p2 === user
                      ?
                      <>
                      {playerTurns[1] === -1 
                      ?
                      <>
                      <div className="circle"></div>
                      <div className="option-container">
                        <button type="button" className="btn btn-info" onClick={() => {trucoClicked(p2, roomNumber)}}>Truco</button>
                        <button type="button" className="btn btn-info" onClick={() => {threeClownsClicked(p2, roomNumber)}} disabled={playerTwoHand.length < 3 ? true : false}>3 Clowns</button>
                      </div >

                      {acceptTruco || waiting.current === true || acceptClown || lastHandShowdownTwo.current === true
                      ?
                      <>
                      {disableClickShowHand(playerTwoHand, p2)}
                      </>
                      :
                      <>
                      {showHand(playerTwoHand)}
                      </>
                      }
                     
                      </>
                      :
                      <> 
                      <TrucoContainer 
                      show={trucoPressed.current === true} 
                      acceptClicked={clickedAcceptTruco} 
                      declineClicked={clickedDeclineTruco}
                      rNumber={roomNumber}
                      player={p2}
                      ></TrucoContainer>

                      <ThreeClownsContainer
                        show={threeClownsPressed.current === true}
                        acceptClicked={clickedAcceptClowns}
                        declineClicked={clickedDeclineClowns}
                        rNumber={roomNumber}
                        player={p2}
                        
                      />
                      
                      {disableClickShowHand(playerTwoHand, p2)}

                      </>
                      }

                      </>
                      :
                      <>
                        {lastHandShowdownTwo.current === true
                          ?
                          <><LastHandOptions
                            show={lastHandShowdownTwo.current === true}
                            acceptClicked={lastHandAccepted}
                            declineClicked={lastHandDeclined}
                            rNumber={roomNumber}
                            player={p2}
                          />
                          
                          </>
                            :
                          <></>
                        }
                      </>
                      }

                      <h3 className="user-name-table-two">{user.length > 0 ? user : ""}</h3> 
                      
                      </div>
                  </>
                  :
                  <></>
                }              
        </div>

        <Button size="sm" onClick={leaveRoomButton}>
          Leave
        </Button>

        <div className="special-rank-order-container">
          <SpecialCards />
        </div>
      </Container>


    </>
  );
};

export default GameRoom;

/**
 * 
 *                 {joinSlotThree ? <h3 className="user-name-table-three">{userSlotThree}</h3> : <button className="join-table-button-3" onClick={joinTableButtonThree}>Join</button>}
                {joinSlotFour ? <h3 className="user-name-table-four">{userSlotFour}</h3> : <button className="join-table-button-4" onClick={joinTableButtonFour}>Join</button>}
 
                       {playerTurns[1] === -1 && p2 === user
                      ?
                      <div className="circle"></div>
                      :
                      <></>
                      }

                      {playerTurns[1] === -1 && p2 === topUserOne
                      ?
                      <>
                      <div className="circle"></div>
                     
                      </>
                      :
                      <></>
                      }

                      || playerTurns[1] === -1 && p2 === topUserOne

                                            {(playerTurns[0] === -1 && p1 === topUserOne) || playerTurns[1] === -1 && p2 === topUserOne
                      ?
                      <>
                      <div className="circle"></div>
                      {disableClickShowHand(fakeHand, topUserOne)}
                      </>
                      :
                      <> 
                      {disableClickShowHand(fakeHand, topUserOne)}
                      </>
                      }
 
                */
