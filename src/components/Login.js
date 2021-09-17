import React from "react";
import { useState } from "react";
import axios from "axios";
import { Redirect} from "react-router-dom";
import "./login.css";

const Login = ({ user }) => {

  const [authenticated, setauthenticated] = useState("")
  let available;

 
console.log(authenticated)

 React.useEffect(() => {
  const transport = axios.create({
    withCredentials: true
  })
   transport
   .post("https://backend2.hopto.org/authenticate")
   .then((res)=>{
     if(res.data === "authenticated")
     setauthenticated("authenticated")
   })
   .catch((err)=>{
     console.log(err);
   })
  }, []);

  if(authenticated === "authenticated"){
    return <Redirect to="user"/>
  }

  const submitHandler = (e) => {
    e.preventDefault();

    let request = {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      withCredentials: true
    };

    const transport = axios.create({
      withCredentials: true
    })
     transport
      .post("https://backend2.hopto.org/login" ,request)
      .then((res) => {
        available = res.data.message;
        document.getElementById("a").innerHTML = available;

        console.log("hello",res);
        if (available === "") {
          user(res.data.info);
          setauthenticated("authenticated");
        }
        if(available!==""){
          document.getElementById("email").style.border="3px solid red"
          document.getElementById("a").style.display = "block";
        }
        else{
          
          document.getElementById("a").style.display = "none";
          document.getElementById("email").style.border="none"

        }

      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  const change = (e) => {
    document.getElementById("a").innerHTML = "";
    document.getElementById("a").style.display = "none";
    document.getElementById("email").style.border="none"
  };
  
  return (
    <div className="container-login">
    <form onSubmit={submitHandler} className="form-login">
      <div id="a"></div>
      <input
        type="email"
        name="email"
        id="email"
        placeholder="Enter your email"
        onChange={change}
        required
      />
      <input
        type="password"
        name="password"
        id="password"
        placeholder="Enter password"
        onChange={change}
        required
      />
      <button className="btn-login" type="submit">
        Login
      </button>
     
    </form>
      
    </div>
  );
};

export default Login;
