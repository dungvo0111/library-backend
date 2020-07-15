import mongoose, { Document } from 'mongoose'
import { BookDocument } from './Book'

export type UserDocument = Document & {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin: boolean;
  borrowingBooks: Partial<BookDocument>[];
  returnedBooks: Partial<BookDocument>[];
}

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  borrowingBooks: {
    type: [Object],
  },
  returnedBooks: {
    type: [Object],
  },
})

export default mongoose.model<UserDocument>('User', userSchema)
