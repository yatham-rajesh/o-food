import React, { useState } from "react";
import axios from "axios";
import {Redirect} from "react-router-dom";
import "./signup.css"

export const Signup = ({client}) => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    change: "",
  });

  let available;

  const [authenticated, setauthenticated] = useState("")
  
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

    if(authenticated === "authenticated")
    return <Redirect to="user"/>

  const submitHandler = (e) => {
    e.preventDefault();
    e.target.querySelector(".btn-signup").innerHTML = "Loading..."
    console.log(e)
    let request = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      phone: document.getElementById("phone").value,
      address:document.getElementById("client-address").value,
      change: "1",
    };

    const transport = axios.create({
      withCredentials: true
    })
     transport
      .post("https://backend2.hopto.org/signup", request)
      .then((res) => {
        available = res.data.message;
        document.getElementById("a").innerHTML = available;
        if (available !== "") {
          document.getElementById("email").focus();
        } else {
          
            let req = {
              email:request.email,
              password:request.password
            }
            console.log(req);
             transport
            .post("https://backend2.hopto.org/login", req)
            .then((res) => {
              client(res.data.info);
              setauthenticated("authenticated")
            })
            .catch((err) => {
              console.log("err", err);
            });
        }
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  const change = (e) => {
    setUser({ ...user, email: e.target.value });

    let request = {
      email: document.getElementById("email").value,
      change: "0",
    };

    axios
      .post("https://backend2.hopto.org/signup", request)
      .then((res) => {
        available = res.data.message;
        document.getElementById("a").innerHTML = available;
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

  return (
    <div className = "container-signup">
      <form onSubmit={submitHandler} className = "form-signup">
        <input type="text" name="name" id="name" placeholder="name" required/>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter your email"
          onChange={change}
          value={user.email}
          required
        />
        {/* onChange ={change} value = {user.email} */}
        <div id="a"></div>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Enter password"
          required
        />
        <input
          type="tel"
          id="phone"
          name="phone"
          pattern="[6-9]{1}[0-9]{9}"
          placeholder="Enter your phone number"
          required
        />
        <textarea name="address" id="client-address" cols="30" rows="10" placeholder="Address"></textarea>
        <button className="btn-signup" type="submit">
          Sign UP
        </button>
      </form>
    </div>
  );
};
