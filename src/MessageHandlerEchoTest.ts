
import { log, offLog, onLog, receiveLog } from './log';
import { Messages } from './messages';
import { SocketClient } from './Socket/client'
// const zccIp = '192.168.0.95';
const zccIp = '172.20.10.11'
const zccPort = 5003;

interface IMessageData {
    sent: Date, received?: Date
}

export class MessageHandlerEchoTest {

    private clientSocket: SocketClient;
    private messageList: Map<number, IMessageData>;
    private counter = 0;
    private messagesInParrellel = 2;
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
        try {
            const jsonMessage = JSON.parse(strMessage);

            receiveLog('received message: ')
            receiveLog(strMessage);
            this.messageReceiveHandler(jsonMessage)
        } catch (err) {

        }
    }

    private messageSendHandler() {


        for (let i = 0; i < this.messagesInParrellel; i++) {

            setTimeout(() => {
                this.counter++;
                this.messageList.set(this.counter, { sent: new Date(Date.now()) })
                this.clientSocket.sendData(Messages.getEchoMessage(this.counter));
            }, 200*i)
        }

    }

    private setTimeout(timeout: number) {
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
            this.messageSendHandler();

            if (this.counter % 100 === 0) {
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
                this.messageSendHandler();
            })
    }
}