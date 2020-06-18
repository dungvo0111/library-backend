import mongoose, { Document } from 'mongoose'

type Status = 'available' | 'borrowed'

type ISBN = '^(97(8|9))?d{9}(d|X)$'

export type BookDocument = Document & {
  ISBN: ISBN;
  title: string;
  description: string;
  publisher: string;
  author: [string];
  status: Status;
  genres: [string];
  borrowerId?: string;
  publishedDate: Date;
  borrowedDate?: Date;
  returnedDate?: Date;
}

const bookSchema = new mongoose.Schema({
  ISBN: {
    type: String,
    validate: /^(97(8|9))?\d{9}(\d|X)$/,
    index: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  publisher: {
    type: String,
  },
  author: {
    type: [String],
    required: true,
  },
  genres: {
    type: [String],
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'borrowed'],
    default: 'available',
  },
  borrowerId: {
    type: String,
  },
  publishedDate: {
    type: Date,
    required: true,
    min: 1900,
  },
  borrowedDate: {
    type: Date,
  },
  returnedDate: {
    type: Date,
  },
})

export default mongoose.model<BookDocument>('Book', bookSchema)
