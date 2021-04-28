import { MessageHandler } from "./MessageHandler"

const run = async () =>{
    const msgHandler = new MessageHandler();
    msgHandler.run();
}

run();