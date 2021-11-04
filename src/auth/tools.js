import jwt from "jsonwebtoken"


export const JWTAuthenticate = async (author) => { // given the author the function gives back the accesstoken
    const accessToken = await generateJWT({ _id: author._id})
    return accessToken
}


// generate token

const generateJWT = (payload) => 
new Promise((res, rej) =>
jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1 week"}, (err, token) =>{
    if (err) rej (err)
    else res (token)
})
)

// verify token

    export const verifyJWT = token =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) rej(err)
      else res(decodedToken)
    })
  )