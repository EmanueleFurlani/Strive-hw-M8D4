import mongoose from 'mongoose'

const {Schema, model} = mongoose

const commentSchema = new Schema({
  comment: { type: String, required: true},
  rate: { type: Number, required: true}  
}, { 
  timestamps: true 
})

export default model("comment", commentSchema)