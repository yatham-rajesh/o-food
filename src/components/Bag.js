import React from 'react'

export const Bag = () => {
    
    let bData = JSON.parse(localStorage.getItem("bData"));
    console.log(bData.bag);

    return (
        <div>
            <div id="bag">
                
                {localStorage.getItem("bData")!==null?bData.bag.map((item)=>{return <>
                <div>{item.name}</div>
                <div>{item.foodname}</div>
        
                </>}):""}
                {/* shiavaasasdadfrqfq */}
            </div>
        </div>
    )
}
