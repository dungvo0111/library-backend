import request from 'supertest'

import Book, { BookDocument } from '../../src/models/Book'
import app from '../../src/app'
import * as dbHelper from '../db-helper'

const nonExistingBookISBN = '9783161484101'
const invalidFormatISBN = '123456'

async function createBook(token: string, override?: Partial<BookDocument>) {
    let book = {
        ISBN: '9783161484100',
        title: 'The last dance',
        description: 'Great book about Michael Jordan',
        publisher: 'Jordan',
        author: ['Jordan', 'Pippen', 'Rodman'],
        genres: ['sport', 'documentary'],
        publishedDate: new Date("2020 02 01"),
    }
    if (override) {
        book = { ...book, ...override }
    }
    return await request(app)
        .post('/api/v1/books').set('Authorization', `Bearer ${token}`).send(book)
}

describe('user controller', () => {
    let token: string;

    beforeAll((done) => {
        request(app).post('/api/v1/user/signIn').send({
            email: process.env.TEST_EMAIL,
            password: process.env.TEST_PASSWORD
        })
            .end((err, response) => {
                token = response.body.token;
                done()
            })
    })
    beforeEach(async () => {
        await dbHelper.connect()
    })

    afterEach(async () => {
        await dbHelper.clearDatabase()
    })

    afterAll(async () => {
        await dbHelper.closeDatabase()
    })

    it('should create a new book', async () => {
        const res = await createBook(token)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('_id')
        expect(res.body.title).toBe('The last dance')
    })

    it('should not create a book with missing data', async () => {
        const res = await request(app)
            .post('/api/v1/books').set('Authorization', `Bearer ${token}`)
            .send({
                ISBN: '9783161484100',
                // These fields should be included
                // title: 'The last dance',
                // description: 'Great book about Michael Jordan',
                // publisher: 'Jordan',
                author: ['Jordan', 'Pippen', 'Rodman'],
                genres: ['sport', 'documentary'],
                publishedDate: new Date("2020 02 01"),
            })
        expect(res.status).toBe(400)
    })

    it('handle filter query', async () => {
        const res1 = await createBook(token, {
            ISBN: "9783161484101",
            title: 'The last dance 1',
            description: 'Great book about Michael Jordan',
            publisher: 'Netflix',
            author: ['Jordan'],
            genres: ['sport', 'documentary'],
            publishedDate: new Date("2020 02 01"),
        })
        const res2 = await createBook(token, {
            ISBN: '9783161484102',
            title: 'How I met your father',
            description: 'Great parody of HIMYM',
            publisher: 'Dung Vo Times',
            author: ['Dung'],
            genres: ['drama', 'comedy'],
            publishedDate: new Date("2018 02 01"),
        })

        const validQuery1 = '?author=Dung&genres=drama'
        const validQuery2 = '?status=available'
        const invalidQuery = '?title=How I met you mother'

        const res3 = await request(app)
            .get(`/api/v1/books/Filtering${validQuery1}`)

        const res4 = await request(app)
            .get(`/api/v1/books/Filtering${validQuery2}`)

        const res5 = await request(app)
            .get(`/api/v1/books/Filtering${invalidQuery}`)

        expect(res3.body.length).toEqual(1)
        expect(res3.body[0].title).toEqual(res2.body.title)
        expect(res4.body.length).toEqual(2)
        expect(res4.body[0].title).toEqual(res2.body.title)
        expect(res4.body[1].title).toEqual(res1.body.title)
        expect(res5.status).toBe(404)
    })


    it('should get back all books', async () => {
        const res1 = await createBook(token, {
            ISBN: "9783161484101",
            title: 'The last dance 1',
            description: 'Great book about Michael Jordan',
            publisher: 'Jordan',
            author: ['Jordan'],
            genres: ['sport', 'documentary'],
            publishedDate: new Date("2020 02 01"),
        })
        const res2 = await createBook(token, {
            ISBN: '9783161484102',
            title: 'The last dance 2',
            description: 'Great book about Michael Jordan',
            publisher: 'Jordan',
            author: ['Pippen', 'Rodman'],
            genres: ['sport', 'documentary'],
            publishedDate: new Date("2020 02 01"),
        })

        const res3 = await request(app)
            .get('/api/v1/books')

        expect(res3.body.length).toEqual(2)
        expect(res3.body[0]._id).toEqual(res1.body._id)
        expect(res3.body[1]._id).toEqual(res2.body._id)
    })

    it('should get back an existing book', async () => {
        let res = await createBook(token)
        expect(res.status).toBe(200)

        const bookISBN = res.body.ISBN
        res = await request(app)
            .get(`/api/v1/books/${bookISBN}`)

        expect(res.body.ISBN).toEqual(bookISBN)
    })

    it('should not get back a book with invalid ISBN format or non-existing ISBN', async () => {
        const res1 = await request(app)
            .get(`/api/v1/books/${nonExistingBookISBN}`)
        const res2 = await request(app)
            .get(`/api/v1/books/${invalidFormatISBN}`)

        expect(res1.status).toBe(404)
        expect(res2.status).toBe(400)

    })

    it('should update an existing book', async () => {
        let res = await createBook(token)
        expect(res.status).toBe(200)

        const bookISBN = res.body.ISBN
        const update = {
            title: 'The last dance 1',
            publisher: 'Pippen'
        }

        res = await request(app)
            .put(`/api/v1/books/${bookISBN}`).set('Authorization', `Bearer ${token}`)
            .send(update)

        expect(res.status).toEqual(200)
        expect(res.body.title).toEqual('The last dance 1')
        expect(res.body.publisher).toEqual("Pippen")
    })

    it('should not update a book with invalid ISBN format or non-existing ISBN', async () => {
        const update = {
            title: 'The last dance 1',
            publisher: 'Pippen'
        }

        const res1 = await request(app)
            .put(`/api/v1/books/${nonExistingBookISBN}`).set('Authorization', `Bearer ${token}`)
            .send(update)
        const res2 = await request(app)
            .put(`/api/v1/books/${invalidFormatISBN}`).set('Authorization', `Bearer ${token}`)
            .send(update)

        expect(res1.status).toBe(404)
        expect(res2.status).toBe(400)
    })

    it('should delete an existing book', async () => {
        let res = await createBook(token)
        expect(res.status).toBe(200)
        const bookISBN = res.body.ISBN

        res = await request(app)
            .delete(`/api/v1/books/${bookISBN}`).set('Authorization', `Bearer ${token}`)

        expect(res.status).toEqual(200)

        res = await request(app)
            .get(`/api/v1/books/${bookISBN}`)
        expect(res.status).toBe(404)
    })

    it('should not delete a non-existing book', async () => {
        const res1 = await request(app)
            .delete(`/api/v1/books/${nonExistingBookISBN}`).set('Authorization', `Bearer ${token}`)

        const res2 = await request(app)
            .delete(`/api/v1/books/${invalidFormatISBN}`).set('Authorization', `Bearer ${token}`)

        expect(res1.status).toEqual(404)
        expect(res2.status).toEqual(400)
    })

    it('handle lending book', async () => {
        const res1 = await createBook(token, {
            ISBN: "9783161484103",
            title: 'The last dance 1',
            description: 'Great book about Michael Jordan',
            publisher: 'Jordan',
            author: ['Jordan'],
            genres: ['sport', 'documentary'],
            publishedDate: new Date("2020 02 01"),
            status: "available"
        })
        const res2 = await createBook(token, {
            ISBN: '9783161484102',
            title: 'The last dance 2',
            description: 'Great book about Michael Jordan',
            publisher: 'Jordan',
            author: ['Pippen', 'Rodman'],
            genres: ['sport', 'documentary'],
            publishedDate: new Date("2020 02 01"),
            status: 'borrowed',
            borrowedDate: new Date(),
            returnedDate: new Date("2020 06 30"),
            borrowerId: "5ef1163a36727e47dc6ec6b8"
        })

        const res3 = await (await request(app).put(`/api/v1/books/${res1.body.ISBN}/borrowBook`).send({ returnedDate: new Date("2020 06 30") }).set('Authorization', `Bearer ${token}`))
        const res4 = await request(app).put(`/api/v1/books/${res2.body.ISBN}/borrowBook`).send({ returnedDate: new Date("2020 06 30") }).set('Authorization', `Bearer ${token}`)
        const res5 = await request(app).put(`/api/v1/books/${nonExistingBookISBN}/borrowBook`).send({ returnedDate: new Date("2020 06 30") }).set('Authorization', `Bearer ${token}`)

        expect(res3.body.status).toEqual('borrowed')
        expect(res4.status).toBe(400)
        expect(res5.status).toBe(404)
    })

    it('handle returning book', async () => {
        const res1 = await createBook(token, {
            ISBN: '9783161484102',
            title: 'The last dance 2',
            description: 'Great book about Michael Jordan',
            publisher: 'Jordan',
            author: ['Pippen', 'Rodman'],
            genres: ['sport', 'documentary'],
            publishedDate: new Date("2020 02 01"),
            status: 'available',

        })
        //make a borrow book request to test return functionality
        const res2 = await (await request(app).put(`/api/v1/books/${res1.body.ISBN}/borrowBook`).send({ returnedDate: new Date("2020 06 30") }).set('Authorization', `Bearer ${token}`))

        const res3 = await request(app).put(`/api/v1/books/${res1.body.ISBN}/returnBook`).send({ returnedDate: new Date("2020 06 27") }).set('Authorization', `Bearer ${token}`)

        //make the borrow request again
        const res4 = await (await request(app).put(`/api/v1/books/${res1.body.ISBN}/borrowBook`).send({ returnedDate: new Date("2020 06 30") }).set('Authorization', `Bearer ${token}`))
        const res5 = await request(app).put(`/api/v1/books/${nonExistingBookISBN}/returnBook`).send({ returnedDate: new Date("2020 06 27") }).set('Authorization', `Bearer ${token}`)
        const res6 = await request(app).put(`/api/v1/books/${invalidFormatISBN}/returnBook`).send({ returnedDate: new Date("2020 06 27") }).set('Authorization', `Bearer ${token}`)

        expect(res3.body.status).toEqual('available')
        expect(res3.body.borrowerId).toEqual(undefined)
        expect(res5.status).toBe(404)
        expect(res6.status).toBe(400)
    })
})