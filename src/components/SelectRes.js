import React from "react";

export const SelectRes = (props) => {
  let qty;
  let price = Number(props.i.price);
  const clickHandler = (e) => {
    e.preventDefault();
    let temp = props.i;
    temp["foodname"] = props.foodName;
    temp["qty"] = qty;
    temp["netamount"] = qty * price;
    props.addBag(temp);
    e.target.querySelector(".addToBox").style.backgroundColor = "green";
    console.log(e.target.querySelector(".addToBox"));
    e.target.querySelector(".addToBox").innerHTML = "Added";
    e.target.querySelector(".quantity").value = "";
  };

  return (
    <div className="select-res">
      <div className="res-data">
        <div className="res-name">{props.i.name} </div>
        <div className="price"> price : {props.i.price} </div>
      </div>
      <div className="qtyForm">
        <form onSubmit={clickHandler}>
          <input required
            type="number"
            name=""
            placeholder="QTY"
            id="quantityid"
            className="quantity"
            onChange={(e) => {
              qty = e.target.value;
            }}
          />
          <button type="submit" className="addToBox">
            Add to box
          </button>
        </form>
      </div>
    </div>
  );
};
