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

    bingoField = [
        [
            {text: "Überfahre einen Radfahrer", doneBy: []},
            {text: "Schaue durch ein Fernglas am Observatorium", doneBy: []},
            {text: "Klaue einen Cargocob", doneBy: []},
            {text: "Versenke ein Golfcart im Wasser", doneBy: []},
            {text: "Kletter auf einen Vinewood Buchstaben", doneBy: []},
        ],
        [
            {text: "Verprügel einen Gärtner", doneBy: []},
            {text: "Stirb durch einen elektrischen Schock", doneBy: []},
            {text: "Betrete die Mine", doneBy: []},
            {text: "Betrete den Kontrollraum des Military Towers", doneBy: []},
            {text: "Bewirf eine Polizeistation mit Tränengas", doneBy: []},
        ],
        [
            {text: "Erreiche ein Fahndungslevel von 4", doneBy: []},
            {text: "Finde einen Pool ohne Wasser", doneBy: []},
            {text: "Verbrenne einen Traktor", doneBy: []},
            {text: "Finde eine Kuh, ein Schwein und ein Huhn", doneBy: []},
            {text: "Fahre einen Obstand um", doneBy: []},
        ],
        [
            {text: "Überquere mit einem Boot den Alamosee - Sandy Shores", doneBy: []},
            {text: "Parke ein Taxi auf Michals Grundstück", doneBy: []},
            {text: "Fahre 1x um den Entensee - Vinewood Hills", doneBy: []},
            {text: "Mache Yoga auf einer Theaterbühne", doneBy: []},
            {text: "Betrete ein Containerschiff", doneBy: []},
        ],
        [
            {text: "Klaue ein Cabrio", doneBy: []},
            {text: "Parke auf einem Basketballfeld", doneBy: []},
            {text: "Fahre zwei Runden auf der Pferderennbahn", doneBy: []},
            {text: "Erschiße jemand verkleideten bei den Filmstudios", doneBy: []},
            {text: "Schaffe einen Monsterstunt", doneBy: []},
        ],
    ];
}

function reset() {
    fillBingo();
}

fillBingo()

export function handleBingoEvents(socket: Socket, io: Namespace) {
    console.log(`User connected to lobby: ${socket.id}`);

    socket.emit("bingoField", bingoField)

    socket.on("activateBingo", (rowIndex: number, columnIndex: number, id: string, color: string) => {
        if (color == "") {
            console.error("color is undefined!")
            socket.emit("error", `color is undefined!`)
            return;
        }

        if (bingoField[rowIndex]![columnIndex]!.doneBy.length >= 2) {
            console.error("zu oft")
            socket.emit("error", `zu oft!`)
            return;
        }

        if (bingoField[rowIndex]![columnIndex]!.doneBy.length == 1 && bingoField[rowIndex]![columnIndex]!.doneBy[0].id == id) {
            console.error("du selbst");
            socket.emit("error", `du selbst!`)
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

    const AUTO_MARK_INTERVAL = 4 * 60 * 1000;

    function autoMarkRandomField(io: Namespace, color: string) {
        const emptyOrNotFullCells: { row: number; col: number }[] = [];

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                const doneByColors = bingoField[i][j].doneBy.map(p => p.color);
                if (!doneByColors.includes("yellow") && bingoField[i][j].doneBy.length < 2) {
                    emptyOrNotFullCells.push({row: i, col: j});
                }
            }
        }

        if (emptyOrNotFullCells.length === 0) return;

        const randomIndex = Math.floor(Math.random() * emptyOrNotFullCells.length);
        const {row, col} = emptyOrNotFullCells[randomIndex];

        const id = "auto" + color;

        bingoField[row][col].doneBy.push({id, color});
        io.emit("activateBingoResponse", row, col, id, color);
    }

    setInterval(() => {
        autoMarkRandomField(io, "red");
        autoMarkRandomField(io, "green");
    }, AUTO_MARK_INTERVAL);

}