const request = require('supertest');
const app = require('../../app')


describe('Test GET /launches', () => {
    test('It should respond with 200 response success', async () => {
        const response = await request(app)
            .get('/launches')
            .expect('Content-Type', /json/)
            .expect(200);
    })
})

describe('Test POST /launch', () => {
    const compeleteLaunchData = {
        mission: "USS Enterprise",
        rocket: 'NCC 1701-D',
        target: "kepler-186 f",
        launchDate: 'January 4, 2028'
    }

    const launchDataWithoutDate = {
        mission: "USS Enterprise",
        rocket: 'NCC 1701-D',
        target: "kepler-186 f",
    }

    const launchDataWithInvalidDate = {
        mission: "USS Enterprise",
        rocket: 'NCC 1701-D',
        target: "kepler-186 f",
        launchDate: 'pipipupu'
    }

    test('It should respond with 201 created', async () => {
        const response = await request(app)
            .post('/launches')
            .send(compeleteLaunchData)
            .expect('Content-Type', /json/)
            .expect(201);

        const requestDate = new Date(compeleteLaunchData.launchDate).valueOf();
        const responseDate = new Date(response.body.launchDate).valueOf();
        expect(responseDate).toBe(requestDate)

        expect(response.body).toMatchObject(launchDataWithoutDate)

    })
    test("it should catch missing requried properties", async () => {
        const response = await request(app)
            .post('/launches')
            .send(launchDataWithoutDate)
            .expect('Content-Type', /json/)
            .expect(400);

        expect(response.body).toStrictEqual({
            error: "Missing required Launch Property",
        })
    })
    test('it should catch invalid dates', async () => {
        const response = await request(app)
            .post('/launches')
            .send(launchDataWithInvalidDate)
            .expect('Content-Type', /json/)
            .expect(400);

        expect(response.body).toStrictEqual({
            error: "Invalid launch Date",
        })
    })
})