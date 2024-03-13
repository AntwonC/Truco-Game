import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";

const GameRoom = ({ socket, roomNumber, user }) => {

  const [joinSlotOne, setJoinSlotOne] = useState(false);
  const [joinSlotTwo, setJoinSlotTwo] = useState(false);
  const [joinSlotThree, setJoinSlotThree] = useState(false);
  const [joinSlotFour, setJoinSlotFour] = useState(false);

  const [userSlotOne, setUserSlotOne] = useState("");
  const [userSlotTwo, setUserSlotTwo] = useState("");
  const [userSlotThree, setUserSlotThree] = useState("");
  const [userSlotFour, setUserSlotFour] = useState("");

  const [userTable, setUserTable] = useState([]);


  const joinTableButtonOne = () => {
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

  const joinTableButtonTwo = () => {
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
    socket.emit("leave-room", user, roomNumber);
    //dePopulateRoom();
  };

  const dePopulateRoom = () => {

  }

  const populateRoom = () => {
      console.log("Calling popuateRoom()...");

      socket.on("get-users-table", (userTable) => {
       // console.log(userTable);

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

    })
      socket.emit("get-users-on-table");
      
      console.log("---------------------------");
      console.log(`Users on the Table currently`);
      console.log(userTable)
      console.log("---------------------------");
  }


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
        setUserTable(userTable);
    });

    // get emit event sent from the server when a user joins a table
    socket.on("user-joined-confirm-1", (tableUser) => {
       // console.log(`${tableUser} joined the table!`);
       // console.log(`Slot one: ${tableUser}`);
        // should display the other user on the screen globally
        setUserSlotOne(tableUser);

        // making sure everybody can see who joined which slot
      //  console.log(`userSlotOne: ${userSlotOne.length}`);
        if(tableUser !== null) {
            setJoinSlotOne(true);
        } 
    });

    socket.on("user-joined-confirm-2", (tableUser) => {
       // console.log(`${tableUser} joined the table!`);
       // console.log(`Slot Two: ${tableUser}`);
        // should display the other user on the screen globally
        setUserSlotTwo(tableUser);

        if(tableUser !== null) {
            setJoinSlotTwo(true);
        }
        
    });

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


    // ask server to check for user already on a table in a room
    socket.emit("check-user-joined-table", user);
    // ask server to give back table
    //socket.emit("get-users-on-table");

    populateRoom();

    if(joinSlotOne && joinSlotTwo) {
        console.log("START THE GAME!!");
    }

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
                {joinSlotOne ? <h3 className="user-name-table-one">{userSlotOne}</h3> : <button className="join-table-button-1" onClick={joinTableButtonOne} >Join</button>}
                {joinSlotTwo ? <h3 className="user-name-table-two">{userSlotTwo}</h3> : <button className="join-table-button-2" onClick={joinTableButtonTwo} >Join</button>}
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
