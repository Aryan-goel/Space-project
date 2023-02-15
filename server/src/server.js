const http = require('http');
const mongoose = require('mongoose');

const app = require("./app")
require('dotenv').config();
const { loadPlanetsData } = require('./models/planets.model');
const { mongoConnect } = require('./services/mongo');
const { loadLaunchData } = require('./models/launches.model')
const PORT = process.env.PORT || 8000;  
const server = http.createServer(app);

async function startServer() {
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchData();

    server.listen(PORT, () => {
        console.log(`listening on port ${PORT}...`);
    })
}

startServer();


