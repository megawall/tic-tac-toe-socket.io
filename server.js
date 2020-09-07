const express=require('express')
const app=express()
const http=require('http')
const socketio=require('socket.io')
const PORT=process.env.PORT || '2345';
const { addUser, removeUser, getUser, getUsersInRoom } =require('./users')

const server=http.createServer(app)
const io=socketio(server)

app.use('/', express.static(__dirname + '/public'))

io.on('connect',(socket)=>{
    console.log('connected with socket id =', socket.id)
    socket.on('join',({name,room},callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });
        console.log(user)
        if(error) return callback(error);
        socket.join(user.room);
        socket.broadcast.to(user.room).emit('response',{mess: `${user.name}, has joined`});
        callback();
    });

    socket.on('box_clicked',({row,col},callback)=>{
        const {err,user}=getUser(socket.id);
        //console.log(user)
        if(err)
            return callback(err);
        socket.emit('box-clicked',{f:false});
        const data={
            row: row,
            col: col
        }
        io.to(user.room).emit('operation',{data,user});
    });
    socket.on('yours',()=>{
        const user=getUser(socket.id);
        socket.broadcast.to(user.room).emit('box-clicked',{f:true});
    });
    socket.on('restart',()=>{
        const user=getUser(socket.id);
        //console.log(user) 
        io.to(user.room).emit('restart',{});
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        console.log('Disconnected');
        if(user) {
            socket.broadcast.to(user.room).emit('response', {mess: `${user.name} has left.` });
            //io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
    });
})

server.listen(PORT,()=>{
    console.log(`Server started at ${PORT}:`)
})