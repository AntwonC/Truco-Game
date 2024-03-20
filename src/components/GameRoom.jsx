import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Card from './Card';

const GameRoom = ({ socket, roomNumber, user, joined, setJoin }) => {

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

  const [userTable, setUserTable] = useState([]);

  const [playerOneHand, setPlayerOneHand] = useState([]);
  const [playerTwoHand, setPlayerTwoHand] = useState([]);

  const [gameStarted, setGameStarted] = useState(false);

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

  const joinTableButtonOne = () => {
 //   populateRoom();
 for(let i = 0; i < userTable.length; i++) {
   const userObj = userTable[i];
   console.log(userObj);
   if(userObj.name === user) {
     // console.log(userObj);
     // console.log(user);
     // return out of function to prevent clicking
     return ;
        }
      }
      // populateRoom();
      setJoinSlotOne(true);
      socket.emit("user-joined-table-1", user, roomNumber);
     
    // setUserSlotOne(user);
  }

  const joinTableButtonTwo = async () => {
    // populateRoom ();
    console.log(`User table when clicking buttontwo!!!`);
    console.log(userTable);
    // send request to server to see if user already joined a table
    // returns out of function early to prevent clicking
    for(let i = 0; i < userTable.length; i++) {
      const userObj = userTable[i];
      console.log(userObj);
      if(userObj.name === user ) {
        // console.log(userObj);
        // console.log(user);
        // return out of function to prevent clicking
        return ;
      }
    }
    //const found = userTable.find((element) => element.name === user);
    //console.log(`found: ${found}`);
    
    
    
    setJoinSlotTwo(true);
    socket.emit("user-joined-table-2", user, roomNumber);
    
    //setUserSlotTwo(user);
    
 }

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
        
    }
  }

  const showHand = (p1Hand) => {
    if(p1Hand === undefined) {
      return <></>;
    }
    return ( <div>
        {p1Hand.map((element) => {
          return <Card suit={element.suit} rank={element.rank} key={element.key}/>
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

    // get emit event sent from the server when a user joins a table
    socket.on("user-joined-confirm-1", (tableUser, userArray) => {
       // console.log(`${tableUser} joined the table!`);
       // console.log(`Slot one: ${tableUser}`);
        // should display the other user on the screen globally
        setUserSlotOne(tableUser); // making sure everybody can see who joined which slot
        setUserTable([...userArray]);
        //  console.log(`userSlotOne: ${userSlotOne.length}`);
        if(tableUser !== null) {
          setJoinSlotOne(true);
        } 
        
    });

    socket.on("user-joined-confirm-2", (tableUser, userArray) => {
       // console.log(`${tableUser} joined the table!`);
       // console.log(`Slot Two: ${tableUser}`);
        // should display the other user on the screen globally
        setUserSlotTwo(tableUser);
        setUserTable([...userArray]);

        if(tableUser !== null) {
            setJoinSlotTwo(true);
        }
        
    });

    // this will broadcast to all the users in the room that somebody left a room
    socket.on("user-left-room", (userFromTable, slot, room, userArray) => {
        if(slot === 1 && room === roomNumber ) {
            setJoinSlotOne(false);
            setUserSlotOne("");
        } else if(slot === 2 && room === roomNumber ) {
            setJoinSlotTwo(false);
            setUserSlotTwo("");
        }
    });

    // this sets the usertable to match which user left the room
    socket.on("left-room", (userFromTable, slot, room, userArray) => {
      
      console.log(`left-room getting triggered in GameRoom.jsx`);
      console.log(slot);
      console.log(userFromTable);
      console.log(room);
      setUserTable([...userArray]);

    });
    
    socket.on("start-game-confirmed", (deck, p1Hand, p2Hand) => {
      

      console.log("Generate cards on the frontend now to the players...");
      console.log(deck);
      console.log(`Player 1 Hand: `);
      console.log(p1Hand);
      console.log(`Player 2 Hand: `);
      console.log(p2Hand);

      setPlayerOneHand([...p1Hand]);
      setPlayerTwoHand([...p2Hand]);
     // setGameStarted(true);


    });

    // ask server to check for user already on a table in a room
   // socket.emit("check-user-joined-table", user);
    // ask server to give back table
    //socket.emit("get-users-on-table");

    populateRoom();

    gameStart();
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

    }


  }, [socket, joinSlotOne, joinSlotTwo])

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
      
     
      <Container>

        <div className="game-table-container">
            <div className="game-table">
            </div>
                {joinSlotOne 
                ? 
                <div>
                  <h3 className="user-name-table-one">{userSlotOne}</h3> 
                  {playerOneHand.length > 0 
                  ? 
                  <>
                    {showHand(playerOneHand)}
                  </>
                  :
                  <></>
                  }
                </div>
                : 
                <button className="join-table-button-1" onClick={joinTableButtonOne} >Join</button>}
                
                
                {joinSlotTwo 
                ? 
                <div className="player-two-hand-container">
                  <h3 className="user-name-table-two">{userSlotTwo}</h3> 
                  {playerTwoHand.length > 0 
                  ? 
                  <div className="player-two-hand">
                    
                      {showHand(playerTwoHand)}
                    
                  </div>
                  :
                  <></>
                  }
                </div>
                : 
                <button className="join-table-button-2" onClick={joinTableButtonTwo} >Join</button>}
                
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
