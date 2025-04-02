const db = require('./connection');
const mongoose = require("mongoose");

const schemas = {
    roomsModel: require('./schemas/room')(db, mongoose),
    trainersModel: require('./schemas/trainer')(db, mongoose),
    schedulesModel: require('./schemas/schedules')(db, mongoose)
}

module.exports = schemas;