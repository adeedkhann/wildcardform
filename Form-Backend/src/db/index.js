import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async() =>{
    try{
       const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`\n DataBase Connected \n DB HOST= ${connectionInstance.connection.host}`);
    }
    catch(error){
        console.log("MongoDB Connection Error",error); 
        process.exit(0);
    }
}

export default connectDB