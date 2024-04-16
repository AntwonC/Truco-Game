class gameObject {
    userTable = [];

    constructor(userTable) {
        this.userTable = userTable;
    }

    getUsersOnTable = () => {
        console.log(`Getting users from on table...`)
        for(let i = 0; i < this.userTable.length; i++) {
            const userObject = this.userTable[i];
            console.log(userObject);
        }

        return this.userTable;
    }

    findUserOnTable = (user, roomNumber) => {
        for(let i = 0; i < this.userTable.length; i++) {
            const userObject = this.userTable[i];
            console.log(userObject);

            if(userObject.name === user && roomNumber === userObject.room) {
                return true;
            }
        }

        return false;
    }

    addUserOnTable = (user, roomNumber) => {
        console.log(`Adding ${user} to user table...`);
        this.userTable.push({name: user, room: roomNumber});
        console.log(`Sucessfully added ${user} to table!`);
    }

    removeUserOnTable = (user, room) => {

        for(let i = 0; i < this.userTable.length; i++) {
            const userObject = this.userTable[i];
    
            if(userObject.name === user && userObject.room === room) {
                this.userTable.splice(i, 1);
            }
        } 

        console.log(this.userTable);
    }

    findUserSlotOnTable = (user, room) => {
    
        for(let i = 0; i < this.userTable.length; i++) {
            const userObject = this.userTable[i];
    
            if(userObject.name === user && userObject.room === room) {
                
                return userObject.slot;
                
            }
        } 
    
        return -1;
    }
}
export default gameObject;