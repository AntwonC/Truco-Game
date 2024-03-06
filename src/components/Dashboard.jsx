import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Bar from './Bar';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import '../styles/dashboardStyles.css';


const Dashboard = () => {

    const URL = 'http://localhost:3001';

    const { state } = useLocation();
    const { user } = state;

    const confirmSession = async () => {
        await fetch(`${URL}/dashboard`, {
             method: 'POST',
             mode: 'cors',
             headers: {
               'Content-Type': 'application/json',
               'Accept': 'application/json'
             },
             body: JSON.stringify({username: user}),
         })
         .then((response) => response.json())
         .then((res) => {
           // console.log(res);

            if(res.status === 205) { // Show name instead
                console.log("Got back request")
             //   console.log(res.fullName);
             //   const newData = { userName: res.fullName };
             //   setInfo(newData);

               // console.log(info.userName);
            } else if (res.status === 405) {
                navigate('/login');
            }
         });
         
     }

     const destroySession = async () => {
        await fetch(`${URL}/dashboard/logout`, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: user}),
        })
        .then((res) => {
         //   console.log(`res: ${res}`)

            if(res.status === 205) {
               // console.log('This user session will be destroyed.. redirect to login page!');


                const href = '/login';
                
            } else if (res.status === 405) {
                throw Error('Error happened trying to destroy this session..');
            }
        })
        .catch((err) => {
            console.log('Fetch error');
            console.log(err);
            return err;
        })
    }


     // when user is logged in, sends a request to database to check if user has logged in before
     useEffect(() => { 
        const getData = async () => {
            const response = await confirmSession();
           // const newData = await response.json();
          //  console.log(response);
        }
        
        const result = {username: user};
      //  setInfo(result);
        getData();
     }, [])


    return (
        <>

            <Navbar className="bg-body-tertiary" bg="dark" data-bs-theme="dark" fixed="top">
                <Container>
                    <Navbar.Brand>Truco Online</Navbar.Brand>
                    <Nav>
                        <Nav.Link href="/login" onClick={destroySession}>Logout</Nav.Link>
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
                    />

                       
                    <Button size="sm">Join</Button>
                    
                </InputGroup>
                    

            </Container>
        </>
    )
}

export default Dashboard;