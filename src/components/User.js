import React from "react";
import { Activity } from "./Activity";
import { Link, Redirect } from "react-router-dom";
import { useState, useRef } from "react";
import { Main } from "./Main";
import axios from "axios";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Restaurents } from "./Restaurents";
import { v4 as uuid } from "uuid";
import ham1 from "../resources/ham.png";
import cross from "../resources/back.png";
import box from "../resources/box.png";
import back from "../resources/back.png";
import { EditProfile } from "./EditProfile";
import loading from "../resources/loading.gif";
import socketClient from "socket.io-client";
import tick from "../resources/tick.gif";

export const User = ({ client }) => {
  let SERVER = "https://backend2.hopto.org";
  let totalCost = 0;
  const [profiles, setprofiles] = useState({
    prof: "",
    hist: "",
    main: "1",
    res: "",
    bag: "0",
  });
  const [fooddata, setfooddata] = useState({ fd: [], fName: "" });
  const [addToBag, setaddToBag] = useState({ bag: [] });
  const [food, setfood] = useState(null);
  const [mydata, setmydata] = useState({ profile: {} });
  const [authenticated, setauthenticated] = useState("");
  const [location, setlocation] = useState([]);
  const [history, sethistory] = useState([]);
  const [loadFlag, setloadFlag] = useState(1);
  const ref = useRef();
  //to get bag data
  let BData = addToBag;
  //calculate total amount
  if (BData.bag.length !== 0) {
    BData.bag.forEach((element) => {
      totalCost = totalCost + element.netamount;
    });
  }

  //Add to bag
  const addBag = (bData) => {
    let temp = addToBag.bag;
    temp.unshift(bData);

    let request = {
      id: mydata.profile.id,
      bag: temp,
    };

    const transport = axios.create({
      withCredentials: true,
    });
    transport
      .post("https://backend2.hopto.org/bag", request)
      .then((res) => {
        console.log("Successfully added to Bag");
        temp = res.data.message;
        // setTimeout(() => {

        setaddToBag({ ...addToBag, bag: temp });
        // }, 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //To Delete bag item
  const deleteBagItem = (key) => {
    let t = [];
    console.log(key);
    BData.bag.forEach((element) => {
      if (element.key !== key) {
        t.push(element);
      }
    });

    let request = {
      id: mydata.profile.id,
      bag: t,
    };

    const transport = axios.create({
      withCredentials: true,
    });
    transport
      .post("https://backend2.hopto.org/bag", request)
      .then((res) => {
        console.log("Successfully Deleted Item");
      })
      .catch((err) => {
        console.log(err);
      });

    setaddToBag({ ...addToBag, bag: t });
  };

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
      ham();
    }
  };

  //Basic fetching data
  const main = () => {
    setloadFlag(1);
    let loc = [];
    let show = function (position) {
      loc[0] = position.coords.latitude;
      loc[1] = position.coords.longitude;
      setTimeout(() => {
        setlocation(loc);
        window.navigator.geolocation.clearWatch(geoId);
      }, 2000);
    };
    let geoId = navigator.geolocation.watchPosition(show, console.log, {
      enableHighAccuracy: true,
    });
    let request = {};

    const transport = axios.create({
      withCredentials: true,
    });
    transport
      .post("https://backend2.hopto.org/main", request)
      .then((res) => {
        if (res.data !== "not authenticated") {
          setloadFlag(0);
          setfood(res.data.message);
          console.log(res.data.history);
          sethistory(res.data.history);
          setmydata({ ...mydata, profile: res.data.info });
          if (res.data.bag !== undefined) {
            setaddToBag({ ...addToBag, bag: res.data.bag });
          }
        } else setauthenticated("not authenticated");
      })
      .catch((err) => {
        console.log("sooooommmmmeeeeeething happened");
        console.log(err);
      });
  };

  React.useEffect((addToBag, mydata) => {
    main();
  }, []);

  //Redirect to MAin page if not authenticated
  if (authenticated === "not authenticated") return <Redirect to="/" />;

  //Send Data to server And Admin
  const sendData = (e) => {
    window.confirm("Once you proceed you cannot cancel the Order");

    var socket = socketClient (SERVER);
    console.log(ref);
    socket.emit('client-data',mydata,BData.bag,location,totalCost)
    ref.current.style.zIndex="1";
    document.querySelector(".bag-container").style.display="none"
        setTimeout(() => {
          setprofiles({
            prof: "",
            hist: "",
            main: "1",
            res: "",
            bag: "0",
          });
          document.querySelector(".panel").style.opacity = "1";
          document.querySelector(".panel").style.display = "block";
          ref.current.style.zIndex="-2";
          main();
      }, 2000);
  };

  //formatting date
  function date(date) {
    let temp = date.split("");
    let day = temp[0] + temp[1];
    let month = temp[2] + temp[3];
    let year = date.slice(-4);
    let finalDate = day + "-" + month + "-" + year;
    return finalDate;
  }

  //Selected food
  const fooddetails = (details, foodName) => {
    setfooddata({ ...fooddata, fd: details, fName: foodName });
  };

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
            {profiles.main === "1" && profiles.bag !== "1" ? (
              <>
                <img
                  alt="bag"
                  src={box}
                  className="bag-btn"
                  onClick={(e) => {
                    setprofiles({
                      prof: "",
                      hist: "",
                      main: "1",
                      res: "",
                      bag: "1",
                    });
                    document.querySelector(".panel").style.opacity = "0";
                    document.querySelector(".panel").style.display = "none";
                  }}
                />
                <div className="bagCount">
                  {BData.bag.length !== 0 ? BData.bag.length : ""}
                </div>
              </>
            ) : (
              ""
            )}
            {profiles.main === "1" && profiles.bag === "1" ? (
              <>
                {" "}
                <img
                  alt="back"
                  src={back}
                  className="bag-btn"
                  onClick={(e) => {
                    setprofiles({
                      prof: "",
                      hist: "",
                      main: "1",
                      res: "",
                      bag: "0",
                    });
                    document.querySelector(".panel").style.opacity = "1";
                    document.querySelector(".panel").style.display = "block";
                  }}
                />
              </>
            ) : (
              ""
            )}
          </header>
          <div className="ham">
            <ul className="ham-ele-container">
              <li>
                <Link to="/user">
                  <div
                    id="user-history"
                    className="ham-ele"
                    onClick={(e) => {
                      ham();
                      main();
                    }}
                  >
                    Home
                  </div>
                </Link>
              </li>
              <li>
                <div
                  id="user-profile"
                  className="ham-ele"
                  onClick={profileClose}
                >
                  profile
                </div>
              </li>
              <Activity
                profile={
                  mydata != null ? mydata.profile : console.log(client.profile)
                }
                ham={ham}
                profileClose={profileClose}
              />
              <li>
                <Link to="/user/myorders">
                  <div
                    id="user-history"
                    className="ham-ele"
                    onClick={(e) => {
                      ham();
                      main();
                    }}
                  >
                    My Orders
                  </div>
                </Link>
              </li>
              <button className="btn-logout" onClick={logout}>
                logut
              </button>
            </ul>
          </div>
        </>

        <div
          className="panel"
          onClick={(e) => {
            if (profiles.main !== "1") ham(e);
          }}
        >
          <Switch>
            <Route exact path="/user">
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
            <Route exact path="/user/food">
              <div>
                <Restaurents data={fooddata} addBag={addBag} />
              </div>
            </Route>
            <Route exact path="/user/getaddress">
              <div className="food-container">
                <form className="address"></form>
              </div>
            </Route>
            <Route exact path="/user/edit">
              <EditProfile
                client={
                  mydata != null ? mydata.profile : console.log(client.profile)
                }
              />
            </Route>
            <Route exact path="/user/myorders">
              <div className="food-container">
                <div className="customer-bill">
                  <h2>My Orders</h2>

                  <div className="error"></div>
                  {loadFlag === 0 ? (
                    <>
                      {history.length !== 0
                        ? history.map((order, index) => {
                            return (
                              <div
                                className="client-elements-container"
                                key={index}
                              >
                                <div className="sNo">{index + 1}</div>

                                <div className="customer-bill-1">
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
                                      {order.bag.length !== 0
                                        ? order.bag.map((item, index) => {
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
                                          })
                                        : ""}
                                      <tr>
                                        <td colSpan="6" className="totalBill">
                                          TOTAL BILL : Rs.
                                          {order.totalcost}/-
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <div
                                    className="date"
                                    style={{
                                      margin: "10px",
                                      marginLeft: "0px",
                                    }}
                                  >
                                    Date : {date(order.date)}
                                  </div>

                                  <div className="orderId">
                                    Order Id :{order.orderId}
                                  </div>
                                  {order.deliveryDetails !== undefined ? (
                                    <div
                                      className="deliveryDetails"
                                      style={{
                                        margin: "10px",
                                        marginLeft: "0px",
                                      }}
                                    >
                                      <div>
                                        Name : {order.deliveryDetails.name}
                                      </div>
                                      <div>
                                        Phone : {order.deliveryDetails.phone}
                                      </div>
                                    </div>
                                  ) : (
                                    ""
                                  )}
                                  <div
                                    className="status"
                                    style={{ fontWeight: "bold" }}
                                  >
                                    Status :
                                    <span
                                      style={{
                                        color:
                                          order.status === "delivered"
                                            ? "green"
                                            : order.status === "processing"
                                            ? "orange"
                                            : "red",
                                      }}
                                    >
                                      {order.status}
                                    </span>
                                    <div>
                                      {order.status === "rejected" ? (
                                        <>
                                          Reason :{" "}
                                          {order.reason !== null
                                            ? order.reason
                                            : ""}
                                        </>
                                      ) : (
                                        ""
                                      )}
                                    </div>
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
          </Switch>
        </div>
        {profiles.bag === "1" ? (
          <div className="bag-container">
            <div id="bag">
              {BData.bag.map((item) => {
                return (
                  <div key={uuid()}>
                    <div className="bag-item">
                      <div className="b-item-child">
                        <div className="ref-res">Name of the Restaurent</div>
                        <div className="bag-food">{item.name}</div>
                      </div>
                      <div className="b-item-child">
                        <div className="ref-food-name">Item</div>
                        <div className="bag-food">{item.foodname}</div>
                      </div>
                      <div className="b-item-child">
                        <div className="ref-price">Price per plate</div>
                        <div className="bag-food">Rs.{item.price}/-</div>
                      </div>
                      <div className="b-item-child">
                        <div className="ref-qty">Quantity</div>
                        <div className="bag-food">{item.qty}</div>
                      </div>
                      <div className="b-item-child">
                        <div className="ref-netamount">Net amount</div>
                        <div className="bag-food">Rs.{item.netamount}/-</div>
                      </div>
                      <div>
                        <button
                          onClick={(e) => {
                            deleteBagItem(item.key);
                          }}
                          className="btn-deleteBagItem"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="proceedToOrder">
              <div id="totalCost">Total Amount : {totalCost}</div>
              <button className="btn-proceed" onClick={sendData}>
                proceed
              </button>
            </div>
          </div>
        ) : (
          ""
        )}
        <div className="success-order" ref={ref}>
          <div>
          <img src={tick} alt="tick" style={{ height: "30vh" }} />
          <div style={{ color: "green", fontSize: "24px" }}>
            Successfully Ordered..!
          </div></div>
        </div>
      </Router>
    </div>
  );
};
