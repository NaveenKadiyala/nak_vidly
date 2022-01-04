const { Rental } = require('../../models/rental')
const mongoose = require('mongoose')
const supertest = require('supertest')
const { User } = require('../../models/user')
const { Movie } = require('../../models/movie')
const moment = require('moment')

describe('/api/returns', () => {

    let server, customerId, movieId, rental, token, movie

    const exec = () => {
        return supertest(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, movieId })
    }

    beforeEach(async () => {
        server = require('../../index')
        token = new User().generateAuthToken()
        customerId = mongoose.Types.ObjectId()
        movieId = mongoose.Types.ObjectId()

        movie = new Movie({
            _id: movieId,
            title: '12345',
            dailyRentalRate: 2,
            numberInStock: 5,
            genre: {
                name: 'Genre'
            }
        })
        await movie.save()

        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345'
            },
            movie: {
                _id: movieId,
                title: '12345',
                dailyRentalRate: 2,
                numberInStock: 5
            }
        })
        await rental.save()
    })

    afterEach(async () => {
        await server.close()
        await Rental.deleteMany({})
        await Movie.deleteMany({})
    })

    it('should return 401 if client is not loggedIn', async () => {
        token = ''
        const result = await exec()
        expect(result.status).toBe(401)
    })

    it('should return 400 if customerId was not provided', async () => {
        customerId = ''
        const result = await exec()
        expect(result.status).toBe(400)
    })

    it('should return 400 if movieId was not provided', async () => {
        movieId = ''
        const result = await exec()
        expect(result.status).toBe(400)
    })

    it('should return 404 if not rental found for this customer/movie', async () => {
        await Rental.deleteMany({})
        const result = await exec()
        expect(result.status).toBe(404)
    })

    it('should return 400 if return was already processed', async () => {
        rental.dateReturned = new Date()
        await rental.save()
        const result = await exec()
        expect(result.status).toBe(400)
    })

    it('should return 200 if input is valid', async () => {
        const result = await exec()
        expect(result.status).toBe(200)
    })

    it('should set the return date if input is valid', async () => {
        await exec()
        const rentalInDb = await Rental.findById(rental._id)
        const diffInMillis = new Date() - rentalInDb.dateReturned
        expect(diffInMillis).toBeLessThan(10 * 1000)
    })

    it('should set the rental fee if input is valid', async () => {
        rental.dateOut = moment().add(-7, 'days').toDate()
        await rental.save()
        await exec()
        const rentalInDb = await Rental.findById(rental._id)
        expect(rentalInDb.rentalFee).toBe(14)
    })

    it('should increase the movie stock if input is valid', async () => {
        await exec()
        const movieInDb = await Movie.findById(movieId)
        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1)
    })

    it('should return the rental if input is valid', async () => {
        const res = await exec()
        const rentalInDb = await Rental.findById(rental._id)
        expect(res.body).toHaveProperty('dateOut')
        expect(res.body).toHaveProperty('dateReturned')
        expect(res.body).toHaveProperty('rentalFee')
        expect(res.body).toHaveProperty('customer')
        expect(res.body).toHaveProperty('movie')

        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining(['dateOut','dateReturned','rentalFee','customer','movie'])
        )
    })
})