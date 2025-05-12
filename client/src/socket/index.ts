import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
    transports: ['websocket', 'polling'],
});

export default socket;
