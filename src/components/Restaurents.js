import React from "react";
import { useHistory } from "react-router-dom";
import { SelectRes } from "./SelectRes";
import { v4 as uuid } from "uuid";

export const Restaurents = (props) => {
  let history = useHistory();
  if (props.data.fd.length === 0) {
    history.push("/user");
    // window.location.reload();
  }
  return (
    <div className="res-container">
      <h3>Select Restaurent</h3>
      {props.data.fd.map((i) => {
        return (
          <SelectRes i={i} foodName={props.data.fName} addBag={props.addBag} key={uuid()}/>
        );
      })}
    </div>
  );
};
