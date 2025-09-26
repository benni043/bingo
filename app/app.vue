<script setup lang="ts"> import {io} from "socket.io-client";
import {ref} from "vue";

const socket = io("/bingo", {path: "/api/socket.io",});
export type Bingo = { text: string; doneBy: Player[]; };
export type Player = { id: string; color: string; };
const myColor = ref("");
const bingoField = ref<Bingo[][]>([]);

function fillBingo() {
  const field: Bingo[][] = [];
  for (let i = 0; i < 5; i++) {
    field[i] = [];
    for (let j = 0; j < 5; j++) {
      field[i]![j] = {text: ((j + 1) + (5 * i)).toString(), doneBy: []};
    }
  }
  bingoField.value = field;
}

fillBingo();
socket.on("bingoField", (field: Bingo[][]) => {
  bingoField.value = field;
})

function activateBingo(rowIndex: number, columnIndex: number) {
  socket.emit("activateBingo", rowIndex, columnIndex, socket.id, myColor.value);
}

socket.on("activateBingoResponse", (rowIndex: number, columnIndex: number, id: string, color: string) => {
  bingoField.value[rowIndex]![columnIndex]!.doneBy.push({id: id, color: color,});
});

function getCellStyle(rowIndex: number, columnIndex: number) {
  const doneBy = bingoField.value[rowIndex]![columnIndex]!.doneBy;

  if (doneBy.length === 0) return {};

  if (doneBy.length === 1) return {backgroundColor: doneBy[0]!.color};

  if (doneBy.length === 2) {
    const [c1, c2] = [doneBy[0]!.color, doneBy[1]!.color];
    return {background: `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`};
  }

  console.error("error");
  return {};
}

function reset() {
  socket.emit("reset");
} </script>
<template>
  <div>
    <div class="color-picker"><label> Choose your color: <input v-model="myColor" type="color"> </label></div>
    <div class="bingo-board">
      <div v-for="(bingoRow, rowIndex) in bingoField" :key="rowIndex" class="bingo-row">
        <button v-for="(elem, columnIndex) in bingoRow" :key="columnIndex" class="bingo-cell"
                :style="getCellStyle(rowIndex, columnIndex)" @click="activateBingo(rowIndex, columnIndex)"> {{
            elem.text
          }}
        </button>
      </div>
    </div>
    <button @click="reset()">Reset</button>
  </div>
</template>

<style scoped>
.color-picker {
  margin-bottom: 12px;
}

.bingo-board {
  display: grid;
  grid-template-rows: repeat(5, 1fr);
  gap: 4px;
  width: 400px;
  height: 400px;
}

.bingo-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.bingo-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border: 1px solid #333;
  cursor: pointer;
  color: white;
  font-weight: bold;
} </style>