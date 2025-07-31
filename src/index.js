// require('dotenv').config({path:"./env"})  ye nhi krenge 
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path : "./env"
})

connectDB()
// yha hm ab promise ko handdle krrenge by .then and catch se 
.then(()=>{
    app.listen(process.env.PORT || 8000,(port)=>{
        console.log(`DataBase  is listing at port : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGIDB connection Failed : ",err);
    
})











/*
import express from "express";

const app = express()

    // now hme ab  yha pe connect krna h db ko 
    // use ifii ki turnt run ho jayega

    (async () => {
        // yha hmesa try and catch me hi handdle krna hoga
        try {
            await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`)
            //  and isme ye bhi h ki hme end me aaona db ka name add krna hota h

            // kbhi kbhi data base connect hotit hi i[uski algi linne ] app bhiaa jata h
            app.on("error", (error) => {
                console.log("error", error);
                throw error
            })

            app.listen(process.env.PORT, () => {
                console.log(`port is listening on port ${process.env.PORT}`)
            })
        }
        catch (error) {
            console.error("ERROR : ", error);
            throw error
        }
    })()
        */