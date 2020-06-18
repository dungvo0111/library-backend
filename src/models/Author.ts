import mongoose, { Document } from 'mongoose'

export type AuthorDocument = Document & {
  name: string;
  dateOfBirth: Date;
  nationality: string;
  books: [string];
}

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  nationality: {
    type: String,
    required: true,
  },
  books: {
    type: { String },
    required: true,
  },
})

export default mongoose.model<AuthorDocument>('Author', authorSchema)
