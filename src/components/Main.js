
import {useHistory} from "react-router-dom";

export const Main = (props) => {
  let data = props.item.item;
  let history = useHistory();
  const fData = (e) => {
    props.fooddetails(data, props.item.fName);
    history.push("/user/food");
    // setTimeout(() => {
    //   // window.location.reload();
    // }, 1000);
  };

  return (
    <div id={props.item.fName} className="restaurents" onClick={fData}>
      {props.item.fName}
    </div>
  );
};
