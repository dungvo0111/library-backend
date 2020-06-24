import request from 'supertest'

import Author, { AuthorDocument } from '../../src/models/Author'
import app from '../../src/app'
import * as dbHelper from '../db-helper'

const nonExistingAuthorId = '5e57b77b5744fa0b461c7906'

async function addAuthor(token: string) {
    const author = {
        name: 'Jordan',
        dateOfBirth: '1963 February 17',
        nationality: 'U.S',
        books: ['The last dance']
    }
    return await request(app)
        .post('/api/v1/author').set('Authorization', `Bearer ${token}`).send(author)
}

describe('author controller', () => {
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

    it('should add a new author', async () => {
        const res = await addAuthor(token)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('_id')
        expect(res.body.name).toBe('Jordan')
    })

    it('should not add an author with missing data', async () => {
        const res = await request(app)
            .post('/api/v1/author').set('Authorization', `Bearer ${token}`)
            .send({
                dateOfBirth: '1963 February 17',
                nationality: 'U.S',
                //This field should be included
                // books: ['The last dance']
            })
        console.log(res.status)
        expect(res.status).toBe(400)
    })

    it('should update an existing author', async () => {
        let res = await addAuthor(token)
        expect(res.status).toBe(200)

        const authorId = res.body._id
        const update = {
            name: 'Michael Jordan',
            nationality: 'United States'
        }

        res = await request(app)
            .put(`/api/v1/author/${authorId}`).set('Authorization', `Bearer ${token}`)
            .send(update)

        expect(res.status).toEqual(200)
        expect(res.body.name).toEqual('Michael Jordan')
        expect(res.body.nationality).toEqual("United States")
    })

    it('should not update a non-existing author', async () => {

        const authorId = nonExistingAuthorId
        const update = {
            name: 'Michael Jordan',
            nationality: 'United States'
        }

        let res = await request(app)
            .put(`/api/v1/author/${authorId}`).set('Authorization', `Bearer ${token}`)
            .send(update)
        expect(res.status).toBe(404)
    })

    it('should delete an existing author', async () => {
        let res = await addAuthor(token)
        expect(res.status).toBe(200)
        const authorId = res.body._id

        res = await request(app)
            .delete(`/api/v1/author/${authorId}`).set('Authorization', `Bearer ${token}`)

        expect(res.status).toEqual(200)

        res = await request(app)
            .get(`/api/v1/author/${authorId}`)
        expect(res.status).toBe(404)
    })

    it('should not delete a non-existing author', async () => {
        const authorId = nonExistingAuthorId
        let res = await request(app)
            .delete(`/api/v1/author/${authorId}`).set('Authorization', `Bearer ${token}`)

        expect(res.status).toEqual(404)
    })
})