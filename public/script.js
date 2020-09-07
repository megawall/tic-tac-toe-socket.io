// constants
let socket=io()
const login=document.getElementById('login')
const gamepage=document.getElementById('gamepage')
const restart=document.getElementById('restart')

const STARTED = 0
const ENDED = 1
let flag=true;

const name=prompt("Enter your name");
const room=prompt("Enter room name");
if(name!==null && room!==null){
    socket.emit('join',{name,room},(err)=>{
        if(err){
            console.log(err);
            alert(err);
            location.reload();
        }
    })
}
// HTML elements
const playerSpan = document.getElementById('player')
const gameTable = document.getElementById('game')

const game = {
  state: STARTED,
  turn: 'X',
  move: 0
}

function endGame(winner) {
    if (winner) {
        alert('Game Over | Winner = ' + winner)
    } else {
        alert('Game Over | Draw')
    }
    game.state = ENDED
}

function nextTurn() {
    if (game.state === ENDED) return
    
    game.move++
    if (game.turn === 'X') game.turn = 'O'
    else game.turn = 'X'

    if (game.move == 9) {
        endGame()
    }

    playerSpan.textContent = game.turn
}

function isSeqCaptured(arrayOf3Cells) {
    let winnningCombo = game.turn + game.turn + game.turn
    if (arrayOf3Cells.map(i => i.textContent).join('') === winnningCombo) {
        endGame(game.turn)
    }
}

function isRowCaptured(row) {
    let tableRow = Array.from(gameTable.children[0].children[row - 1].children)
    isSeqCaptured(tableRow)
}
function isColCaptured(col) {
    let tableCol = [
        gameTable.children[0].children[0].children[col - 1],
        gameTable.children[0].children[1].children[col - 1],
        gameTable.children[0].children[2].children[col - 1]
    ]
    isSeqCaptured(tableCol)
}
function isDiagCaptured(row, col) {
    if (row !== col && (row + col) !== 4) return
    let diag1 = [
        gameTable.children[0].children[0].children[0],
        gameTable.children[0].children[1].children[1],
        gameTable.children[0].children[2].children[2]
    ]
    let diag2 = [
        gameTable.children[0].children[0].children[2],
        gameTable.children[0].children[1].children[1],
        gameTable.children[0].children[2].children[0]
    ]
    isSeqCaptured(diag1)
    isSeqCaptured(diag2)


}
socket.on('response',({mess})=>{
    alert(mess);
});

function boxClicked(row, col) {
  if (game.state === ENDED) {
    alert('Game Ended | Restart to Play Again')
    return
  }
  //console.log('box clicked = ', row, col)
  if(flag){
        socket.emit('box_clicked',{row,col},(err)=>{
            if(err){
                console.log(err);
                alert(err);
                location.reload();
            }
        });
    }
}
socket.on('box-clicked',({f})=>{
    console.log(f);
    flag=f;
    if(!flag)
        socket.emit('yours',{},(err)=>{
            if(err){
                alert(err);
                location.reload();
            }
        });
});
socket.on('operation',({data})=>{
    console.log('hii')
    let clickedBox = gameTable.children[0].children[data.row - 1].children[data.col - 1]
    clickedBox.textContent = game.turn
    isRowCaptured(data.row)
    isColCaptured(data.col)
    isDiagCaptured(data.row, data.col)
    console.log(game.move)
    nextTurn()
    
})
restart.onclick=function(){
    socket.emit('restart',{},()=>{
        if(err){
            alert(err);
            location.reload();
        }
    })
}
socket.on('restart',()=>{
    game.turn = 'X'
    flag=true;
    playerSpan.textContent = game.turn
    game.state = STARTED
    game.move = 0

    Array.from(document.getElementsByTagName('td')).forEach(cell => {
        cell.textContent = ''
    })
})

