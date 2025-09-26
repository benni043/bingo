import type {Socket, Namespace} from "socket.io";
import {ref} from "vue";

export type Bingo = {
    text: string;
    doneBy: Player[];
};

export type Player = {
    id: string;
    color: string;
};

let bingoField: Bingo[][] = [];

function fillBingo() {
    const field: Bingo[][] = [];
    for (let i = 0; i < 5; i++) {
        field[i] = [];
        for (let j = 0; j < 5; j++) {
            field[i]![j] = {text: ((j + 1) + (5 * i)).toString(), doneBy: []};
        }
    }

    bingoField = field;
}

function reset() {
    fillBingo();
}

fillBingo()

export function handleBingoEvents(socket: Socket, io: Namespace) {
    console.log(`User connected to lobby: ${socket.id}`);

    socket.emit("bingoField", bingoField)

    socket.on("activateBingo", (rowIndex: number, columnIndex: number, id: string, color: string) => {
        if (bingoField[rowIndex]![columnIndex]!.doneBy.length >= 2) {
            console.error("stop")
            return;
        }

        bingoField[rowIndex]![columnIndex]!.doneBy.push({
            id: id,
            color: color,
        });

        io.emit("activateBingoResponse", rowIndex, columnIndex, id, color);
    })

    socket.on("reset", () => {
        reset();
        io.emit("bingoField", bingoField)
    })

    socket.on('disconnect', () => {
        console.log(`User disconnected from lobby: ${socket.id}`);
    });
}