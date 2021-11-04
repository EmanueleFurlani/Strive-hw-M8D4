import mongoose from "mongoose"
import Authors from "../authors/schema.js"

const {Schema, model} = mongoose

const BlogPostSchema = new Schema({
  category: { type: String, required: true},
  title: { type: String, required: true},
  cover: { type: String, required: true},
  readTime: {
      value: { type: Number, min: 1, max: 65, required: true },
      unit: { type: String, required: true }
  },
  content: { type: String, required: true },
  comments: [{
      comment: String,
      rate: Number,
      commentedOn: Date,
  }],
   authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],
}, { 
  timestamps: true
})

BlogPostSchema.pre("save", async function (next){
  try {
    const IsExist = await Authors.findById(this.authors)
    if(IsExist) {
      next()
    } else {
      const error = new Error("this Author does not exist")
      error.status = 400
      next (error)
    }
    
  } catch (error) {
    next(error)
  }
})

export default model("BlogPost", BlogPostSchema)