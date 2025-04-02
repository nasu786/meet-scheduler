const express = require('express');
const controller = require('./controller');
const router = express.Router();


router.get('/', (req, res) => {
    res.status(200).send("Hello world")
})

router.post('/rooms', controller.createRoom)
router.get('/rooms', controller.getRooms)
router.delete('/rooms/:id', controller.deleteRoom)
router.post('/trainers', controller.createTrainer)
router.get('/trainers', controller.getTrainers)
router.delete('/trainers/:id', controller.deleteTrainers)
router.post('/schedules', controller.scheduleMeeting)
router.delete('/schedules', controller.deleteSchedules)
router.get('/schedules', controller.getSchedules)

module.exports = router;