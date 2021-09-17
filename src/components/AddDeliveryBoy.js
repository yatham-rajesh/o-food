import React, { useState } from "react";
import axios from "axios";
import {Redirect} from "react-router-dom";
import tick from "../resources/tick.gif"
import "./signup.css"

export const AddDeliveryBoy = ({client}) => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address:"",
    change: "",
  });
const [home, sethome] = useState(0)
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
    return <Redirect to="/admin"/>

  const submitHandler = (e) => {
    e.preventDefault();
    e.target.querySelector(".btn-edit").innerHTML="Processing...";
    console.log(e)
    let request = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      phone: document.getElementById("phone").value,
      address:document.getElementById("address").value,
      change: "1",
    };

    const transport = axios.create({
      withCredentials: true
    })
     transport
      .post("https://backend2.hopto.org/add-deliveryboy", request)
      .then((res) => {
        available = res.data.message;
        document.getElementById("a").innerHTML = available;
        if (available !== "") {
          document.getElementById("email").focus();
          document.querySelector(".btn-edit").innerHTML="Create";
        } else {
          
            document.querySelector(".editForm").style.display="none";
            document.querySelector(".success-add").style.display="block";
            setTimeout(() => {
                
                sethome(1);
            }, 1000);
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
      .post("https://backend2.hopto.org/add-deliveryboy", request)
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

  if(home===1)
  return <Redirect to="/admindashboard"/>
  return (
    <div className="create-deliveryboy">
      <form onSubmit={submitHandler} className = "editForm">
          
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
        <textarea name="address" id="address" cols="30" rows="10" placeholder="Your Address"></textarea>
        <button className="btn-edit" type="submit">
          create
        </button>
        
      </form>
      <div className="success-add">
          <img src={tick} alt="tick" />
          <div style={{color:"green",fontSize:"33px"}}>Successfully Created!</div>
      </div>
    </div>
  );
};
