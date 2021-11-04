import express from "express"
import q2m from "query-to-mongo"
import AuthorModel from "./schema.js"
import { basicAuthMiddleware } from "../../auth/basic.js"
import BlogModel from "../blogPosts/schema.js";
import {JWTAuthenticate} from "../../auth/tools.js"
import { JWTAuthMiddleware } from "../../auth/token.js"
import createHttpError from "http-errors";
import passport from "passport";

const AuthorsRouter = express.Router()

AuthorsRouter.post("/", async (req, res, next)=>{
    try {
        const newAuthor = new AuthorModel(req.body)
        const { _id } =await newAuthor.save()
        res.status(201).send({_id})
        
    } catch (error) {
        next(error)
    }
})

// AuthorsRouter.get("/", async (req, res, next) => {
//   try {
//     const query = q2m(req.query)

//     const total = await AuthorModel.countDocuments(query.criteria)
//     const authors = await AuthorModel.find(query.criteria, query.options.fields)
//       .limit(query.options.limit)
//       .skip(query.options.skip)
//       .sort(query.options.sort)

//     res.send({ links: query.links("/authors", total), total, authors, pageTotal: Math.ceil(total / query.options.limit) })
//   } catch (error) {
//     next(error)
//   }
// })

AuthorsRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const authors = await AuthorModel.find()
    res.send(authors)
  } catch (error) {
    next(error)
  }
})
 // http://localhost:3003/authors/googleLogin <---- use for try if it works

AuthorsRouter.get("/googleLogin", passport.authenticate("google", {scope: ["profile", "email"]}) ) // this endp receives google login request from our FE e redirects them to google
AuthorsRouter.get("/googleRedirect", passport.authenticate("google"), async(req, res, next) =>{ // we are going to receive the token gere thanks to the passportNext function
  try {
    console.log(req.user)
    // res.send(req.user)
    res.redirect(`http://localhost:3000?accessToken=${req.user.token}`) //<--- try with fe (no cookies at the moment)
  } catch (error) {
    next (error)
  }
}) // this one receives the response from google

AuthorsRouter.get("/me/stories", async (req, res, next) => {
  try {
    
    const posts = await BlogModel.find({ authors: req.author._id })
    console.log("ID ->", req.author._id)
    res.status(200).send(posts)

  } catch (error) {
    next(error)
  }
})

AuthorsRouter.get("/:authorId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const author = await AuthorModel.findById(req.params.authorId)
    res.send(author)
  } catch (error) {
    next(error)
  }
})




// route for having the token ( a post with the credentials email:password) --- first things after the fe login (1° part of be flow)
// this route is ONLY for create the token, after that for verifies and validy we need the "JWTAuthMiddeleware" that verify if every request is match correctly

AuthorsRouter.post("/login", async (req, res, next) => {  // if i try to "post" with the wrong pass or email it return me the 401 error "credential are not ok!"
  try {
    const { email, password } = req.body
    // 1. Verify credentials
    const author = await AuthorModel.checkCredentials(email, password)
    if (author) {
      // 2. If everything is ok we are going to generate an access token
      const accessToken = await JWTAuthenticate(author)
      // 3. Send token back as a response
      res.send({accessToken}) // we can have e proper object <--- here we have the exp, iat and _id of author
    } else {
      // 4. If credentials are not ok we are sending an error (401)
      next(createHttpError(401, "Credentials are not ok!"))
    }
  } catch (error) {
    next(error)
  }
})

export default AuthorsRouter