import * as net from 'net';
import { offLog, sendLog } from '../log';

export class SocketClient {

	private clientSocket: net.Socket;
	private ip: string;
	private port: number;

	constructor(ip: string, port: number) {
		this.ip = ip;
		this.port = port;
	}

	public close() {
		this.clientSocket.end();
	}

	public connect() {
		return new Promise<void>((resolve, reject) => {
			let socket = new net.Socket();
			try {
				// console.log(`Connecting to ${this.ip}: ${this.port} `)
				this.clientSocket = socket.connect(this.port,
					 this.ip, () => {
					console.log(`connected to ${this.ip} : ${this.port}`);
					resolve();
				})
			} catch (error) {
				reject(error);
			}
		});
	}

	public onClose(callback: any) {
		this.clientSocket.on('close', () => {
			// console.log('Connection closed');
			callback();
			return;
		});
	}

	public onData(callback: any) {
		this.clientSocket.on('data', (data: any) => {
			// console.log('Received data - ' + data)
			callback(data);
		})
	}

	public ontimeout(callback: any) {
		this.clientSocket.on('timeout', () => {
			callback();
		})
	}

	public removeAllListeners() {
		this.clientSocket.removeAllListeners();
	}

	public removeOnData(callback: any) {
		this.clientSocket.removeListener('data', callback)
	}

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
