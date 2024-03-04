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
    const [successMessage, setSuccessMessage] = useState("");

    const [signUpData, setSignUpData] = useState({
        signUpUser: '',
        signUpPassword: '',
        signUpPasswordConfirm: '',
    });

    const clearsAllInputs = () => {
        console.log(`Attempting to clear all inputs....`);
       // setSignUpInfo((prevState) => ({ ...prevState, [prevState]: ''}));
          const cleanSlate = ({
            signUpUser: '',
            signUpPassword: '',
            signUpPasswordConfirm: '',
          });
  
          setErrors('');
          
          setSignUpData(cleanSlate);
    }

    const handleChange = (evt) => {
        const { name, value } = evt.target;

        setSignUpData((prevState) => ({ ...prevState, [name]: value}));

       // console.log(signUpData);
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
                    } else if(signUpError === 'signUpPassword') {
                        throw Error('Password must be at least 5 characters or not blank.');
                    } else if(signUpError === 'signUpPasswordConfirm') {
                        throw Error('Confirm Password must be at least 5 characters or not blank.');
                    }
                });
            } else if (res.status === 404) {
                const jsonData = res.json();
                
                return jsonData.then((data) => {
                    console.log(data);
                    throw Error(data.message);
                });
            } else if (res.status === 205) {
                clearsAllInputs();
                setSuccessMessage("Sign Up Successful");
                
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


          <Container className="container-box">

          {errors.length > 0 ? <div className="error-div">{errors}</div> : <></>}
          {successMessage.length > 0 ? <div>{successMessage}</div> : <></>}

          <InputGroup size="sm w-75 mw-75">
            <InputGroup.Text id="userLogo">U</InputGroup.Text>
            <Form.Control 
                
                name="signUpUser"
                placeholder="Username"
                aria-label="Username"
                aria-describedby="basic-addon1"
                onChange={handleChange}
            />

            

          </InputGroup>
          
          
          <InputGroup size="sm w-75">
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

          <InputGroup size="sm w-75">
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

          <Button className="" onClick={signUpClicked} variant="secondary" size="sm w-75">Sign Up</Button>
          </Container> 
        </>
    )
}

export default SignUp;