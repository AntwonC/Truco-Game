import { useState, useEffect } from 'react';



const Card = ({ suit, rank, id, onClick, click}) => {

    const [counter, setCounter] = useState(0);

    const [backgroundOn, setBackgroundOn] = useState(false);

    
    


    const convertRankToInt = (rank) => {
        switch(rank) {
            case "2":
                return parseInt("2");
                
            case "3":
                return parseInt("3");
                
            case "4":
                return parseInt("4");
                
            case "5":
                return parseInt("5");
                
            case "6":
                return parseInt("6");
                
            case "7":
                return parseInt("7");
                    
            case "8":
                return parseInt("8");

            case "9":
                return parseInt("9");

            case "10": 
                return parseInt("10");

            case "A":
                return "A";
            
            case "J":
                return "J";

            case "Q":
                return "Q";

            case "K":
                return "K";

            default: 
                return "Did not code for face cards yet";
        }
    }

    const checkSuit = (suit) => {
        switch(suit) {
            case "C": 
                return "&clubs";

            case "H":
                return "&hearts";
            
            case "D":
                return "&diams";

            case "S":
                return "&spades";
        }
    }

    const incrementCount = () => {
        setCounter(prevValue => prevValue + 1);
    }



    const createPips = () => {
        const arr = [];

        let counter = 1;
        let letter = "A";

        const numberRank = convertRankToInt(rank);
        const suitSymbol = checkSuit(suit);

        if(numberRank === "A") {
            arr.push((<div key={counter} className="pip"></div>));
          //  incrementCount();
        } else if(numberRank === "J") {
            arr.push((<div key={counter} className="pip"></div>)); 
           // incrementCount();
        } else if(numberRank === "Q") {
            arr.push((<div key={counter} className="pip"></div>));   
           // incrementCount();
        } else if(numberRank === "K") {
            arr.push((<div key={counter} className="pip"></div>));
           // incrementCount();
        } else {
            for(let i = 0; i < numberRank; i++) {
                arr.push((<div key={counter} className="pip"></div>));
                counter++;
            }
           // incrementCount();
        }


        let result = arr.map((item) => {
            <div key={item} className="pip"></div>
        })

        return arr;


    }

    const cardClicked = () => {
        setBackgroundOn(!backgroundOn);
     /*   if(selected === false) {
            selectChange(true);
        } else {
            selectChange(false);
        } */
      //  console.log(selected);
    }

    const changeSelect = () => {

    }
  //  console.log(suit);
   // console.log(rank);

   

    return (
        <>
        { click ?

       ( <div className="card" data-suit={suit} data-value={rank} onClick={onClick}>

            {createPips()}
            
            
            <div className="corner-number top">{rank}</div>
            <div className="corner-number bottom">{rank}</div>
            

        </div>) 
        
        :
        
        (<div className="bg-card" onClick={cardClicked}></div>)
        }
        </>
       
    )
}

export default Card;