import "./App.css";
import React from "react";
import { Signup } from "./components/Signup";
import Login from "./components/Login";
import { Intro } from "./components/Intro";
import { User } from "./components/User";
import Admin from "./components/Admin";
import { AdminDashboard } from "./components/AdminDashboard";
import { BrowserRouter as Router, Switch, Route} from "react-router-dom";
import { useState } from "react";
import Delivery from "./components/Delivery";
import { DeliveryDashboard } from "./components/DeliveryDashboard";

function App() {

  const [client, setClient] = useState({ profile: "", selectFoodItem: [] });
  const user = (details) => {
    setClient({
      ...client,
      profile: details,
    });
    
  };


  
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/">
            <Intro />
          </Route>
          <Route exact path="/signup">
            <Signup client={user} />
          </Route>
          <Route path="/login">
            <Login user={user} />
          </Route>
          <Route path="/admin">
            <Admin user={user} />
          </Route>
          <Route path="/user">
            <User client={client} />
          </Route>
          <Route path="/admindashboard">
            <AdminDashboard client={client} />
          </Route>
          <Route path="/delivery">
            <Delivery/>
          </Route>
          <Route path="/deliverydashboard">
            <DeliveryDashboard/>
          </Route>

          {/* <Route exact path="/food">
                    <Restaurents />
                </Route> */}
        </Switch>
      </div>
    </Router>
  );
}

export default App;
