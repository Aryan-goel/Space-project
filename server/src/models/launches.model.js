const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 0;
const launches = new Map();

let latestFlightNumber = 100;

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date("December 27, 2030"),
    target: 'Kepler-442 b',
    customer: ['Ztm', 'NASA'],
    upcoming: true,
    success: true,
};

saveLaunch(launch);

// launches.set(launch.flightNumber, launch);

async function existsLaunchWithId(launchId) {
    return await launchesDatabase.findOne({
        flightNumber:launchId,
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

async function getAllLaunches() {

    return await launchesDatabase
        .find({}, { '-id': 0, '__v': 0 });
}

async function saveLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if (!planet) {
        throw new Error("NO matching planet found");
    }

    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,

    }, launch, {
        upsert: true
    })
}

async function scheduleNewLaunch(launch){

    const newFlightNumber = await getLastestFlightNumber()+1
    const newLaunch = Object.assign(launch,{
        success:true,
        upcoming:true,
        customers: ['ZTM','NASA'],
        flightNumber:newFlightNumber
    });


    await saveLaunch(newLaunch);
}



async function abortLaunchById(launchId) {
    // const aborted = launches.get(launchId);
    // aborted.upcoming = false;
    // aborted.success = false;
    // return aborted;

    return await launchesDatabase.updateOne({
        flightNumber:launchId,

    },{
        upcoming:false,
        success:false,
    })
}

module.exports = {
    getAllLaunches,
    existsLaunchWithId,
    abortLaunchById,
    scheduleNewLaunch,

}