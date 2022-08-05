import { ZimiEvents } from "../Events/ZimiEvents";
import { SocketClient } from "../Socket/client";
import { AppStorage } from "../Storage/AppStorage";
import { log, receiveLog, receiveBuffLog } from '../log';
import { ZccApiProcessor } from "./ZccApiProcessor";
import { threadId } from "worker_threads";


export interface IZccApiClientConfig {
    zccIp: string;
    zccPort: number;
    zccMac: string;
}
export class ZccApiClient {
    private apiProcessor: ZccApiProcessor;
    private clientSocket: SocketClient;
    private messageBuffer: string;
    // private zccApiConfig: IZccApiClientConfig;
    private zimiEventEmitter: ZimiEvents;
    constructor(config: IZccApiClientConfig) {

        // this.zccApiConfig = config;
        this.clientSocket = new SocketClient(config.zccIp, config.zccPort);
        this.zimiEventEmitter = new ZimiEvents();
        this.apiProcessor = new ZccApiProcessor(this.zimiEventEmitter, config.zccMac);
        this.messageBuffer = '';
    }

    private initComms() {
        return new Promise<void>((resolve, reject) => {

            const receiveHandler = this.receiveMessage.bind(this)
            this.clientSocket.connect()
                .then(() => {
                    this.clientSocket.onData(receiveHandler);
                    this.clientSocket.onReconnect(() => {
                        this.initZccApiSession();
                    })
                    resolve()
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    private initZccApiSession() {
        this.apiProcessor.initSession();
        setTimeout(() => {
            this.apiProcessor.requestDetails();
        }, 2000)
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
                this.zimiEventEmitter.receiveApiMessage(message, 'actions');
            }

            if (responseData.controlpoint_states) {
                this.zimiEventEmitter.receiveApiMessage(message, 'states');
            }

            if (responseData.controlpoint_states_events) {
                this.zimiEventEmitter.receiveApiMessage(message, 'state_events');
            }

        }
    }

    private receiveEvents() {
        this.zimiEventEmitter.onSendApiMessage((message, messageType) => {
            this.sendMessage((message));
            // receiveLog(`onReceiveApiMessage ${messageType} , ${JSON.stringify(message)}`)
        })
    }

    private receiveMessage(message: Buffer) {
        const strMessage = Buffer.from(message).toString();
        // receiveBuffLog('received data : ');
        // receiveBuffLog(strMessage);
        this.messageBuffer += strMessage;
        if (this.messageBuffer !== '' && this.messageBuffer.includes('\r\n')) {

            const splitMessages = this.messageBuffer.split('\r\n');
            this.messageBuffer = this.messageBuffer.slice(this.messageBuffer.lastIndexOf('\r\n'))
            splitMessages.forEach(splitMessage => {
                if (splitMessage.trim() !== '') {

                    try {
                        const jsonMessage = JSON.parse(splitMessage);

                        // receiveLog('received message: ')
                        // receiveLog(splitMessage);

                        this.messageReceiveHandler(jsonMessage)
                    } catch (err) {
                        receiveLog('received message non json: ' + err)
                        receiveLog(splitMessage);
                    }
                }
            })
        }
    }

    private sendMessage(message: object) {
        this.clientSocket.sendData(message)
    }

    private stopComms() {
        this.clientSocket.close();
        this.apiProcessor.stop();
        this.clientSocket.removeAllListeners();
    }

    private stopEvents() {
        this.zimiEventEmitter.removeAllListeners();
    }

    public getEventEmitter(): ZimiEvents {
        return this.zimiEventEmitter
    }

    public requestDetails() {
        this.apiProcessor.requestDetails();
    }

    public requestProperties(){
        this.apiProcessor.requestProperties();
    }

    public requestState(){
        this.apiProcessor.requestState();
    }


    public run() {
        return this.initComms()
            .then(() => {
                this.receiveEvents();
                // this.messageSendHandler();
                this.apiProcessor.run();
                return;
            })
            .catch(err => {
                log('connection failed ' + err.message)
            })
    }

    public runInitSession() {
        return this.initComms()
            .then(() => {
                this.receiveEvents();
                this.apiProcessor.runInitSession();
                return;
            })
            .catch(err => {
                log('connection failed ' + err.message)
            })
    }

    public stop() {
        this.stopComms();
        this.stopEvents();
    }
}