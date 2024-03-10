import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import SignUp from "./SignUp";
import Login from "./Login";

const Bar = () => {
  return (
    <>
      <Navbar
        className="bg-body-tertiary"
        bg="dark"
        data-bs-theme="dark"
        fixed="top"
      >
        <Container>
          <Navbar.Brand className="justify-content-start" href="#home">
            Truco Online
          </Navbar.Brand>
          <Nav className="justify-content-end">
            <Nav.Link href="/">Sign Up</Nav.Link>
            <Nav.Link href="/login">Login</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default Bar;
