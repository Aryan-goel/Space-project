const axios = require('axios');
const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 0;

const SPACE_X_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches() {
    console.log("downloading launch data");
    const response = await axios.post(SPACE_X_API_URL, {
        query: {},
        options: {
            pagination: false,

            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                }, {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]

        }
    });

    if (response.status !== 200) {
        console.log('Problem downloading launch data!!');
        throw new Error('Launch Data download failed')
    }
    const launchDocs = response.data.docs;
    for (const launchdoc of launchDocs) {

        const payloads = launchdoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];

        })
        const launch = {
            flightNumber: launchdoc['flight_number'],
            mission: launchdoc['name'],
            rocket: launchdoc['rocket']['name'],
            launchDate: launchdoc['date_unix'],
            upcoming: launchdoc['upcoming'],
            success: launchdoc['success'],
            customers,
        };
        console.log(`${launch.flightNumber} ${launch.mission} ${launch.launchDate}`);
        //TODO: populate lauches collection ...

        await saveLaunch(launch);
    }
}
async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    })
    if (firstLaunch) {
        console.log('Launch data already loaded!!');

    } else {
        await populateLaunches()
    }
}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter)

}


async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId,
    })
}

async function getLastestFlightNumber() {
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;

    }

    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {

    return await launchesDatabase
        .find({}, { '-id': 0, '__v': 0 })
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit)
}

async function saveLaunch(launch) {
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,

    }, launch, {
        upsert: true
    })
}

async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if (!planet) {
        throw new Error("NO matching planet found");
    }

    const newFlightNumber = await getLastestFlightNumber() + 1
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['ZTM', 'NASA'],
        flightNumber: newFlightNumber
    });


    await saveLaunch(newLaunch);
}



async function abortLaunchById(launchId) {
    return await launchesDatabase.updateOne({
        flightNumber: launchId,

    }, {
        upcoming: false,
        success: false,
    })
}

module.exports = {
    loadLaunchData,
    getAllLaunches,
    existsLaunchWithId,
    abortLaunchById,
    scheduleNewLaunch,

}