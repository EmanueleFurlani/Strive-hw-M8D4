import express from "express"
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"
import cors from "cors"
import blogPostsRouter from "./services/blogPosts/index.js"
import { notFoundHandler, badRequestHandler, genericErrorHandler, unauthorizedHandler, forbiddenHandler } from "./errorHandlers.js"
import authorsRouter from "./services/authors/index.js"
import googleStrategy from "./auth/oauth.js"
import passport from "passport"

const server = express()
const port = process.env.PORT || 3003

//modify to try
passport.use("google", googleStrategy)

server.use(express.json())
server.use(cors())
server.use(passport.initialize())

server.use("/blogPosts", blogPostsRouter)
server.use("/authors", authorsRouter)


server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(forbiddenHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)


mongoose.connect(process.env.CON_MONG)
mongoose.connection.on("connected", ()=>{
    console.log("Successfully connect to Mango!")
    server.listen(port, ()=>{
        console.table(listEndpoints(server))
        console.log("Server is pretty coooooool!")
    })
})
mongoose.connection.on("error", err => {
  console.log("MONGO ERROR: ", err)
})