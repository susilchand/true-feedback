import mongoose from "mongoose";

type ConnectionObject = {

    isConnected?: number

}
const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {

    if (connection.isConnected) {
        console.log("Aleary Connected to Database");
        return
    }

    try {
        const db = await mongoose.connect(process.env.MoNGODB_URI || '', {})

        connection.isConnected = db.connections[0].readyState;
        console.log("DB Connected Successfully");

    } catch (error) {

        console.log("DataBase connection failed",error);
        process.exit(1)
        
    }

}
export default dbConnect