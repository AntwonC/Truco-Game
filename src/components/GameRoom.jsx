import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Card from './Card';

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

  const [gameStarted, setGameStarted] = useState(false);

  const [numInRoom, setNumInRoom] = useState(-1);

  const [mahila, setMahila] = useState({});

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

  const dePopulateRoom = () => {

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
  }
    
  const showHand = (playerHand) => {

    return ( <div className="player-cards">
        {playerHand.map((element) => {
          return <Card suit={element.suit} rank={element.rank} key={element.key} onClick={cardClicked}/>
        })}
    </div>)
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



    // this sets the usertable to match which user left the room
   /* socket.on("left-room", (userFromTable, room, userArray, usersInRoom) => {
      
      console.log(`left-room getting triggered in GameRoom.jsx`);
      
      console.log(`${usersInRoom} in room ${room} now after leaving...`);
      console.log(userFromTable);
      setGameStarted(false);
      setNumInRoom(usersInRoom);
      //console.log(room);
      setUserTable([...userArray]);

    }); */

    socket.on("update-left-room", (userFromTable, room, userArray, usersInRoom) => {
      console.log(`left-room getting triggered in GameRoom.jsx`);
      
      console.log(`${usersInRoom} in room ${room} now after leaving...`);
      console.log(userFromTable);
      setGameStarted(false);
      setNumInRoom(usersInRoom);
      //console.log(room);
      setUserTable([...userArray]);
    });
    
    socket.on("start-game-confirmed", (deck, p1Hand, p2Hand, p1, p2, specialCard, gameSession) => {

      console.log("Generate cards on the frontend now to the players...");
      console.log(deck);
      console.log(`Player 1 Hand: ${p1}`);
      console.log(p1Hand);
      console.log(`Player 2 Hand: ${p2}`);
      console.log(p2Hand);

      console.log(`Game Session:`);
      console.log(gameSession);

      console.log(`This is the special card..`);
      console.log(specialCard);

      setMahila(specialCard);


      if(topUserOne === p1) {
        setPlayerOneHand([...p1Hand]);
      } else if(topUserOne === p2) {
        setPlayerOneHand([...p2Hand]);
      }

      
      if(p1 === user) {
        setPlayerTwoHand([...p1Hand]);
      } else if(p2 === user) {
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
     // console.log(`User in place-user-on-bottom: ${user}`)
    //  setUserSlotTwo(user);
     // setUserSlotOne(userTemp);
      const temp = [...playerOneHand];
      const p2Temp = [...playerTwoHand];

     // console.log(`Temp... p1 hand`);
     // console.log(temp);
     // console.log(`p2Temp... p2 hand`);
     // console.log(p2Temp);
     // setPlayerTwoHand([...temp]);
     // setPlayerOneHand([...p2Temp]);
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

        for(let i = 0; i < userTable.length; i++) {
          const userObject = userTable[i];
          console.log(`BottomUserOne: ${bottomUserOne}`);
          console.log(`userFromServer: ${userFromServer}`);
          if(userObject.name !== user && userObject.room === roomNumber) {
            console.log(`userObject.name: ${userObject.name}`);
            
            setTopUserOne(userObject.name);
          }
        }

        socket.emit("start-game", user, topUserOne, roomNumber);
      } 

      
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
    }

    /* We want to position the current user's hand in front of them
       unique identifier => user
       -> client has unique identifier 
       -> user is always on the bottom
       -> other user is always on the other side
       -> 
       */


  }, [socket, numInRoom])

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
      
          {gameStarted 
          ?

            <div className="special-card-container">
              <Card suit={mahila.suit} rank={mahila.rank} key={mahila.key} />
            </div>
          :
          <></>

          }
     
      <Container>



        <div className="game-table-container">
            <div className="game-table">

            </div>
                {gameStarted
                  ?
                  <>
                    <div className="player-one-hand-container">
                    <h3 className="user-name-table-one">{topUserOne.length > 0 ? topUserOne : ""}</h3>
                    {showHand(playerOneHand)}
                    </div> 
                      
                      <div className="player-two-hand-container">
                      <h3 className="user-name-table-two">{user.length > 0 ? user : ""}</h3> 
                      {showHand(playerTwoHand)}
                      </div>
                  </>
                  :
                  <></>
                }              
        </div>

        <Button size="sm" onClick={leaveRoomButton}>
          Leave
        </Button>
      </Container>


    </>
  );
};

export default GameRoom;

/**
 * 
 *                 {joinSlotThree ? <h3 className="user-name-table-three">{userSlotThree}</h3> : <button className="join-table-button-3" onClick={joinTableButtonThree}>Join</button>}
                {joinSlotFour ? <h3 className="user-name-table-four">{userSlotFour}</h3> : <button className="join-table-button-4" onClick={joinTableButtonFour}>Join</button>}
 */
