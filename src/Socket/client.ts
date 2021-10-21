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

	public onData(callback: any) {
		this.clientSocket.on('data', (data: any) => {
			// console.log('Received data - ' + data)
			callback(data);
		})
	}

	public onClose(callback: any) {
		this.clientSocket.on('close', () => {
			// console.log('Connection closed');
			callback();
			return;
		});
	}

	public removeOnData(callback: any) {
		this.clientSocket.removeListener('data', callback)
	}

	public sendData(message: string) {
		sendLog('sending - ' + message)
		this.clientSocket.write(message + '\r\n'
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

	public close() {
		this.clientSocket.end();
	}

	public setTimeout(timeout: number) {
		this.clientSocket.setTimeout(timeout);
	}

	public ontimeout(callback: any) {
		this.clientSocket.on('timeout', () => {
			callback();
		})
	}

	public removeAllListeners() {
		this.clientSocket.removeAllListeners();
	}

}
