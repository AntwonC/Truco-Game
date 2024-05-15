import { useState } from 'react';

const LastHandOptions = ({ show, acceptClicked, declineClicked, rNumber, player }) => {
    console.log(show);
    if(!show) return null;
    return (
        <div className="option-container">
            <button type="button" className="btn btn-success" onClick={() => {acceptClicked(player, rNumber)}}>Play</button> 
            <button type="button" className="btn btn-danger" onClick={() => {declineClicked(player, rNumber)}}>Give Point and Re-draw</button>
        </div>
    );
}

export default LastHandOptions;
