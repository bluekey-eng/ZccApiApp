import * as net from 'net';
import { offLog, sendLog } from '../log';

export class SocketClient {

	private clientSocket: net.Socket;
	private ip: string;
	private port: number;

	private aliveHandler: any;
	private onDataCallback: (data: any) => {};
	private onReconnectCallback: () => {};
	private status :  'init' | 'connected' | 'error' | 'reconnecting' | 'disconnected'

	constructor(ip: string, port: number) {
		this.ip = ip;
		this.port = port;
		this.status = 'init';
	}

	public close() {
		this.clientSocket.end();
	}

	public connect() {
		return this.connectInternal()
			.then(ret => {
			})

	}

	private connectInternal() {
		return new Promise<void>((resolve, reject) => {
			let socket = new net.Socket();
			try {
				console.log(`Connecting to ${this.ip}: ${this.port} `)
				const newSocket = socket.connect(this.port,
					this.ip, () => {
						console.log(`connected to ${this.ip} : ${this.port}`);
						this.clientSocket = newSocket;
						this.status = 'connected'
						this.handleErrorEvents();
						this.runAliveHandler();

						resolve();
					})
			} catch (error) {
				this.status = 'disconnected'
				reject(error);
			}
		});
	}

	private handleErrorEvents() {
		// this.clientSocket.on('close', () => {
		// 	console.log('Socket closed');
		// 	this.setupReconnect()
		// });

		this.clientSocket.on('error', () =>{
			this.status = 'error'
			console.log('socket error');
			this.setupReconnect();
			if(this.aliveHandler){
				clearInterval(this.aliveHandler);
			}
		})
	}

	private runAliveHandler(){
		if( this.status === 'connected'){

			 this.aliveHandler = setInterval( () =>{
				this.sendData({})
			}, 30000)
		}
	}

	private async setupReconnect() {
		// this.clientSocket.on('close', () => {
			console.log('setting up reconnect');

			const setIntervalHandler = setInterval(() => {

				this.status = 'reconnecting'
				this.connectInternal()
					.then(() => {
						this.onData(this.onDataCallback)
						clearInterval(setIntervalHandler)
						this.reConnected()
					})
			}, 10000)


		
	}

	public onData(callback: any) {
		if (this.onDataCallback) {
			this.clientSocket.removeListener('data', this.onDataCallback);
		}
		this.onDataCallback = callback;
		this.clientSocket.on('data', (data: any) => {
			// console.log('Received data - ' + data)
			this.onDataCallback(data);
		})
	}

	public onReconnect( callback: any){
		this.onReconnectCallback = callback;
	}

	private reConnected(){
		this.onReconnectCallback();
	}

	// public ontimeout(callback: any) {
	// 	this.clientSocket.on('timeout', () => {
	// 		callback();
	// 	})
	// }

	public removeAllListeners() {
		this.clientSocket.removeAllListeners();
	}

	// public removeOnData(callback: any) {
	// 	this.clientSocket.removeListener('data', callback)
	// }

	public sendData(message: object) {
		const stringMessage = JSON.stringify(message);
		sendLog('sending - ' + stringMessage)
		this.clientSocket.write(stringMessage + '\r\n'
			// ,
			// (err) => {
			// 	if (!err) {
			// 		sendLog('sent - ' + message)
			// 	} else {
			// 		offLog('send error - ' + message)
			// 	}
			// }
		);
	}

	public setTimeout(timeout: number) {
		this.clientSocket.setTimeout(timeout);
	}
}
