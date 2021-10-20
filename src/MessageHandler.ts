import { DeviceList } from './Devices/DeviceList';
import { log, receiveLog, receiveBuffLog } from './log';
import { Messages } from './messages';
import { SocketClient } from './Socket/client'
// const zccIp = '192.168.0.95';
// const zccIp = '172.20.10.11'
// const zccIp = '192.168.1.139'
const zccIp = '10.0.0.31';
const zccPort = 5003;

enum States {
    PRE_STARTSESSION,
    POST_STARTSESSION,
    PRE,
    REQUEST_PROPERTIES,
    REQUESTED_PROPERTIES,
    RECEIVE_PROPERTIES,
    REQUEST_ACTIONS,
    REQUESTED_ACTIONS,
    RECEIVE_ACTIONS,
    REQUEST_STATES,
    REQUESTED_STATES,
    RECEIVE_STATES,
    REQUEST_STATE_EVENTS,
    REQUESTED_STATE_EVENTS,
    RECEIVE_STATE_EVENTS,
    RECEIVED_STATE_EVETS,
    SENT_TOGGLE_ACTION,

}
export class MessageHandler {

    private clientSocket: SocketClient;
    private state: States;
    private deviceList: DeviceList;
    private messageBuffer: string;
    constructor() {
        this.clientSocket = new SocketClient(zccIp, zccPort)
        this.deviceList = new DeviceList();
        this.receiveMessage.bind(this);
        this.messageReceiveHandler.bind(this);
        this.messageSendHandler.bind(this)
        this.state = States.PRE_STARTSESSION;
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

    private messageSendHandler() {
        switch (this.state) {
            case States.PRE_STARTSESSION:
                this.clientSocket.sendData(Messages.startSessionMessage())
                this.state = States.POST_STARTSESSION;
                break;
            case States.PRE:
                // this.clientSocket.sendData(Messages.getCPPropertiesMessage())
                // this.state = States.REQUESTED_PROPERTIES;
                break;
            case States.RECEIVE_PROPERTIES:
                // this.clientSocket.sendData(Messages.getCPActionsMessage());
                // this.state = States.REQUEST_ACTIONS;

                // this.clientSocket.sendData(Messages.getCPStateMessage());
                // this.state = States.REQUESTED_STATES;

                break;
            case States.RECEIVE_ACTIONS:
                this.clientSocket.sendData(Messages.getCPStateMessage());
                this.state = States.REQUESTED_STATES;
                break;
            case States.RECEIVE_STATES:
                // this.clientSocket.sendData(Messages.getCPStateSubscribeMessage());
                // this.state = States.REQUESTED_STATE_EVENTS;
                break;
            case States.RECEIVE_STATE_EVENTS:
                // this.setTimeout(10000).then(() => {
                if (this.state === States.RECEIVE_STATE_EVENTS) {

                    // setInterval(() => {

                    //     this.deviceList.displayDeviceStatus();

                    //     // const actions = this.deviceList.toggleOnOffMessages();
                    //     // this.clientSocket.sendData(Messages.getCPSetActions(actions));



                    //     // actions.forEach(action =>{
                    //     //     this.clientSocket.sendData(Messages.getCPSetActions([action]));
                    //     // })


                    //     const actions = this.deviceList.toggleOnOffAllMessages(true);
                    //     this.clientSocket.sendData(Messages.getCPSetActions(actions));
                    //     setTimeout(() => {
                    //         const actions = this.deviceList.toggleOnOffAllMessages(false);
                    //         this.clientSocket.sendData(Messages.getCPSetActions(actions));
                    //     }, 30000)

                    // }, 10000)
                }
                this.state = States.RECEIVED_STATE_EVETS;

                // })
                break;
            case States.SENT_TOGGLE_ACTION:

                break;

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

            if (responseData.start_session_success) {
                this.state = States.PRE;
                this.clientSocket.sendData(Messages.getCPPropertiesMessage())
                this.state = States.REQUESTED_PROPERTIES;
            }
            if (responseData.controlpoint_properties) {
                responseData.controlpoint_properties.forEach((devProps: any) => {
                    this.deviceList.addDevice(devProps.id)
                    this.deviceList.setDeviceProps(devProps.id, devProps.properties)
                })

                if (this.state === States.REQUESTED_PROPERTIES) {
                    // this.state = States.RECEIVE_PROPERTIES;

                    this.clientSocket.sendData(Messages.getCPStateMessage());
                    this.state = States.REQUESTED_STATES;
                }
            }
            else if (responseData.controlpoint_actions) {
                if (this.state === States.REQUEST_ACTIONS) {
                    this.state = States.RECEIVE_ACTIONS;
                }
            }
            else if (responseData.controlpoint_states) {

                const states = responseData.controlpoint_states;
                states.forEach((devStates: any) => {
                    this.deviceList.addDevice(devStates.id)
                    this.deviceList.setDeviceStates(devStates.id, devStates.states)
                })

                this.deviceList.displayDeviceStatus()
                if (this.state === States.REQUESTED_STATES) {
                    // this.state = States.RECEIVE_STATES

                    this.clientSocket.sendData(Messages.getCPStateSubscribeMessage());
                    this.state = States.REQUESTED_STATE_EVENTS;
                }
            }
            else if (responseData.controlpoint_states_events) {
                responseData.controlpoint_states_events.forEach((devStates: any) => {
                    this.deviceList.addDevice(devStates.id)
                    this.deviceList.setDeviceStates(devStates.id, devStates.states)
                })
                this.deviceList.displayDeviceStatus();
                if (this.state === States.REQUESTED_STATE_EVENTS) {
                    this.state = States.RECEIVE_STATE_EVENTS;

                    setInterval(() => {

                        this.deviceList.displayDeviceStatus();

                        // const actions = this.deviceList.toggleOnOffMessages();
                        // this.clientSocket.sendData(Messages.getCPSetActions(actions));



                        // actions.forEach(action =>{
                        //     this.clientSocket.sendData(Messages.getCPSetActions([action]));
                        // })


                        const actions = this.deviceList.toggleOnOffAllMessages(true);
                        this.clientSocket.sendData(Messages.getCPSetActions(actions));
                        setTimeout(() => {
                            const actions = this.deviceList.toggleOnOffAllMessages(false);
                            this.clientSocket.sendData(Messages.getCPSetActions(actions));
                        }, 10000)

                    }, 20000)
                }
            }

            // this.messageSendHandler();
        }
    }

    public run() {
        this.initComms()
            .then(() => {
                this.messageSendHandler();
            })
    }
}