const mongoose = require('mongoose');

(async () => {

    try {
        await mongoose.connect('mongodb://localhost:27017/akshaya');
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }

})()

mongoose.set('debug', true);

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB Disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB Connection Error:', err);
});

module.exports = mongoose