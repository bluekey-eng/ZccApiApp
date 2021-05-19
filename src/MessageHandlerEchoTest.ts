
import { log, offLog, onLog, receiveLog } from './log';
import { Messages } from './messages';
import { SocketClient } from './Socket/client'
// const zccIp = '192.168.0.95';
const zccIp = '172.20.10.11'
const zccPort = 5003;
const MESSAGE_LIMIT = 200;

interface IMessageData {
    sent: Date, received?: Date
}


enum States {
    INIT,
    SENDING,
    WAITING,

}

export class MessageHandlerEchoTest {

    private clientSocket: SocketClient;
    private messageList: Map<number, IMessageData>;
    private counter = 0;
    private messagesInParrellel = 2;
    private state: States = States.INIT;
    constructor() {
        this.clientSocket = new SocketClient(zccIp, zccPort);
        this.messageList = new Map();
        this.receiveMessage.bind(this);
        this.messageReceiveHandler.bind(this);
        this.messageSendHandler.bind(this)
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
        const strMessage = Buffer.from(message).toString()

        const splitMessages = strMessage.split('\n');
        splitMessages.forEach(splitMessage => {
            if( splitMessage.trim() !== ''){

                try {
                    const jsonMessage = JSON.parse(splitMessage);
                    
                    receiveLog('received message: ')
                    receiveLog(splitMessage);
                    this.messageReceiveHandler(jsonMessage)
                } catch (err) {
                    receiveLog('received message non json: ')
                    receiveLog(splitMessage);
                }
            }
        })
    }

    private messageSendHandler() {

        if (this.state === States.SENDING) {

            if (this.counter < MESSAGE_LIMIT) {
                for (let i = 0; i < this.messagesInParrellel; i++) {
                    setTimeout(() => {
                        this.counter++;
                        this.messageList.set(this.counter, { sent: new Date(Date.now()) })
                        this.clientSocket.sendData(Messages.getEchoMessage(this.counter));
                    }, 200 * i)
                }
            } else {
                this.state = States.WAITING;
                this.displayMessagesStored()
            }
        }

    }

    private wait(timeout: number) {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, timeout)
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
                    this.messageList.set(receivedCounter, messageStored)
                    this.displayMessage(receivedCounter, messageStored)
                }
            }
            setTimeout(() => {
                this.messageSendHandler();

            }, 500)

            if (this.counter % 100 === 0) {
                this.displayMessagesStored()
            }

            if( this.state === States.WAITING){
                this.displayMessagesStored()
            }
        }
    }

    public displayMessagesStored() {
        log('MessageList')
        this.messageList.forEach((map, key) => {
            this.displayMessage(key, map)
        })
    }

    private displayMessage(key: number, message: IMessageData) {
        if (message.received) {
            onLog(JSON.stringify({ key, message }));
        } else {
            offLog(JSON.stringify({ key, message }));
        }
    }

    public run() {
        this.initComms()
            .then(() => {
                this.state = States.SENDING;
                this.messageSendHandler();
            })
    }
}