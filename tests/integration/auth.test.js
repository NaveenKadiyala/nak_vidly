const { User } = require('../../models/user')
const { Genre } = require('../../models/genre')
const supertest = require('supertest')

describe('auth middleware', () => {

    let token, server
    beforeEach(() => {
        server = require('../../index')
        token = new User().generateAuthToken()
    })
    afterEach(async () => {
        await Genre.deleteMany({})
        await server.close()
    })

    const exec = () => {
        return supertest(server)
            .post('/api/genres/')
            .set('x-auth-token', token)
            .send({ name: 'Genre1' })
    }

    it('should return 401 if client is not loggedIn', async () => {
        token = ''
        const response = await exec()
        expect(response.status).toBe(401)
    })

    it('should return 400 if client has sent invalid token', async () => {
        token = 'a'
        const response = await exec()
        expect(response.status).toBe(400)
    })

    it('should return 200 if token is valid', async () => {
        const response = await exec()
        expect(response.status).toBe(200)
    })
})