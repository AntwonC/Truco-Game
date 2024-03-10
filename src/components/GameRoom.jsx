import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";

const GameRoom = ({ socket, roomNumber }) => {
  const leaveRoomButton = () => {
    socket.emit("leave-room", roomNumber);
  };

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
        <Button size="sm" onClick={leaveRoomButton}>
          Leave
        </Button>
      </Container>
    </>
  );
};

export default GameRoom;
