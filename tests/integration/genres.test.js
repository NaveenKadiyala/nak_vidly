const supertest = require('supertest')
const { Genre } = require('../../models/genre')
const { User } = require('../../models/user')
const mongoose = require('mongoose')
let server

describe('/api/genres', () => {

    beforeEach(() => { server = require('../../index') })
    
    afterEach(async () => {
        await server.close()
        await Genre.deleteMany({})
    })

    describe('GET /', () => {
        it('should return all the genres', async () => {
            await Genre.collection.insertMany([
                { name: 'Genre1' },
                { name: 'Genre2' }
            ])
            const response = await supertest(server).get('/api/genres')
            expect(response.status).toBe(200)
            expect(response.body.length).toBe(2)
            expect(response.body.some(g => g.name === 'Genre1')).toBeTruthy()
        })
    })

    describe('GET /:id', () => {
        it('should return genre if provided ID exists', async () => {
            const genre = new Genre({ name: 'Genre1' })
            await genre.save()
            const response = await supertest(server).get('/api/genres/' + genre._id)
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('name', genre.name)
        })

        it('should return 404 not found if provided ID not exists', async () => {
            const response = await supertest(server).get('/api/genres/61accc57b9a50c3cc4e8d8b4')
            expect(response.status).toBe(404)
        })

        it('should return 400 not found if provided ID is invalid objectId', async () => {
            const response = await supertest(server).get('/api/genres/1')
            expect(response.status).toBe(400)
        })

    })

    describe('POST /', () => {

        // Here we define the happy path and then in each test we change one paramter as per test case.
        let token, name
        const exec = () => {
            return supertest(server)
                .post('/api/genres/')
                .set('x-auth-token', token)
                .send({ name: name })
        }

        beforeEach(() => {
            token = new User().generateAuthToken()
            name = 'Genre1'
        })

        it('should return 401 if client is not loggedIn', async () => {
            token = ''
            const response = await exec()
            expect(response.status).toBe(401)
        })

        it('should return 400 if genre name is empty', async () => {
            name = ''
            const response = await exec()
            expect(response.status).toBe(400)
        })

        it('should return 400 if genre name is less than 5 characters', async () => {
            name = 'ABCD'
            const response = await exec()
            expect(response.status).toBe(400)
        })

        it('should return 400 if genre name is greater than 50 characters', async () => {
            name = new Array(52).join('a')
            const response = await exec()
            expect(response.status).toBe(400)
        })

        it('should save the genre if it is valid', async () => {
            await exec()
            const genre = await Genre.find({ name })
            expect(genre).not.toBeNull()
        })

        it('should return the genre if it is valid', async () => {
            const response = await exec()
            expect(response.body).toHaveProperty('_id')
            expect(response.body).toHaveProperty('name', name)
        })
    })

    describe('PUT /', () => {

        let token, id, genre, updatableName
        const exec = () => {
            return supertest(server)
                .put('/api/genres/' + id)
                .set('x-auth-token', token)
                .send({ name: updatableName })
        }

        beforeEach(async () => {
            token = new User().generateAuthToken()
            genre = new Genre({ name: 'Genre1' })
            await genre.save()
            id = genre._id
            updatableName = 'Updated Genre'
        })

        it('should return 401 if client is not loggedIn', async () => {
            token = ''
            const response = await exec()
            expect(response.status).toBe(401)
        })

        it('should return 400 invalid ID.. if provided ID is invalid objectId', async () => {
            id = '1'
            const response = await exec()
            expect(response.status).toBe(400)
        })

        it('should return 404 not found if provided ID not exists', async () => {
            id = mongoose.Types.ObjectId()
            const response = await exec()
            expect(response.status).toBe(404)
        })


        it('should return 400 if genre name is empty', async () => {
            updatableName = ''
            const response = await exec()
            expect(response.status).toBe(400)
        })

        it('should return 400 if genre name is less than 5 characters', async () => {
            updatableName = 'ABCD'
            const response = await exec()
            expect(response.status).toBe(400)
        })

        it('should return 400 if genre name is greater than 50 characters', async () => {
            updatableName = new Array(52).join('a')
            const response = await exec()
            expect(response.status).toBe(400)
        })

        it('should update the genre if it is valid', async () => {
            await exec()
            const genre = await Genre.find({ name: updatableName })
            expect(genre).not.toBeNull()
        })

        it('should return the updated genre if it is valid', async () => {
            const response = await exec()
            expect(response.body).toHaveProperty('_id')
            expect(response.body).toHaveProperty('name', updatableName)
        })

    })

    describe('DELETE /', () => {

        let token, id, genre
        const exec = () => {
            return supertest(server)
                .delete('/api/genres/' + id)
                .set('x-auth-token', token)
        }

        beforeEach(async () => {
            token = new User({ isAdmin: true }).generateAuthToken()
            genre = new Genre({ name: 'Genre1' })
            await genre.save()
            id = genre._id
        })

        it('should return 401 if client is not loggedIn', async () => {
            token = ''
            const response = await exec()
            expect(response.status).toBe(401)
        })

        it('should return 400 invalid ID.. if provided ID is invalid objectId', async () => {
            id = '1'
            const response = await exec()
            expect(response.status).toBe(400)
        })

        it('should return 403 Access Denied if provided user is not an Admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken()
            const response = await exec()
            expect(response.status).toBe(403)
        })

        it('should return 404 not found if provided ID not exists', async () => {
            id = mongoose.Types.ObjectId()
            const response = await exec()
            expect(response.status).toBe(404)
        })

        it('should return the deleted genre if it is valid', async () => {
            const response = await exec()
            expect(response.body).toHaveProperty('_id')
            expect(response.body).toHaveProperty('name', genre.name)
        })

    })

})