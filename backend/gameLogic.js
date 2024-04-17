const SUITS = ["C", "H", "S", "D"];
const RANKS = ["2", "3", "4", "5", "6", "7", "J", "Q", "K", "A"];
const SCALE = ["3", "2", "A", "K", "J", "Q", "7", "6", "5", "4"];

class gameLoop {
    deck = [];
    playerOne = "";
    playerTwo = "";

    playerOneHand = [];
    playerTwoHand = [];
    // will add 2 more players when get 1 v 1 working

    gameBoard = [];

    teamOneScore = 0;
    teamTwoScore = 0;

    p1Rounds = [-1, -1, -1];
    p2Rounds = [-1, -1, -1];

    // -1 -> current player turn
    // 0 -> next player turn 
    // [p1, p2, p3, p4] -> [-1, 0, 0, 0]
    playerTurn = [-1, 0];

    specialCard = {};
    turnCard = {};

    roomNumber = -1;


    constructor(playerOne, playerTwo, deck) {
        this.playerOne = playerOne;
        this.playerTwo = playerTwo;
        this.deck = deck;
    }

    getPlayerOne = () => {
        return this.playerOne;
    }

    getPlayerTwo = () => {
        return this.playerTwo;
    }

    setPlayerOne = (user) => {
        this.playerOne = user;
    }

    setPlayerTwo = (user) => {
        this.playerTwo = user;
    }

    getTeamOneScore = () => {
        return this.teamOneScore;
    }

    setTeamOneScore = (score) => {
        this.teamOneScore = score;
    }

    getTeamTwoScore = () => {
        return this.teamTwoScore;
    }

    setTeamTwoScore = (score) => {
        this.teamTwoScore = score;
    }

    setRounds = (round) => {
        this.rounds = round;
    }

    getDeck = () => {
        return this.deck;
    }

    getPlayerOneHand = () => {
       return this.playerOneHand;
    }

    getPlayerTwoHand = () => {
        return this.playerTwoHand;
    }

    setPlayerOneHand = (hand) => {
       
        this.playerOneHand = hand;
    }

    setPlayerTwoHand = (hand) => {
        this.playerTwoHand = hand;
    }



    createDeck = () => {
        const n = SUITS.length * RANKS.length;
        let x = 0;
        let counterForObj = 0;
        
        let deckArr = [];
       // console.log(n);
    
        for(let i = 0; i < 1; i++) {
            for(let j = 0; j < SUITS.length; j++) {
                for(let k = 0; k < RANKS.length; k++) {
                    const obj = {rank: RANKS[k], suit: SUITS[j], key: counterForObj++};
                    
                   // x++;
    
                   
    
              
    
            //  setDeck((arr) => [...arr, <Card rank={rank[k]} suit={suit[j]} key={++x} selected={select} selectChange={changeSelect}/>]);
              deckArr.push(obj);
              //setDeck((arr) => [...arr, obj]);
            }
          }
        }
        console.log(deckArr);
        this.deck = deckArr;
        return deckArr;
    }

    shuffleDeck = () => {
        
        let k = 0;
      //  console.log('This is deck before shuffling...');
      //  console.log(this.deck);
        let tempDeck = [...this.deck];
    
      //  console.log("This is temp deck");
      //  console.log(tempDeck);
      //  console.log('This is deck...');
      //  console.log(deck);
    
    
        for(let i = 0; i < 1; i++) {
            for(let j = 0; j < tempDeck.length; j++) {
                k = Math.floor(Math.random() * tempDeck.length);
                let temp = tempDeck[j];
                tempDeck[j] = tempDeck[k];
                tempDeck[k] = temp;
            }
        }
        
        this.deck = tempDeck;
        return tempDeck;
    }


    dealPlayerOne = () => {
        // start from the "top" which is the end of the array
        let deckCounter = this.deck.length - 1;
        let loopVariable = 3;
        while(loopVariable > 0) {
            const card = this.deck.pop();
            
            this.playerOneHand.push(card);
            loopVariable--;
        }
    }

    dealPlayerTwo = () => {
        let deckCounter = this.deck.length - 1;
        let loopVariable = 3;
        while(loopVariable > 0) {
            const card = this.deck.pop();
            this.playerTwoHand.push(card);
            loopVariable--;
        }
    }

    dealTurnCard = (deck) => {
        this.turnCard = deck.pop();
        console.log(`--------------------`);
        console.log(this.turnCard);
        console.log(`-----------------------`);
        return this.turnCard;
    }
    // special card is next rank, suit priority is D,S,H,C
    dealSpecialCard = () => {
       const turnCardRank = this.turnCard.rank;
       const turnCardSuit = this.turnCard.suit;

       console.log(`turnCardRank: ${turnCardRank}`);
       console.log(typeof turnCardRank);
       let turnCardObject = {}; // rank: 2

       switch(turnCardRank) {
            case "2": 
               turnCardObject = {rank: "3", suit: "D"};
               break;
            case "3":
                turnCardObject = {rank: "4", suit: "D"};
                break;
            case "4":
                turnCardObject = {rank: "5", suit: "D"};
                break;   
            case "5": 
                turnCardObject = {rank: "6", suit: "D"};
                break;
            case "6":
                turnCardObject = {rank: "7", suit: "D"};
                break;
            case "7":
                turnCardObject = {rank: "8", suit: "D"};
                break;
            case "J":
                turnCardObject = {rank: "Q", suit: "D"};
                break;
            case "Q":
                turnCardObject = {rank: "K", suit: "D"};
                break;
            case "K":
                turnCardObject = {rank: "A", suit: "D"};
                break;
            case "A":
                turnCardObject = {rank: "2", suit: "D"};
                break;
            default: 
                turnCardObject = {};

       }

       this.specialCard = turnCardObject;
       console.log(this.turnCard);

        return this.specialCard;
    }

    // Highest -> Lowest: 3, 2, A, K, J, Q, 7, 6, 5, 4
    // [3, 2, A, K, J, Q, 7, 6, 5, 4]
    // (4, A) (A, 4)
    // compare the indices 
    // (2, 9) -> 2
    // card1 index is lower than card2 index -> card2 is greater
    // tie 
    // parameters are of type "string", compare 
    compareCardsRank = (cardOneRank, cardTwoRank) => {
        // tie
        if(cardOneRank === cardTwoRank) {
            return -1;
        }

        const findCardRank1 = (element) => element === cardOneRank;
        const findCardRank2 = (element) => element === cardTwoRank;

        const cardOneIndex = SCALE.findIndex(findCardRank1);
        const cardTwoIndex = SCALE.findIndex(findCardRank2);

        const res = Math.min(cardOneIndex, cardTwoIndex);

        return SCALE[res];

    }

    checkWinnerRound = (board) => {
        const tempGameboard = board;
        const size = this.gameBoard.length;

        // {user, rank, suit}
        const cardOne = tempGameboard[0];
        const cardTwo = tempGameboard[1];
        console.log(tempGameboard);
        console.log(cardOne);
        console.log(cardTwo)

        const cardWinner = this.compareCardsRank(cardOne.rank, cardTwo.rank);

        if(cardWinner === cardOne.rank) {
            return cardOne;
        } else if(cardWinner === cardTwo.rank) {
            return cardTwo;
        }

        // in event of a tie return a fake card
        const fakeTieCard = {user: "tie", rank: cardOne.rank};
        return fakeTieCard;
    }


}

export default gameLoop;