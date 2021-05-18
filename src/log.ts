import chalk = require('chalk');

const log = ( message: string) =>{
    console.log( `${ new Date(Date.now() ).toISOString() } : ${message}`);
} 

const sendLog = (message: string) => log(chalk.yellow(message));
const receiveLog = (message: string) => log(chalk.blue(message));

const onLog = (message: string) => log(chalk.green(message));
const offLog = (message: string) => log(chalk.red(message));

export { log, sendLog, receiveLog, onLog, offLog };