import createHttpError from "http-errors";
import { verifyJWT } from "./tools.js";
import AuthorModel from "../services/authors/schema.js"

export const JWTAuthMiddleware = async (req, res, next) => { // CHECK ALWAYS HOW YOU WRITE MIDDLE!!!!!!!!
  // 1. Check if Authorization header is received, if it is not --> trigger an error (401)
  if (!req.headers.authorization) {
    next(createHttpError(401, "Please provide credentials in Authorization header!"))
  } else {
    try {
      // 2. Extract the token from the Authorization header (authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTUyZjMzNzdhNWVlYmRlMDhkZThhZjkiLCJpYXQiOjE2MzI5MDU3MTN9.FL17SFz1zSGXbMnsLNxbFrnlgCxU8-FtaTnxbiQr-XM)
      const token = req.headers.authorization.replace("Bearer ", "")
      // 3. Verify token, if it goes fine we'll get back the payload ({_id: "oijoij12i3oj23"}), otherwise an error is being thrown by the jwt library
      const decodedToken = await verifyJWT(token)
      console.log(decodedToken)
      // 4. Find the author in db by id and attach him to req.author
      const author = await AuthorModel.findById(decodedToken._id)
      console.log(decodedToken._id)
      if (author) {
        req.author = author
        next()
      } else {
        next(createHttpError(404, "Author not found!"))
      }
    } catch (error) {
      next(createHttpError(401, "Token not valid!"))
    }
  }
}