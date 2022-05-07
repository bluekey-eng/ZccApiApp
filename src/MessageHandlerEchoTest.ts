
import { log, offLog, onLog, receiveLog, receiveBuffLog } from './log';
import { Messages } from './messages';
import { SocketClient } from './Socket/client'
// const zccIp = '192.168.0.95';
// const zccIp = '172.20.10.11'
const zccIp = '192.168.1.105'
const zccPort = 5003;
const MESSAGE_LIMIT = 200;
const MESSAGES_IN_PARRALLEL = 2;

interface IMessageData {
    sent: Date, received?: Date, responseTime?: number
}


enum States {
    INIT,
    SENDING,
    WAITING,

}

export class MessageHandlerEchoTest {

    private clientSocket: SocketClient;
    private counter = 0;
    private messageBuffer: string;
    private messageList: Map<number, IMessageData>;
    private messagesInParrellel = MESSAGES_IN_PARRALLEL;
    private state: States = States.INIT;
    constructor() {
        this.clientSocket = new SocketClient(zccIp, zccPort);
        this.messageList = new Map();
        this.receiveMessage.bind(this);
        this.messageReceiveHandler.bind(this);
        this.messageSendHandler.bind(this);
        this.messageBuffer = ''
    }

    private displayMessage(key: number, message: IMessageData) {
        if (message.received) {
            onLog(JSON.stringify({ key, message }));
        } else {
            offLog(JSON.stringify({ key, message }));
        }
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

    private messageReceiveHandler(message: any) {

        if (message) {
            const responseData = message.response;
            const receivedCounter = responseData?.request?.body?.counter;
            if (receivedCounter !== undefined) {
                const messageStored = this.messageList.get(receivedCounter);
                if (messageStored) {
                    messageStored.received = new Date(Date.now())
                    messageStored.responseTime = Date.now() - ( messageStored.sent).getTime() ;
                    this.messageList.set(receivedCounter, messageStored)
                    this.displayMessage(receivedCounter, messageStored)
                }
            }
            setTimeout(() => {
                this.messageSendHandler();

            }, 100)

            if( this.state === States.WAITING){
                this.displayMessagesStored()
            }
        }
    }

    private messageSendHandler() {

        if (this.state === States.SENDING) {

            if (this.counter < MESSAGE_LIMIT) {
                for (let i = 0; i < this.messagesInParrellel; i++) {
                    setTimeout(() => {
                        this.counter++;

                        if (this.counter % 100 === 0) {
                            this.displayMessagesStored()
                        }
                        
                        this.messageList.set(this.counter, { sent: new Date(Date.now()) })
                        this.clientSocket.sendData(Messages.getEchoMessage(this.counter));
                    }, 200 * i)
                }
            } 
            else {
                this.state = States.WAITING;
                this.displayMessagesStored()
            }
        }

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

    private wait(timeout: number) {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, timeout)
        })
    }

    public displayMessagesStored() {
        log('MessageList')
        this.messageList.forEach((map, key) => {
            this.displayMessage(key, map)
        })
    }

    public run() {
        this.initComms()
            .then(() => {
                this.state = States.SENDING;
                this.messageSendHandler();
            })
    }
}