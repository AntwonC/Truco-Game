import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Bar from './Bar';


const SignUp = () => {
    const [email, setEmail] = useState("");

    const [signUpData, setSignUpData] = useState({
        signUpEmail: ''
    });

    const handleChange = (evt) => {
        const { name, value } = evt.target;

        setSignUpData((prevState) => ({ ...prevState, [name]: value}));

        console.log(signUpData);
    };



    return (
        <>
          <Bar />
          
          <InputGroup size="sm">
            <InputGroup.Text id="emailLogo">@</InputGroup.Text>
            <Form.Control 
                id="emailInput"
                name="signUpEmail"
                placeholder="Email"
                aria-label="Email"
                aria-describedby="basic-addon1"
                onChange={handleChange}
            />

          </InputGroup>
          
          <Button variant="secondary" size="sm">Sign Up</Button> 
        </>
    )
}

export default SignUp;