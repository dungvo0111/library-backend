import Book from '../../src/models/Book'
import BookService from '../../src/services/book'
import UserService from '../../src/services/user'
import User from '../../src/models/User'
import * as dbHelper from '../db-helper'

const nonExistingBookISBN = '9781161484100'
const invalidFormatISBN = '123456'

async function createBook() {
    const book = new Book({
        ISBN: '9783161484100',
        title: 'The last dance',
        description: 'Great book about Michael Jordan',
        publisher: 'Jordan',
        author: ['Jordan', 'Pippen', 'Rodman'],
        genres: ['sport', 'documentary'],
        publishedDate: new Date("2020 02 01"),
    })
    return await BookService.create(book)
}

describe('book service', () => {
    beforeEach(async () => {
        await dbHelper.connect()
    })

    afterEach(async () => {
        await dbHelper.clearDatabase()
    })

    afterAll(async () => {
        await dbHelper.closeDatabase()
    })

    it('should create a book', async () => {
        const book = await createBook()

        expect(book).toHaveProperty('_id')
        expect(book).toHaveProperty('title', 'The last dance')
        expect(book).toHaveProperty('publisher', 'Jordan')
    })

    it('should get all books', async () => {
        const book1 = await createBook()
        const book2 = new Book({
            ISBN: '9783161484101',
            title: 'The last dance 2',
            description: 'Great book about Michael Jordan',
            publisher: 'Jordan',
            author: ['Jordan', 'Pippen', 'Rodman'],
            genres: ['sport', 'documentary'],
            publishedDate: new Date("2020 02 01"),
        })
        await BookService.create(book2)

        const books = await BookService.findAll()
        expect(books).toHaveLength(2)
        expect(books[0].title).toEqual('The last dance')
    })

    it('should return book(s) matching filters', async () => {
        const book1 = await createBook()
        const book2 = new Book({
            ISBN: '9783161484101',
            title: 'The last dance 2',
            description: 'Great book about Michael Jordan',
            publisher: 'Netflix',
            author: ['Pippen', 'Rodman'],
            genres: ['sport', 'documentary'],
            publishedDate: new Date("2020 02 01"),
        })
        await BookService.create(book2)

        const filterPayload1 = {
            title: 'The last dance'
        }
        const filterPayload2 = {
            status: 'available'
        }

        const filtered1 = await BookService.filtering(filterPayload1)
        const filtered2 = await BookService.filtering(filterPayload2)
        expect(filtered1).toHaveLength(1)
        expect(filtered1[0].title).toEqual('The last dance')
        expect(filtered2).toHaveLength(2)
        expect(filtered2[1].title).toEqual('The last dance 2')
    })

    it('should not return any book(s) with unmatched filters', async () => {
        expect.assertions(1)
        const book = await createBook()
        const filterPayload = {
            title: 'The last dance 2'
        }

        return BookService.filtering(filterPayload).catch(e => {
            expect(e.message).toMatch(`Books not found`)
        })
    })

    it('should return a book with matching ISBN', async () => {
        const book = await createBook()
        const found = await BookService.findByISBN(book.ISBN)
        expect(found.title).toEqual(book.title)
        expect(found.ISBN).toEqual(book.ISBN)
    })

    it('should not return a book with a non-existing ISBN', async () => {
        expect.assertions(1)
        return BookService.findByISBN(nonExistingBookISBN).catch(e => {
            expect(e.message).toMatch(`Book with ISBN ${nonExistingBookISBN} not found`)
        })
    })

    it('should not return a book with an invalid-formartted ISBN', async () => {
        function badRequest() {
            BookService.findByISBN(invalidFormatISBN)
        }

        expect(badRequest).toThrowError('Invalid ISBN')

    })

    it('should update an existing book', async () => {
        const book = await createBook()
        const update = {
            title: 'The last dance 2',
            publisher: 'Netflix',
        }
        const updated = await BookService.updateBook(book.ISBN, update)
        expect(updated).toHaveProperty('ISBN', book.ISBN)
        expect(updated).toHaveProperty('title', 'The last dance 2')
        expect(updated).toHaveProperty('publisher', 'Netflix')
    })

    it('should not update a non-existing book', async () => {
        expect.assertions(1)
        const update = {
            title: 'The last dance 2',
            publisher: 'Netflix',
        }
        return BookService.updateBook(nonExistingBookISBN, update).catch(e => {
            expect(e.message).toMatch(`Book with ISBN ${nonExistingBookISBN} not found`)
        })
    })

    it('should not update a book with invalid-formatted ISBN', async () => {
        const update = {
            title: 'The last dance 2',
            publisher: 'Netflix',
        }

        function badRequest() {
            BookService.updateBook(invalidFormatISBN, update)
        }

        expect(badRequest).toThrowError('Invalid ISBN')
    })

    it('should delete an existing book', async () => {
        const book = await createBook()
        const deleted = await BookService.deleteBook(book.ISBN)

        expect(deleted).toHaveProperty('ISBN', book.ISBN)
    })

    it('should not delete a non-existing book', async () => {
        expect.assertions(1)
        const book = await createBook()
        return BookService.deleteBook(nonExistingBookISBN).catch(e => {
            expect(e.message).toMatch(`Book with ISBN ${nonExistingBookISBN} not found`)
        })
    })

    it('should not delete a book with invalid-formatted ISBN', async () => {
        const book = await createBook()

        function badRequest() {
            BookService.deleteBook(invalidFormatISBN)
        }

        expect(badRequest).toThrowError('Invalid ISBN')
    })

    it('should lend an available book', async () => {
        const book = await createBook()
        const user = new User({
            email: 'test@email.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 'abcd1234'
        })
        const newUser = await UserService.signUp(user)

        const borrowBookPayload = {
            authData: {
                email: newUser.email,
                userId: newUser._id.toString()
            },
            returnedDate: new Date('2020 06 30')
        }
        const borrowed = await BookService.borrowBook(book.ISBN, borrowBookPayload)
        expect(borrowed).toHaveProperty('ISBN', book.ISBN)
        expect(borrowed).toHaveProperty('status', 'borrowed')
        expect(borrowed).toHaveProperty('borrowerId', newUser._id.toString())
    })

    it('should not lend a book with invalid-formatted ISBN', async () => {
        const book = await createBook()
        const user = new User({
            email: 'test@email.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 'abcd1234'
        })
        const newUser = await UserService.signUp(user)

        const borrowBookPayload = {
            authData: {
                email: newUser.email,
                userId: newUser._id.toString()
            },
            returnedDate: new Date('2020 06 30')
        }

        function badRequest() {
            BookService.borrowBook(invalidFormatISBN, borrowBookPayload)
        }

        expect(badRequest).toThrowError("Invalid ISBN")
    })

    it('should not lend a book with a returnedDate before borrowedDate', async () => {
        expect.assertions(1)
        const book = await createBook()
        const user = new User({
            email: 'test@email.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 'abcd1234'
        })
        const newUser = await UserService.signUp(user)

        const borrowBookPayload = {
            authData: {
                email: newUser.email,
                userId: newUser._id.toString()
            },
            returnedDate: new Date('2015 06 30')
        }

        return await BookService.borrowBook(book.ISBN, borrowBookPayload).catch(e => {
            expect(e.message).toMatch(`Return date must be after today`)
        })
    })

    it('should not lend a borrowed book', async () => {
        expect.assertions(1)
        const book = await createBook()
        const user1 = new User({
            email: 'test@email.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 'abcd1234'
        })
        const newUser1 = await UserService.signUp(user1)

        const borrowBookPayload1 = {
            authData: {
                email: newUser1.email,
                userId: newUser1._id.toString()
            },
            returnedDate: new Date('2020 06 30')
        }
        await BookService.borrowBook(book.ISBN, borrowBookPayload1)

        //create user 2 to borrow the already borrowed book above
        const user2 = new User({
            email: 'joe@email.com',
            firstName: 'Joe',
            lastName: 'Down',
            password: 'abcd1234'
        })
        const newUser2 = await UserService.signUp(user2)
        const borrowBookPayload2 = {
            authData: {
                email: newUser2.email,
                userId: newUser2._id.toString()
            },
            returnedDate: new Date('2020 06 30')
        }
        return await BookService.borrowBook(book.ISBN, borrowBookPayload2).catch(e => {
            expect(e.message).toMatch(`Book with ISBN ${book.ISBN} has been borrowed`)
        })
    })

    it('should return a borrowed book', async () => {
        const book = await createBook()
        const user = new User({
            email: 'test@email.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 'abcd1234'
        })
        const newUser = await UserService.signUp(user)

        const borrowBookPayload = {
            authData: {
                email: newUser.email,
                userId: newUser._id.toString()
            },
            returnedDate: new Date('2020 06 30')
        }
        await BookService.borrowBook(book.ISBN, borrowBookPayload)

        const returnBookPayload = {
            authData: {
                email: newUser.email,
                userId: newUser._id.toString()
            },
            returnedDate: new Date('2020 06 27')
        }
        const returned = await BookService.returnBook(book.ISBN, returnBookPayload)

        expect(returned).toHaveProperty('status', 'available')
        expect(returned.borrowerId).toBeUndefined()
    })

    it('should not return a book with wrong ISBN ', async () => {
        expect.assertions(1)
        const book = await createBook()
        const user = new User({
            email: 'test@email.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 'abcd1234'
        })
        const newUser = await UserService.signUp(user)

        const borrowBookPayload = {
            authData: {
                email: newUser.email,
                userId: newUser._id.toString()
            },
            returnedDate: new Date('2020 06 30')
        }
        await BookService.borrowBook(book.ISBN, borrowBookPayload)

        const returnBookPayload = {
            authData: {
                email: newUser.email,
                userId: newUser._id.toString()
            },
            returnedDate: new Date('2020 06 27')
        }
        return BookService.returnBook(nonExistingBookISBN, returnBookPayload).catch(e => {
            expect(e.message).toMatch(`Book with ISBN ${nonExistingBookISBN} not found`)
        })
    })

    it('should not return a book with wrong userId', async () => {
        expect.assertions(1)
        const book = await createBook()
        const user1 = new User({
            email: 'user1@email.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 'abcd1234'
        })
        const newUser1 = await UserService.signUp(user1)

        const borrowBookPayload = {
            authData: {
                email: newUser1.email,
                userId: newUser1._id.toString()
            },
            returnedDate: new Date('2020 06 30')
        }
        //user1 is the borrower of the book
        await BookService.borrowBook(book.ISBN, borrowBookPayload)

        //create user2
        const user2 = new User({
            email: 'user2@email.com',
            firstName: 'Joe',
            lastName: 'Down',
            password: 'abcd1234'
        })
        const newUser2 = await UserService.signUp(user2)

        const returnBookPayload = {
            authData: {
                email: newUser2.email,
                userId: newUser2._id.toString()
            },
            returnedDate: new Date('2020 06 27')
        }

        //user2 return book
        return BookService.returnBook(book.ISBN, returnBookPayload).catch(e => {
            expect(e.message).toMatch(`User with ID ${newUser2._id.toString()} is not the borrower of this book`)
        })
    })

    it('should not return a book with invalid-formatted ISBN', async () => {
        const book = await createBook()
        const user = new User({
            email: 'test@email.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 'abcd1234'
        })
        const newUser = await UserService.signUp(user)

        const borrowBookPayload = {
            authData: {
                email: newUser.email,
                userId: newUser._id.toString()
            },
            returnedDate: new Date('2020 06 30')
        }
        await BookService.borrowBook(book.ISBN, borrowBookPayload)

        const returnBookPayload = {
            authData: {
                email: newUser.email,
                userId: newUser._id.toString()
            },
            returnedDate: new Date('2020 06 27')
        }

        function badRequest() {
            BookService.returnBook(invalidFormatISBN, returnBookPayload)
        }

        expect(badRequest).toThrowError('Invalid ISBN')
    })
})