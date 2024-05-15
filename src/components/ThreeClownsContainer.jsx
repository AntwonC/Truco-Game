import { useState } from 'react';

const ThreeClownsContainer = ({ show, acceptClicked, declineClicked, rNumber, player }) => {
    console.log(show);
    
    if(!show) return null;
    
    return (
        <>
            <div className="option-container">
                <button type="button" className="btn btn-success" onClick={() => {acceptClicked(player, rNumber)}}>Success</button> 
                <button type="button" className="btn btn-danger" onClick={() => {declineClicked(player, rNumber)}}>Danger</button>
            </div>
        </>
    )
}

export default ThreeClownsContainer;