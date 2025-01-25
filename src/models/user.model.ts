import mongoose, { Document, Schema } from 'mongoose'

interface IUser extends Document {
  username: string
  email: string
  password: string
  image?: string
  searchHistory?: string[]
}

const userSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  searchHistory: {
    type: [String],
    default: []
  }
})

export const User = mongoose.model<IUser>('User', userSchema)
