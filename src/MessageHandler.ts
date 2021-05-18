import { DeviceList } from './Devices/DeviceList';
import { log, receiveLog } from './log';
import { Messages } from './messages';
import { SocketClient } from './Socket/client'
// const zccIp = '192.168.0.95';
const zccIp = '172.20.10.11'
const zccPort = 5003;

enum States {
    PRE,
    REQUEST_PROPERTIES,
    RECEIVE_PROPERTIES,
    REQUEST_ACTIONS,
    RECEIVE_ACTIONS,
    REQUEST_STATES,
    RECEIVE_STATES,
    REQUEST_STATE_EVENTS,
    RECEIVE_STATE_EVENTS,
    SENT_TOGGLE_ACTION,

}
export class MessageHandler {

    private clientSocket: SocketClient;
    private state: States;
    private deviceList: DeviceList;
    constructor() {
        this.clientSocket = new SocketClient(zccIp, zccPort)
        this.deviceList = new DeviceList();
        this.receiveMessage.bind(this);
        this.messageReceiveHandler.bind(this);
        this.messageSendHandler.bind(this)
        this.state = States.PRE;
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
        switch (this.state) {
            case States.PRE:
                this.clientSocket.sendData(Messages.getCPPropertiesMessage())
                this.state = States.REQUEST_PROPERTIES;
                break;
            case States.RECEIVE_PROPERTIES:
                this.clientSocket.sendData(Messages.getCPActionsMessage());
                this.state = States.REQUEST_ACTIONS;
                break;
            case States.RECEIVE_ACTIONS:
                this.clientSocket.sendData(Messages.getCPStateMessage());
                this.state = States.REQUEST_STATES;
                break;
            case States.RECEIVE_STATES:
                this.clientSocket.sendData(Messages.getCPStateSubscribeMessage());
                this.state = States.REQUEST_STATE_EVENTS;
                break;
            case States.RECEIVE_STATE_EVENTS:
                this.state = States.SENT_TOGGLE_ACTION;
                // this.setTimeout(10000).then(() => {
                setInterval(() => {

                    this.deviceList.displayDeviceStatus();
                    // const actions = this.deviceList.toggleOnOffMessages();
                    // this.clientSocket.sendData(Messages.getCPSetActions(actions));

                    // actions.forEach(action =>{
                    //     this.clientSocket.sendData(Messages.getCPSetActions([action]));
                    // })

                    const actions = this.deviceList.toggleOnOffAllMessages(true);
                    this.clientSocket.sendData(Messages.getCPSetActions(actions));
                    setTimeout(  () => {
                        const actions = this.deviceList.toggleOnOffAllMessages(false);
                        this.clientSocket.sendData(Messages.getCPSetActions(actions));
                    }, 10000)

                }, 30000)
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
            if (States.REQUEST_PROPERTIES && responseData.controlpoint_properties) {
                responseData.controlpoint_properties.forEach((devProps: any) => {
                    this.deviceList.addDevice(devProps.id)
                    this.deviceList.setDeviceProps(devProps.id, devProps.properties)
                })
                this.state = States.RECEIVE_PROPERTIES;
            }
            else if (States.REQUEST_ACTIONS && responseData.controlpoint_actions) {
                this.state = States.RECEIVE_ACTIONS;
            }
            else if (responseData.controlpoint_states) {
                responseData.controlpoint_states.forEach((devStates: any) => {
                    this.deviceList.addDevice(devStates.id)
                    this.deviceList.setDeviceStates(devStates.id, devStates.states)
                })

                this.deviceList.displayDeviceStatus()
                if (this.state = States.REQUEST_STATES) {
                    this.state = States.RECEIVE_STATES
                }
            }
            else if (responseData.controlpoint_states_events) {
                responseData.controlpoint_states_events.forEach((devStates: any) => {
                    this.deviceList.addDevice(devStates.id)
                    this.deviceList.setDeviceStates(devStates.id, devStates.states)
                })
                this.deviceList.displayDeviceStatus();
                if (this.state === States.REQUEST_STATE_EVENTS) {
                    this.state = States.RECEIVE_STATE_EVENTS;
                }
            }

            this.messageSendHandler();
        }
    }

    public run() {
        this.initComms()
            .then(() => {
                this.messageSendHandler();
            })
    }
}