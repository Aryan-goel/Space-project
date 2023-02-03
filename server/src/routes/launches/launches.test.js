const request = require('supertest');

describe('Test GET /launches', () => {
    test('It should respond with 200 response success', () => {
        const response = request();
        expect(response).toBe(200);
    })
})

describe('Test POST /launch',()=>{
    test('It should respond with 200 response success',()=>{

    })
    test("it should catch missing requried properties",()=>{})
    test('it should catch invalid dates',()=>{})
})