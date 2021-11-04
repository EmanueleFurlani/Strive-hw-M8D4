import createHttpError from "http-errors";
import atob from "atob"
import AuthorModel from "../services/authors/schema.js"

export const basicAuthMiddleware = async (req, res, next) => {
 // "cop that looks at your id-license"
    console.log("BASIC AUTH MIDDLEWARE")
    console.log(req.headers)

    if (!req.headers.authorization) {
        next(createHttpError(401, "Provide credentials in Auth. header!"))
    } else {
        const decodedCredentials = atob(req.headers.authorization.split(" ")[1])
        const [email, password] = decodedCredentials.split(":")

        console.log("EMAIL ", email)
        console.log("PASSWORD ", password)

        const author = await AuthorModel.checkCredentials(email, password)
        
        if (author) {
        req.author = author

            next()
        } else {
            next(createHttpError(401, "Credentials are not correct!"))
        }
    }
}