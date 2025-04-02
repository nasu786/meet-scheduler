const express = require("express")
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const router = require('./router');

app.use(cors());
app.use(bodyParser.json());

app.use('/', router)

app.get('/', (req, res) => {
    res.send({ status: 'APP is running!' });
});

app.use(function (req, res) {
    res.status(404).json({
        error: `URL ${req.url} with method ${req.method} is not exist`
    })
});

app.use((err, req, res, next) => {
    return res.status(500).json({
        error: err.message || "something went wrong"
    });
})

app.listen(3000, () => {
    console.log("Server listening on the port 3000...", new Date().toTimeString())
})

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error.message || error);
    // process.exit(1); 
});