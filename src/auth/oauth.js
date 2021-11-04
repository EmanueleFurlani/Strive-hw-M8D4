import passport from "passport"
import GoogleStrategy from "passport-google-oauth20"
import AuthorModel from "../services/authors/schema.js"
import  {JWTAuthenticate} from "./tools.js"

//console.log(`${process.env.API_URL}/authors/googleRedirect`) ty Luis :D
const googleStrategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_OAUTH_ID,
    clientSecret: process.env.GOOGLE_OAUTH_SECRET,
    callbackURL: `${process.env.API_URL}/authors/googleRedirect`,
}, 
async (accessToken, refreshToken, googleProfile, passportNext) => { // callback function executed when Google gives us a response (provide from google)
 console.log(googleProfile) // we' re receiving some profile information from Google
try {
     // 1 check if user is already in our db
 const author = await AuthorModel.findOne({googleId: googleProfile.id}) 

 // 2 if user is already there just create token for him/her
if (author) {
  const token = await JWTAuthenticate(author)
   passportNext(null, { token })
}  // 3 if it is not there we're add user tu our db and create token for him/her
else {
 const newAuthor = {
     name: googleProfile.name.givenName,
     surname: googleProfile.name.familyName,
     email: googleProfile.emails[0].value,
     googleId: googleProfile.id
    }
        const createdAuthor = new AuthorModel(newAuthor)
        const savedAuthor = await createdAuthor.save()
        const token = await JWTAuthenticate(savedAuthor)

        passportNext(null, {authors: savedAuthor, token}) // this function is very similar to next(), it helps us passing data to what is coming next (googleRedirect route handler)
     } // first parameter should be error, second what you want to pass
} catch (error) {
    passportNext(error)
    }
  }                         
)

// with this operation when i "console.log(req.user)" for example in the route i have to write .user
passport.serializeUser(function (data, passportNext){  // (for passing a what is coming next)
passportNext(null, data)
})  // OR -------------->       Error: Failed to serialize user into session 


export default googleStrategy