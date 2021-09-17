import React from "react";
import { Link, Redirect} from "react-router-dom";
import { useState, useReducer } from "react";
import axios from "axios";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ham1 from "../resources/ham.png";
import cross from "../resources/back.png";
import loading from "../resources/loading.gif";
import socketClient from "socket.io-client";
import orderSound from "../resources/message_6.mp3";

export const DeliveryDashboard = ({ client }) => {
  const [profiles, setprofiles] = useState({
    prof: "",
    hist: "",
    main: "1",
    res: "",
    bag: "0",
  });
  const [mydata, setmydata] = useState({ profile: {} });
  const [authenticated, setauthenticated] = useState("");
  const [revDate, setrevDate] = useState("");
  const [loadFlag, setloadFlag] = useState(1);
  const [undeliveredOrders, setundeliveredOrders] = useState([]);
  const [deliveredOrders, setdeliveredOrders] = useState([]);

  const [connect, setconnect] = useState(0);

  let SERVER = "https://socket2.ddns.net";
  let socket;
  if (connect === 0) {
    socket = socketClient(SERVER);
    socket.on("receive-DeliveryData", (a) => {
      let audio = new Audio(orderSound);
      audio.play();
      main(defaultDate);
    });
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

  //to set status of an order
  const setstatus = (e, deliveryId, orderId, clientId, status) => {
    socket=socketClient(SERVER);
    socket.emit('status-change',(status))
    let request = {
      delivery: "true",
      deliveryId: deliveryId,
      orderId: orderId,
      clientId: clientId,
      status: status,
    };

    const transport = axios.create({
      withCredentials: true,
    });
    transport
      .post("https://backend2.hopto.org/setstatus", request)
      .then((res) => {
        main(today);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const track=(location)=>{
    window.location=`https://www.google.com/maps/search/?api=1&query=${location[0]},${location[1]}`
  }

  const workStatus=(e,deliveryId)=>{
    socket=socketClient(SERVER);
    socket.emit('workstatus-change',(e.target.value));
    let request = {
      delivery: "true",
      deliveryId: deliveryId,
      status: e.target.value
    };
    const transport = axios.create({
      withCredentials: true,
    });
    transport
      .post("https://backend2.hopto.org/setworkstatus", request)
      .then((res) => {
        main(today);
      })
      .catch((err) => {
        console.log(err);
      });
  }



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
      delivery: "true",
      date: tempDate,
    };

    const transport = axios.create({
      withCredentials: true,
    });
    transport
      .post("https://backend2.hopto.org/deliverymain", request)
      .then((res) => {
        if (res.data !== "not authenticated") {
          setloadFlag(0);
          console.log(res.data);
          setmydata({ ...mydata, profile: res.data.info });
          let order = res.data.info.todaysorders[0].orders;
          let todaysOrders = res.data.info.todaysorders[0].orders;
          let temp = [];
          let temp1 = [];
          dispatch({ type: "fetch", order });

          for (let i = 0; i < todaysOrders.length; i++) {
            if (todaysOrders[i].status !== "delivered")
              temp.push(todaysOrders[i]);
            if (todaysOrders[i].status === "delivered")
              temp1.push(todaysOrders[i]);
          }
          setundeliveredOrders(temp);
          setdeliveredOrders(temp1);
        } else setauthenticated("not authenticated");
      })
      .catch((err) => {
        setloadFlag(0);
        console.log("SomeThing went Wrong");
        // document.querySelector(".error").innerHTML = "SOMETHING WENT WRONG!!!!";
      });
  };
  React.useEffect(() => {
    setconnect(1)
    main(defaultDate);
  }, [defaultDate]);

  //Redirect to MAin page if not authenticated
  if (authenticated === "not authenticated") return <Redirect to="/delivery" />;

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
                <Link to="/deliverydashboard">
                  <div
                    className="ham-ele"
                    onClick={(e) => {
                      ham(e);
                      main(today);
                    }}
                  >
                    pending Deliveries
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
              {/* {console.log(mydata)} */}
              <div className="profile">
                <div>
                  {mydata.profile.alldata !== undefined
                    ? mydata.profile.alldata.profile.name
                    : ""}
                </div>
                <div>
                  {mydata.profile.alldata !== undefined
                    ? mydata.profile.alldata.profile.email
                    : ""}
                </div>
                <div>
                  {mydata.profile.alldata !== undefined
                    ? mydata.profile.alldata.profile.phone
                    : ""}
                </div>
              </div>
              <li>
                <Link to="/deliverydashboard/delivered">
                  <div
                    id="delivered"
                    className="ham-ele"
                    onClick={(e) => {
                      ham(e);
                      main(today);
                    }}
                  >
                    Deliverd orders
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/deliverydashboard/allorders">
                  <div
                    className="ham-ele"
                    onClick={(e) => {
                      ham(e);
                      main(defaultDate);
                    }}
                  >
                    All Deliveries
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
          
            <div className="workstatus" onChange={e=>{workStatus(e,mydata.profile.alldata._id)}}>
            My Work status :
            <label htmlFor="">idle<input type="radio" name="workStatus" id="" value="idle" onChange={e=>console.log("")} checked={mydata.profile.alldata!==undefined?mydata.profile.alldata.status==="idle"?true:false:false}/></label>
            <label htmlFor="">on delivery<input type="radio" name="workStatus" id="" onChange={e=>console.log("")} checked={mydata.profile.alldata!==undefined?mydata.profile.alldata.status==="onDelivery"?true:false:false} value="onDelivery"/></label>
            <label htmlFor="">leave<input type="radio" name="workStatus" id="" onChange={e=>console.log("")} checked={mydata.profile.alldata!==undefined?mydata.profile.alldata.status==="leave"?true:false:false} value="leave"/></label>
            </div>
          
          <Switch>
            <Route exact path="/deliverydashboard">
              <>
                <div className="food-container">
                  <div className="bill">
                    <h2>Pending Orders</h2>
                    <div className="error"></div>
                    {loadFlag === 0 ? (
                      <>
                        {undeliveredOrders.length !== 0
                          ? undeliveredOrders.map((order, index) => {
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
                                      Order ID : {order._id}
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

                                    {order.status !== "delivered" ? (
                                      <>
                                        <button
                                          className="setToDelivered"
                                          onClick={(e) =>
                                            setstatus(
                                              e,
                                              mydata.profile.alldata._id,
                                              order._id,
                                              order.orders.profile.id,
                                              "delivered"
                                            )
                                          }
                                        >
                                          Set to Delivered
                                        </button>

                                        {order.status !== "processing" ? (
                                          <button
                                            className="setToDelivered"
                                            onClick={(e) =>
                                              setstatus(
                                                e,
                                                mydata.profile.alldata._id,
                                                order._id,
                                                order.orders.profile.id,
                                                "processing"
                                              )
                                            }
                                          >
                                            Set to processing
                                          </button>
                                        ) : (
                                          ""
                                        )}
                                      </>
                                    ) : (
                                      ""
                                    )}
                                    <button className="track" style={{float:"right"}} onClick={e=>{track(order.orders.location)}}>Track Location</button>
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
              </>
            </Route>
            <Route exact path="/deliverydashboard/delivered">
              <>
                <div className="food-container">
                  <div className="bill">
                    <h2>Delivered Orders</h2>
                    <div className="error"></div>
                    {loadFlag === 0 ? (
                      <>
                        {deliveredOrders.length !== 0
                          ? deliveredOrders.map((order, index) => {
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
                                    Order ID : {order._id}
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
              </>
            </Route>
            <Route exact path="/deliverydashboard/allorders">
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
                                  Order ID : {order._id}
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
                                    {order.status !== "delivered" ? (
                                      <>
                                        <button
                                          className="setToDelivered"
                                          onClick={(e) =>
                                            setstatus(
                                              e,
                                              mydata.profile.alldata._id,
                                              order._id,
                                              order.orders.profile.id,
                                              "delivered"
                                            )
                                          }
                                        >
                                          Set to Delivered
                                        </button>

                                        {order.status !== "processing" ? (
                                          <button
                                            className="setToDelivered"
                                            onClick={(e) =>
                                              setstatus(
                                                e,
                                                mydata.profile.alldata._id,
                                                order._id,
                                                order.orders.profile.id,
                                                "processing"
                                              )
                                            }
                                          >
                                            Set to processing
                                          </button>
                                        ) : (
                                          ""
                                        )}
                                      </>
                                    ) : (
                                      ""
                                    )}
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
          </Switch>
        </div>
      </Router>
    </div>
  );
};
