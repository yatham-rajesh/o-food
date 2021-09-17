import React from "react";
import { Link, Redirect } from "react-router-dom";
import { useState, useReducer } from "react";
import { Main } from "./Main";
import axios from "axios";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Restaurents } from "./Restaurents";
import { v4 as uuid } from "uuid";
import ham1 from "../resources/ham.png";
import cross from "../resources/back.png";
import loading from "../resources/loading.gif";
import socketClient from "socket.io-client";
import orderSound from "../resources/message_6.mp3";
import { AddDeliveryBoy } from "./AddDeliveryBoy";

export const AdminDashboard = ({ client }) => {
  const [profiles, setprofiles] = useState({
    prof: "",
    hist: "",
    main: "1",
    res: "",
    bag: "0",
  });
  const [fooddata, setfooddata] = useState({ fd: [], fName: "" });
  const [food, setfood] = useState(null);
  const [mydata, setmydata] = useState({ profile: {} });
  const [authenticated, setauthenticated] = useState("");
  const [revDate, setrevDate] = useState("");
  const [loadFlag, setloadFlag] = useState(1);

  const [connect, setconnect] = useState(0);

  let SERVER = "https://socket2.ddns.net";
  let socket;
  if (connect === 0) {
    socket = socketClient(SERVER);
    socket.on("receive-clientData", (a) => {
      let audio = new Audio(orderSound);
      audio.play();
      main(defaultDate);
    });
    socket.on("status-change",()=>{
      main(defaultDate);
    })
    socket.on("workstatus-change",(status)=>{
      console.log(status);
      window.location.reload();
    })

  }

  //to get date
  let date = new Date();
  let today =
    String(date.getFullYear()) +
    "-" +
    String("0" + (date.getMonth() + 1)).slice(-2) +
    "-" +
    String("0" + date.getDate()).slice(-2);
  const [defaultDate, setdefaultDate] = useState(today);

  const reducer = (clientData, action) => {
    if (action.type === "fetch") {
      let arr = [];
      let c = 0;
      for (let i = action.order.length - 1; i >= 0; i--) {
        arr[c] = action.order[i];
        c++;
      }
      return arr;
    }
  };

  const [clientData, dispatch] = useReducer(reducer, []);

  //To logout

  const logout = () => {
    const transport = axios.create({
      withCredentials: true,
    });
    transport
      .get("https://backend2.hopto.org/deletecookie")
      .then((res) => {
        console.log("Successfully loggedout");
      })
      .catch((err) => {
        console.log(err);
      });
    setauthenticated("not authenticated");
  };

  const ham = (e) => {
    let m = profiles.main;
    if (m !== "1") m = "1";
    else m = "0";
    setprofiles({
      ...profiles,
      prof: "",
      hist: "",
      main: m,
      res: "",
      bag: "0",
    });

    //for design
    if (m !== "1") {
      document.querySelector(".ham").style.width = "70vw";
      document.querySelector(".container-user").style.backgroundColor =
        "rgb(124, 119, 119)";
      document.querySelector(".panel").style.opacity = "0";
      document.querySelector(".panel").style.display = "none";
      document.querySelector(".ham-btn").src = cross;
    } else {
      document.querySelector(".ham-btn").src = ham1;
      document.querySelector(".ham").style.width = "0vw";
      document.querySelector(".container-user").style.backgroundColor = "white";
      setTimeout(() => {
        document.querySelector(".panel").style.opacity = "1";
        document.querySelector(".panel").style.display = "block";
      }, 500);
    }
  };

  const hamClose = (e) => {
    let parent = document.querySelector(".ham");
    let child = e.target;
    if (!parent.contains(child) && profiles.main !== "1") {
      ham(e);
    }
  };

  const main = (date) => {
    setloadFlag(1);
    let a = date.split("-");
    let year = Number(a[0]);
    let month = Number(a[1]);
    let day = Number(a[2]);
    let tempDate = String(("0"+day).slice(-2)) + String(("0"+(month - 1)).slice(-2)) + String(year);
    setdefaultDate(date);

    //Reversing the date
    let dateArr = date.split("-");
    dateArr = dateArr.reverse();
    let reverseDate = dateArr.join("-");
    setrevDate(reverseDate);

    let request = {
      admin: "true",
      date: tempDate,
    };

    const transport = axios.create({
      withCredentials: true,
    });
    transport
      .post("https://backend2.hopto.org/adminmain", request)
      .then((res) => {
        if (res.data !== "not authenticated") {
          setloadFlag(0);

          console.log(res.data);
          setfood(res.data.message);
          setmydata({ ...mydata, profile: res.data.info });
          let order = res.data.info.orders;
          dispatch({ type: "fetch", order });
        } else setauthenticated("not authenticated");
      })
      .catch((err) => {
        setloadFlag(0);
        console.log(err);
        // document.querySelector(".error").innerHTML = "SOMETHING WENT WRONG!!!!";
      });
  };
  React.useEffect(() => {
    setconnect(1);
    main(defaultDate);
    console.log(socket)
  }, [defaultDate]);

  //Redirect to MAin page if not authenticated
  if (authenticated === "not authenticated") return <Redirect to="/admin" />;

  //Selected food
  const fooddetails = (details, foodName) => {
    setfooddata({ ...fooddata, fd: details, fName: foodName });
  };

  const selectDelivery = (e, _id) => {
    // console.log(document.getElementById("deliveryboy").value, _id);
    if(e.target.querySelector("#deliveryboy").value==="")
    window.alert("Please select delivery boy")
    let request = {
      admin: "true",
      _id:_id,
      dName:e.target.querySelector("#deliveryboy").value
    };

    const transport = axios.create({
      withCredentials: true,
    });
    transport
      .post("https://backend2.hopto.org/setdeliveryboy", request)
      .then((res) => {
          console.log(res.data)
      })
  };

  const rejectOrder=(e,orderId,clientId)=>{
      e.preventDefault();
      let request = {
        admin: "true",
        orderId:orderId,
        clientId:clientId,
        reason:document.getElementById("rejectReason").value
      };
      const transport = axios.create({
        withCredentials: true,
      });
      transport
        .post("https://backend2.hopto.org/rejectOrder", request)
        .then((res) => {
            console.log(res.data);
            main(today);
        })
  }

  const profileClose = (e) => {
    let m = profiles.prof;
    if (m !== "1") m = "1";
    else m = "0";
    setprofiles({
      ...profiles,
      prof: m,
      hist: "",
      main: "0",
      res: "",
      bag: "0",
    });
    if (m !== "1") {
      document.querySelector(".profile").style.height = "0rem";
      document.querySelector(".profile").style.opacity = "0";
    } else {
      document.querySelector(".profile").style.height = "max-content";
      document.querySelector(".profile").style.opacity = "1";
    }
  };
  return (
    <div className="container-user" onClick={(e) => hamClose(e)}>
      <Router>
        <>
          <header>
            <img src={ham1} className="ham-btn" onClick={ham} alt="Hamburger" />
            <div className="title">My App</div>
          </header>
          <div className="ham">
            <ul className="ham-ele-container">
              <li>
                <Link to="/admindashboard">
                  <div
                    className="ham-ele"
                    onClick={(e) => {
                      ham(e);
                    }}
                  >
                    Home
                  </div>
                </Link>
              </li>
              <li>
                <div
                  id="admindashboard-profile"
                  className="ham-ele"
                  onClick={profileClose}
                >
                  profile
                </div>
              </li>
              <div className="profile">{mydata.profile.email}</div>
              <li>
                <Link to="/admindashboard/add-deliveryboy">
                  <div
                    id="create-delivery-boy"
                    className="ham-ele"
                    onClick={(e) => {
                      ham(e);
                    }}
                  >
                    create Delivery Boy
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/admindashboard/deliveryboys">
                  <div
                    className="ham-ele"
                    onClick={(e) => {
                      ham(e);
                      main(defaultDate);
                    }}
                  >
                    DeliveryBoys
                  </div>
                </Link>
              </li>
              <button className="btn-logout" onClick={logout}>
                logut
              </button>
            </ul>
          </div>
        </>

        <div className="panel">
          <Switch>
            <Route exact path="/admindashboard">
            <div className="food-container">
                <div className="bill">
                  <h2>{defaultDate === today ? "Todays" : revDate} Orders</h2>
                  <div className="selectDate">
                    Select Date :{" "}
                    <input
                      type="date"
                      onChange={(e) => setdefaultDate(e.target.value)}
                      value={defaultDate}
                    />
                  </div>
                  <div className="error"></div>
                  {loadFlag === 0 ? (
                    <>
                      {clientData.length !== 0
                        ? clientData.map((order, index) => {
                            return (
                              <div
                                className="client-elements-container"
                                key={index}
                              >
                                <div className="sNo">{index + 1}</div>
                                <div className="client-profile">
                                  <div className="client-elements">
                                    Name : {order.orders.profile.name}
                                  </div>
                                  <div className="client-elements">
                                    Email : {order.orders.profile.email}
                                  </div>
                                  <div className="client-elements">
                                    Phone : {order.orders.profile.phone}
                                  </div>
                                  <div className="client-elements">
                                    Address : {order.orders.profile.address}
                                  </div>
                                  <div className="client-elements">
                                    OrderId : {order._id}
                                  </div>
                                </div>
                                <div className="client-bill">
                                  <table>
                                    <tbody>
                                      <tr className="tableHeadings">
                                        <td>S.No</td>
                                        <td>NAME</td>
                                        <td>ITEM</td>
                                        <td>PRICE</td>
                                        <td>QTY</td>
                                        <td>Net AMOUNT</td>
                                      </tr>
                                      {order.orders.bag.length !== 0
                                        ? order.orders.bag.map(
                                            (item, index) => {
                                              return (
                                                <tr key={index}>
                                                  <td className="index">
                                                    {index + 1}
                                                  </td>
                                                  <td>{item.name}</td>
                                                  <td>{item.foodname}</td>
                                                  <td>{item.price}</td>
                                                  <td>{item.qty}</td>
                                                  <td>{item.netamount}</td>
                                                </tr>
                                              );
                                            }
                                          )
                                        : ""}
                                      <tr>
                                        <td colSpan="6" className="totalBill">
                                          TOTAL BILL : Rs.
                                          {order.orders.totalcost}/-
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  {order.deliveryBoy===undefined?<><form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      selectDelivery(e, order._id);
                                      main(defaultDate);
                                    }}
                                  >
                                    <select
                                    required
                                      name="deliveryboy"
                                      id="deliveryboy"
                                      style={{
                                        textAlign: "center",
                                        margin: "20px 0",
                                        fontWeight: "bold",
                                        marginRight:"10px"
                                      }}
                                    >
                                      <option
                                        value=""
                                        style={{ textAlign: "center" }}
                                      >
                                        --select Delivery boy--
                                      </option>
                                      {mydata.profile.deliveryBoys!==undefined?mydata.profile.deliveryBoys.map((item,index)=>{
                                        return <>{item.status==="idle"?<option >{item.profile.name}</option>:""}</>
                                      }):""}
                                    </select>
                                    <button className="set-dlivery">set</button>
                                    
                                  </form>
                                  <form onSubmit={e=>rejectOrder(e,order._id,order.orders.profile.id)}>
                                    <input type="text" name="rejectReason" id="rejectReason" placeholder="Reason" required/>
                                    <button id="reject" type="submit" >Reject</button>
                                  </form>
                                  
                                   </>:<div style={{fontWeight:"bold"}}>Delivery Boy : {order.deliveryBoy}</div>}
                                  <div
                                      className="status"
                                      style={{ fontWeight: "bold" }}
                                    >
                                      Status :
                                      <span style={
                                        {
                                          color:(order.status==="delivered"?"green":(order.status==="processing"?"orange":"red"))
                                        }
                                      }>
                                        {order.status}
                                        </span>
                                    </div>


                                </div>
                              </div>
                            );
                          })
                        : "No orders"}
                    </>
                  ) : (
                    <div id="loading">
                      <img src={loading} alt="loading" />
                    </div>
                  )}
                </div>
              </div>
            </Route>
            <Route exact path="/admindashboard/editfood">
              <div className="food-container">
                {food !== null ? (
                  food.items.map((item) => {
                    return (
                      <Main
                        item={item}
                        fooddetails={fooddetails}
                        key={uuid()}
                      />
                    );
                  })
                ) : (
                  <div id="loading">
                    <img src={loading} alt="loading" />
                  </div>
                )}
              </div>
            </Route>
            <Route exact path="/admindashboard/food">
              <div>
                <Restaurents data={fooddata} />
              </div>
            </Route>
            <Route exact path="/admindashboard/add-deliveryboy">
              <AddDeliveryBoy />
            </Route>
            <Route exact path="/admindashboard/deliveryboys">
              <div className="food-container bill">
                <h2>Delivery Boys</h2>
                <div className="deliveryboys">
                  {loadFlag === 0 ? (
                    <>
                      <table>
                        <tbody>
                          <tr className="tableHeadings">
                            <td>S.No</td>
                            <td>NAME</td>
                            <td>EMAIL</td>
                            <td>PHONE</td>
                            <td>STATUS</td>
                          </tr>
                          {mydata.profile.deliveryBoys !== undefined
                            ? mydata.profile.deliveryBoys.map((item, index) => {
                                return (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.profile.name}</td>
                                    <td>{item.profile.email}</td>
                                    <td>{item.profile.phone}</td>
                                    <td
                                      style={{
                                        color:
                                          item.status === "leave"
                                            ? "red"
                                            : item.status === "idle"
                                            ? "blue"
                                            : "green",
                                      }}
                                    >
                                      {item.status}
                                    </td>
                                  </tr>
                                );
                              })
                            : ""}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <div id="loading">
                      <img src={loading} alt="loading" />
                    </div>
                  )}
                </div>
              </div>
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
};
