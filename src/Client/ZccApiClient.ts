import { ZimiEvents } from "../Events/ZimiEvents";
import { SocketClient } from "../Socket/client";
import { AppStorage } from "../Storage/AppStorage";
import { log, receiveLog, receiveBuffLog } from '../log';
import { ZccApiProcessor } from "./ZccApiProcessor";


export interface IZccApiClientConfig{
    zccIp: string;
    zccPort: number;
    zccMac: string;
}
export class ZccApiClient{
    private clientSocket: SocketClient;
    private messageBuffer: string;
    private zimiEventEmitter: ZimiEvents;
    private apiProcessor: ZccApiProcessor;

    constructor( config: IZccApiClientConfig ){
        this.clientSocket = new SocketClient( config.zccIp, config.zccPort);
        this.zimiEventEmitter = new ZimiEvents();
        this.apiProcessor = new ZccApiProcessor(this.zimiEventEmitter, config.zccMac);
        this.messageBuffer = '';
    }

    private initComms() {
        return new Promise<void>((resolve, reject) => {


            const receiveHandler = this.receiveMessage.bind(this)
            this.clientSocket.connect()
                .then(() => {
                    this.clientSocket.onData(receiveHandler)
                    resolve()
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    private receiveMessage(message: Buffer) {
        const strMessage = Buffer.from(message).toString();
        receiveBuffLog('received data : ');
        receiveBuffLog(strMessage);
        this.messageBuffer += strMessage;
        if (this.messageBuffer !== '' && this.messageBuffer.includes('\r\n')) {

            const splitMessages = this.messageBuffer.split('\r\n');
            this.messageBuffer = this.messageBuffer.slice(this.messageBuffer.lastIndexOf('\r\n'))
            splitMessages.forEach(splitMessage => {
                if (splitMessage.trim() !== '') {

                    try {
                        const jsonMessage = JSON.parse(splitMessage);

                        receiveLog('received message: ')
                        receiveLog(splitMessage);

                        this.messageReceiveHandler(jsonMessage)
                    } catch (err) {
                        receiveLog('received message non json: ' + err)
                        receiveLog(splitMessage);
                    }
                }
            })
        }
    }

    private messageReceiveHandler(message: any) {

        if (message) {
            const responseData = message.response;

            if (responseData.auth_app_success) {
                this.zimiEventEmitter.receiveApiMessage(message, 'auth_app_success');
            }

            if (responseData.start_session_success) {
                this.zimiEventEmitter.receiveApiMessage(message, 'start_session_success');
            }

            if (responseData.controlpoint_properties) {
                this.zimiEventEmitter.receiveApiMessage(message, 'properties');
            }

            if (responseData.controlpoint_actions) {

            }
            
            if (responseData.controlpoint_states) {
                this.zimiEventEmitter.receiveApiMessage(message, 'states');
            }
            
            if (responseData.controlpoint_states_events) {
                this.zimiEventEmitter.receiveApiMessage(message, 'state_events');
            }

        }
    }

    private sendMessage( message: string){
        this.clientSocket.sendData(message)
    }

    private receiveEvents() {
        this.zimiEventEmitter.onSendApiMessage((message, messageType) => {
            this.sendMessage( message);
            // receiveLog(`onReceiveApiMessage ${messageType} , ${JSON.stringify(message)}`)
        })
    }

    public run() {
        this.initComms()
            .then(() => {
                this.receiveEvents();
                // this.messageSendHandler();
                this.apiProcessor.run();
            })
            .catch(err => {
                log('connection failed ' + err.message)
            })
    }
}