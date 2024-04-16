import { Server } from 'http';
import { io } from 'socket.io-client';


/*const socketServer = new Server({
    cors: {
        origin: "http://localhost:4000"
    }
}); */

//socketServer.listen(4000);

export  const socketServer = io('http://localhost:5000', {
    autoConnect: false,
    cors: {
        origin: 'http://localhost:5000'
    }
});