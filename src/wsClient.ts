import { WebSocket } from "ws";


const run = () => {

    const host =  'ws://localhost:8080'
    const ws = new WebSocket(host);

    ws.on('message', (data)=>{
        console.log( 'message : ' + data.toString())
    })

    ws.on('error', (err)=>{
        console.error( 'ws error ' + err.message)
    })
}


run();