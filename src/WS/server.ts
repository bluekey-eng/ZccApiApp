
import { WebSocketServer } from 'ws'
import { ZimiEvents } from '../Events/ZimiEvents';
import { log } from '../log';

export class WSServer {


    private wsServer: WebSocketServer;
    private eventEmitter: ZimiEvents;

    constructor(port: number, eventEmitter: ZimiEvents) {
        this.eventEmitter = eventEmitter;

        this.wsServer = new WebSocketServer({ port })

        this.wsServer.on('connection', (ws, request) => {

            log('wsServer connection ' )

            ws.on('message', (messageRaw) => {
                log('ws message received - ' + messageRaw.toString())

                // TODO message json validation check
                this.eventEmitter.sendApiMessage( JSON.parse( messageRaw.toString()), 'auth_app');
            })

            this.eventEmitter.onReceiveApiMessage( (message , messageType) =>{
                ws.send( JSON.stringify(message) );
            })


            this.eventEmitter.onSendApiMessage( (message , messageType) =>{
                ws.send( JSON.stringify(message) );
            })

            // ws.send('connected')
        })
    }

    public run() {
    }
}