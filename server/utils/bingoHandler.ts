import type {Socket, Namespace} from "socket.io";

export function handleBingoEvents(socket: Socket, io: Namespace) {
    console.log(`User connected to lobby: ${socket.id}`);

    socket.on("activateBingo", (rowIndex: number, columnIndex: number, id: string, color: string) => {
        io.emit("activateBingoResponse", rowIndex, columnIndex, id, color);
    })

    socket.on('disconnect', () => {
        console.log(`User disconnected from lobby: ${socket.id}`);
        // No explicit action needed here to stop the physics loop,
        // as it will stop automatically when the dice settle.
    });
}