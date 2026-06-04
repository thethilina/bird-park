import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async ()=>{

const connection = mongoose.connection.readyState;

if(connection === 1 ) {
    console.log("Already Connected");
    return;
}

if(connection === 2) {
    console.log("Connecting...");
}

try{

mongoose.connect(MONGODB_URI! , {

    dbName:'Bird-Park',
    bufferCommands:true 
});

}catch(e : any){

console.log("Error: " ,e);
throw new Error(e);
}

}

export default connect;