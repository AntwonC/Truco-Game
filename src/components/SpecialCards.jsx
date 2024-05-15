import { useState } from 'react';
import '../styles/specialCardsStyles.css';


const SpecialCards = () => {
    return (
        <div className="rectangle-rank-container">
            <img className="ranks" src="src/assets/diamond.svg"></img>
            <img className="ranks" src="src/assets/spade.svg"></img>
            <img className="ranks" src="src/assets/heart.svg"></img>
            <img className="ranks" src="src/assets/club.svg"></img>
        </div>
        
    )
}

export default SpecialCards;