import React from "react";
import { useHistory} from "react-router-dom";

export const Activity = (props) => {
  
  let history =useHistory();

  return (
    <div className="profile">
      <div className="profile-item">{props.profile.name}</div>
      <div className="profile-item">{props.profile.email}</div>
      <div className="profile-item">{props.profile.phone}</div>
      <div className="profile-item">{props.profile.address}</div>
      <button className="edit-profile" onClick={e=>{props.ham(e);props.profileClose(e);history.push("/user/edit")}}>edit</button>
      
    </div>
  );
};
