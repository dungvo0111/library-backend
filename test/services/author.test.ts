import Author from '../../src/models/Author'
import AuthorService from '../../src/services/author'
import * as dbHelper from '../db-helper'

const nonExistingAuthorId = '5e57b77b5744fa0b461c7906'

async function addAuthor() {
    const author = new Author({
        name: 'Jordan',
        dateOfBirth: new Date('1963 February 17'),
        nationality: 'U.S',
        books: ['The last dance']
    })
    return await AuthorService.add(author)
}

describe('author service', () => {
    beforeEach(async () => {
        await dbHelper.connect()
    })

    afterEach(async () => {
        await dbHelper.clearDatabase()
    })

    afterAll(async () => {
        await dbHelper.closeDatabase()
    })

    it('should add an author', async () => {
        const author = await addAuthor()
        expect(author).toHaveProperty('_id')
        expect(author).toHaveProperty('name', 'Jordan')
        expect(author).toHaveProperty('nationality', 'U.S')
    })

    it('should update an existing author', async () => {
        const author = await addAuthor()
        const update = {
            name: 'Michael Jordan',
            nationality: 'United States',
            dateOfBirth: new Date('1965 February 17'),
            books: ['The last dance 2']
        }
        const updated = await AuthorService.updateAuthor(author._id, update)
        console.log(updated)
        expect(updated).toHaveProperty('_id', author._id)
        expect(updated).toHaveProperty('name', update.name)
        expect(updated).toHaveProperty('nationality', update.nationality)
        expect(updated).toHaveProperty('dateOfBirth', update.dateOfBirth)
        expect(updated).toHaveProperty('books', expect.arrayContaining(['The last dance 2']))
    })

    it('should not update a non-existing author', async () => {
        expect.assertions(1)
        const update = {
            name: 'Michael Jordan',
            nationality: 'United States',
        }
        return AuthorService.updateAuthor(nonExistingAuthorId, update).catch(e => {
            expect(e.message).toMatch(`Author not found`)
        })
    })

    it('should delete an existing author', async () => {
        const author = await addAuthor()
        const deletedAuthor = await AuthorService.deleteAuthor(author._id)

        expect(deletedAuthor).toHaveProperty('_id', author._id)
    })

    it('should not delete a non-existing author', async () => {
        expect.assertions(1)
        const author = await addAuthor()
        return AuthorService.deleteAuthor(nonExistingAuthorId).catch(e => {
            expect(e.message).toMatch(`Author not found`)
        })
    })

})