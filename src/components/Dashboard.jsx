import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import io from "socket.io-client";
import Bar from "./Bar";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import GameRoom from "./GameRoom";
import "../styles/dashboardStyles.css";

const socket = io("http://localhost:5000");

const Dashboard = () => {
  const URL = "http://localhost:3001";

  const navigate = useNavigate();

  const { state } = useLocation();
  const { user } = state; // problem: if user is null, upon refresh of disconnected version

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [roomNumber, setRoomNumber] = useState(-1);
  const [joinedRoom, setJoinedRoom] = useState(false);

  const confirmSession = async () => {
    await fetch(`${URL}/dashboard`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username: user }),
    })
      .then((response) => response.json())
      .then((res) => {
        // console.log(res);

        if (res.status === 205) {
          // Show name instead
          console.log("Got back request");
          // Reconnecting to room may go here

          //   console.log(res.fullName);
          //   const newData = { userName: res.fullName };
          //   setInfo(newData);

          // console.log(info.userName);
        } else if (res.status === 405) {
          navigate("/login");
        }
      });
  };

  const destroySession = async () => {
    await fetch(`${URL}/dashboard/logout`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: user }),
    })
      .then((res) => {
        //   console.log(`res: ${res}`)

        if (res.status === 205) {
          // console.log('This user session will be destroyed.. redirect to login page!');

          const href = "/login";
        } else if (res.status === 405) {
          throw Error("Error happened trying to destroy this session..");
        }
      })
      .catch((err) => {
        console.log("Fetch error");
        console.log(err);
        return err;
      });
  };

  const handleChange = (evt) => {
    const { value } = evt.target;

    setRoomNumber(evt.target.value);

    // console.log(signUpData);
  };

  const joinRoomClicked = () => {
    console.log(`Should have sent event to join room ${roomNumber}`);
    socket.emit("join-room", roomNumber, user);

    socket.on("room-success", () => {
      setJoinedRoom(true);
    });
  };

  // when user is logged in, sends a request to database to check if user has logged in before
  useEffect(() => {
    const getData = async () => {
      const response = await confirmSession();
      // const newData = await response.json();
      //  console.log(response);
    };

    const onConnect = () => {
      setIsConnected(true);
      socket.emit("get-users-on-table");
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("left-room", (userFromTable, userSlot, number) => {
      console.log("This leave room should happen");
      console.log(`In Dashboard.jsx..... user is ${user}`);
      setJoinedRoom(false);
    });

    socket.on("handle-refresh-page", (user) => {
      setJoinedRoom(true);
    });


    /* 
      on page refresh, direct user to the room based on the usertable from server
      need -> user, roomNumber, emit join-room, setJoinedRoom -> true

    */

    

    socket.on("get-users-table", (userArr) => {
      if(userArr.length === 0) {
        return ;
      }

    /*  for(let i = 0; i < userArr.length; i++) {
        const userObject = userArr[i];
        // user was in a room, redirect them to the room
        if(userObject.name === user) {
          setRoomNumber(userObject.room);
          socket.emit("join-room", userObject.room);
          setJoinedRoom(true);
        }
      } */
    });

    const result = { username: user };
      //setInfo(result);
    getData();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  return (
    <>
      {joinedRoom ? (
        
        <GameRoom socket={socket} roomNumber={roomNumber} user={user} joined={joinedRoom} setJoin={setJoinedRoom}/>
      ) : (
        <>
          {isConnected ? <div>Connected</div> : <div>Not Connected</div>}
          <Navbar
            className="bg-body-tertiary"
            bg="dark"
            data-bs-theme="dark"
            fixed="top"
          >
            <Container>
              <Navbar.Brand>Truco Online</Navbar.Brand>
              <Nav>
                <Nav.Link href="/login" onClick={destroySession}>
                  Logout
                </Nav.Link>
              </Nav>
            </Container>
          </Navbar>
          <h1>Hello, {user} </h1>
          <Container className="d-flex justify-content-center">
            <InputGroup size="sm w-50 mw-50">
              <InputGroup.Text>R</InputGroup.Text>
              <Form.Control
                name="roomInput"
                placeholder="####"
                onChange={handleChange}
              />

              <Button size="sm" onClick={joinRoomClicked}>
                Join
              </Button>
            </InputGroup>
          </Container>
        </>
      )}
    </>
  );
};

export default Dashboard;
