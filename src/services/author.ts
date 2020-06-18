import Author, { AuthorDocument } from '../models/Author'
import { InternalServerError } from '../helpers/apiError'

function add(author: AuthorDocument): Promise<AuthorDocument> {
  return author.save()
}

function updateAuthor(
  authorId: string,
  update: Partial<AuthorDocument>
): Promise<AuthorDocument> {
  return Author.findById(authorId).then((author) => {
    if (!author) {
      throw new Error('Author not found')
    }
    if (update.name) {
      author.name = update.name
    }
    if (update.dateOfBirth) {
      author.dateOfBirth = update.dateOfBirth
    }
    if (update.nationality) {
      author.nationality = update.nationality
    }
    if (update.books) {
      author.books = update.books
    }
    return author.save()
  })
}

function deleteAuthor(authorId: string): Promise<AuthorDocument | null> {
  return Author.findByIdAndDelete(authorId)
    .exec()
    .then((author) => {
      if (!author) {
        throw new Error('Author not found')
      }
      return author
    })
    .catch((err) => {
      throw new InternalServerError()
    })
}

export default { add, updateAuthor, deleteAuthor }
