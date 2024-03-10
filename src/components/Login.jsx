import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Bar from "./Bar";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";

const Login = () => {
  const URL = "http://localhost:3001";

  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    loginUser: "",
    loginPassword: "",
  });

  const [errors, setErrors] = useState("");

  const handleChange = (evt) => {
    const { name, value } = evt.target;

    setLoginData((prevState) => ({ ...prevState, [name]: value }));

    // console.log(signUpData);
  };

  const clearsAllInputs = () => {
    console.log(`Attempting to clear all inputs....`);
    // setSignUpInfo((prevState) => ({ ...prevState, [prevState]: ''}));
    const cleanSlate = {
      loginUser: "",
      loginPassword: "",
    };

    //    setErrors('');

    setLoginData(cleanSlate);
  };

  const loginButtonClicked = async (evt) => {
    evt.preventDefault();
    // console.log('Sign Up button clicked... verify user data next.. send user data to database...');
    console.log(`Email: ${loginData.loginUser}`);
    console.log(`Password: ${loginData.loginPassword}`);
    // console.log(`Confirm Password: ${signUpInfo.signUpConfirmPassword}`);

    await fetch(`${URL}/login`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })
      .then((res) => {
        // once figure out how to return correct status codes
        //console.log(res.json());
        //redirectToUsersPage();
        console.log(res);

        if (res.status === 405) {
          const jsonData = res.json();

          return jsonData.then((data) => {
            //console.log(data.message);
            throw Error(data.message);
          });
        } else if (res.status === 404) {
          const jsonData = res.json();
          console.log(jsonData);
          return jsonData.then((data) => {
            //console.log(data.message);
            throw Error(data.message);
          });
        } else if (res.status === 403) {
          const jsonData = res.json();
          console.log(jsonData);

          return jsonData.then((data) => {
            const login = data.errors[0].param;

            if (login === "loginEmail") {
              throw Error("Invalid email");
            } else if (login === "loginPassword") {
              throw Error("Minimum password of 5 characters long");
            }
          });
        } else if (res.status === 205) {
          console.log("Login Successful");
          console.log(res);
          const href = "/dashboard"; // Router push to go client-side routes
          navigate("/dashboard", { state: { user: loginData.loginUser } }); // dashboard
          /*router.push({
                  pathname: href,
                  query: {
                    email: loginInfo.loginEmail
                  }
                }); */
          //location.reload();
          //  clearsAllInputs();
          // setSuccess("Sign-Up Successful!");
        }
      })
      .catch((err) => {
        console.log(`Error from login.js: ${err.message}`);
        setErrors(err.message);
      });
  };

  return (
    <>
      <Bar />

      <Container className="container-box">
        <InputGroup size="sm w-75 mw-75">
          <InputGroup.Text id="userLoginLogo">U</InputGroup.Text>
          <Form.Control
            name="loginUser"
            placeholder="Username"
            aria-label="Username"
            aria-describedby="basic-addon1"
            onChange={handleChange}
          />
        </InputGroup>

        <InputGroup size="sm w-75 mw-75">
          <InputGroup.Text id="userPasswordLogo">P</InputGroup.Text>
          <Form.Control
            name="loginPassword"
            type="password"
            placeholder="Password"
            aria-label="Password"
            aria-describedby="basic-addon1"
            onChange={handleChange}
          />
        </InputGroup>

        <Button
          className=""
          onClick={loginButtonClicked}
          variant="secondary"
          size="sm w-75"
        >
          Login
        </Button>
      </Container>
    </>
  );
};

export default Login;
