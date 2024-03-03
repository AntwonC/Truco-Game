import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Bar from './Bar';


const SignUp = () => {
    const URL = 'http://localhost:3001';

    const [email, setEmail] = useState("");

    const [errors, setErrors] = useState("");

    const [signUpData, setSignUpData] = useState({
        signUpUser: '',
        signUpPassword: '',
        signUpPasswordConfirm: '',
    });

    const handleChange = (evt) => {
        const { name, value } = evt.target;

        setSignUpData((prevState) => ({ ...prevState, [name]: value}));

        console.log(signUpData);
    };

    const signUpClicked = async () => {
        
        const result = await fetch(`${URL}/`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signUpData),
        })
        .then((res) => {
            console.log(res);

            if(res.status === 403) {
                const jsonData = res.json();

                return jsonData.then((data) => {
                    const signUpError = data.errors[0].path;
                    console.log(signUpError);
                    if(signUpError === 'signUpUser') {
                        throw Error('Username too short, at least 5 characters');
                    }
                })
            } else if (res.status === 404) {
                const jsonData = res.json();

                return jsonData.then((data) => {
                    throw Error(data.message);
                })
            }
        })
        .catch((err) => {
            console.log(`Error from signUp.js ${err.message}`);
            setErrors(err.message);
        })
    }



    return (
        <>
          <Bar />

          {errors.length > 0 ? <div>{errors}</div> : <></>}

          <Container className="container-box">
          <InputGroup size="sm">
            <InputGroup.Text id="userLogo">U</InputGroup.Text>
            <Form.Control 
                name="signUpUser"
                placeholder="Username"
                aria-label="Username"
                aria-describedby="basic-addon1"
                onChange={handleChange}
            />

            

          </InputGroup>
          
          
          <InputGroup size="sm">
            <InputGroup.Text id="passwordLogo">P</InputGroup.Text>    
            <Form.Control
                name="signUpPassword"
                type="password"
                placeholder="Password"
                aria-label="Password"
                aria-describedby="basic-addon1"
                onChange={handleChange}
            />
          </InputGroup>

          <InputGroup size="sm">
            <InputGroup.Text id="confirmPasswordLogo">CP</InputGroup.Text>    
            <Form.Control
                name="signUpPasswordConfirm"
                type="password"
                placeholder="Confirm Password"
                aria-label="Confirm Password"
                aria-describedby="basic-addon1"
                onChange={handleChange}
            />
          </InputGroup>

          </Container> 
          <Button className="sign-up-button" onClick={signUpClicked} variant="secondary" size="sm">Sign Up</Button>
        </>
    )
}

export default SignUp;