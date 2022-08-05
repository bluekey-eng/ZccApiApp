import * as net from 'net';
import { offLog, sendLog } from '../log';

export class SocketClient {
	private aliveHandler: any;
	private clientSocket: net.Socket;
	private ip: string;
	private onDataCallback: (data: any) => {};
	private onReconnectCallback: () => {};
	private port: number;
	private status :  'init' | 'connected' | 'error' | 'reconnecting' | 'disconnected'

	constructor(ip: string, port: number) {
		this.ip = ip;
		this.port = port;
		this.status = 'init';
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

		this.clientSocket.on('close', () =>{
			this.stopAliveHandler()
		})

		this.clientSocket.on('end' , () =>{
			this.stopAliveHandler()
		})
	}

	private reConnected(){
		this.onReconnectCallback();
	}

	private runAliveHandler(){
		if( this.status === 'connected'){

			 this.aliveHandler = setInterval( () =>{
				this.sendData({})
			}, 30000)
		}
	}

	private stopAliveHandler(){
		if(this.aliveHandler){
			clearInterval(this.aliveHandler)
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

	public close() {
		this.stopAliveHandler();
		this.clientSocket.end();
	}

	public connect() {
		return this.connectInternal()
			.then(ret => {
			})

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
		// sendLog('sending - ' + stringMessage)
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
