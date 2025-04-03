const { default: mongoose } = require("mongoose");
const { schedulesModel, roomsModel, trainersModel } = require("./models")

class Controller {
    constructor() {

        this.createRoom = async (req, res) => {
            const newRoom = new roomsModel({
                room_number: req.body.room_number
            });
            await newRoom.save();
            res.status(201).json({ message: "Room created successfully" });
        }

        this.getRooms = async (req, res) => {
            roomsModel.find().then(response => {
                res.json({ response });
            }).catch(error => {
                res.status(400).json({
                    error: error.message || "server error"
                })
            })
        }

        this.deleteRoom = async (req, res) => {
            roomsModel.deleteOne({ _id: req.params.id }).then(response => {
                res.json({ response });
            }).catch(error => {
                res.status(400).json({
                    error: error.message || "server error"
                })
            })
        }

        this.createTrainer = async (req, res) => {
            const newTrainer = new trainersModel({
                name: req.body.name
            });
            await newTrainer.save();
            res.status(201).json({ message: "Trainer created successfully" });
        }

        this.getTrainers = async (req, res) => {
            trainersModel.find().then(response => {
                res.json({ response });
            }).catch(error => {
                res.status(400).json({
                    error: error.message || "server error"
                })
            })
        }

        this.deleteTrainers = async (req, res) => {
            trainersModel.deleteOne({ _id: req.params.id }).then(response => {
                res.json({ response });
            }).catch(error => {
                res.status(400).json({
                    error: error.message || "server error"
                })
            })
        }

        this.scheduleMeeting = async (req, res) => {
            try {

                const data = req.body

                const isWithinWorkingHours = (date) => {
                    const day = date.getUTCDay(); // 0 = Sunday, 6 = Saturday
                    const hours = date.getUTCHours();

                    // Check if it's Saturday (6) or Sunday (0)
                    if (day === 0 || day === 6) return false;

                    // Check working hours: 9 AM - 1 PM and 2 PM - 6 PM
                    return (hours >= 9 && hours < 13) || (hours >= 14 && hours < 18);
                };

                const requestedStartTime = new Date(data.scheduleAt);
                const requestedEndTime = new Date(requestedStartTime.getTime() + data.duration);


                let result = {}
                // if (!isWithinWorkingHours(requestedStartTime) || !isWithinWorkingHours(new Date(requestedEndTime.getTime() - 10000))) {
                //     // const day = date.getUTCDay(); // 0 = Sunday, 6 = Saturday
                //     // const hours = requestedStartTime.getUTCHours();
                //     // if (hours > 14) {
                //     //     console.log("next availble day")
                //     // } else {
                //     //     let time;
                //     //     let requestedStartTime = new Date(data.scheduleAt).setUTCHours(14, 0, 0, 0);
                //     //     let requestedEndTime = new Date(requestedStartTime.getTime() + data.duration);
                //     //     while (!time) {
                //     //         const trainerConflict = await schedulesModel.findOne({
                //     //             trainer: new mongoose.Types.ObjectId(data.trainer),
                //     //             scheduledAt: {
                //     //                 $lt: requestedEndTime
                //     //             },
                //     //             $expr: {
                //     //                 $gt: [{ $add: ["$scheduledAt", "$duration"] }, requestedStartTime]
                //     //             }
                //     //         })

                //     //         const roomConflict = await schedulesModel.findOne({
                //     //             room: new mongoose.Types.ObjectId(data.room),
                //     //             scheduledAt: {
                //     //                 $lt: requestedEndTime
                //     //             },
                //     //             $expr: {
                //     //                 $gt: [{ $add: ["$scheduledAt", "$duration"] }, requestedStartTime]
                //     //             }
                //     //         })

                //     //         if (roomConflict && trainerConflict) {

                //     //         }
                //     //         else if (roomConflict) message = "Room not available"
                //     //         else if (trainerConflict) message = "Trainer not available"
                //     //     }




                //     // }
                //     message = "Meeting time is outside working hours or on a holiday."
                // } else {
                const trainerConflict = await checkAvailability("trainer", data.trainer, requestedStartTime, requestedEndTime)

                const roomConflict = await checkAvailability("room", data.room, requestedStartTime, requestedEndTime)

                const [currentRoom, currentTrainer] = await Promise.all([find("room", data.room), find("trainer", data.trainer)])

                if (roomConflict && trainerConflict) {
                    const occuppiedTrainers = await occuppied(requestedStartTime, requestedEndTime);
                    let trainer = await availableResources("trainer", occuppiedTrainers)

                    const occuppiedRooms = await occuppied(requestedStartTime, requestedEndTime);
                    let room = await availableResources("room", occuppiedRooms)


                    if (trainer && room) {
                        result = {
                            message: `Room No: ${currentRoom.room_number} & Trainer: ${currentTrainer.name} are not available on ${new Date(data.scheduleAt)}`,
                            suggestion: `You can block Room No: ${room.room_number} & Trainer: ${trainer.name} on ${new Date(data.scheduleAt)}`
                        }
                    } else {
                        const availableSchedule = await findNextAvailableSlotForBoth(data.room, data.trainer, data.scheduleAt, data.duration)

                        result = {
                            message: `No ${room ? "trainer" : "room"} is available on ${new Date(data.scheduleAt)}`,
                            suggestion: `You can block ${currentRoom.room_number} & ${currentTrainer.name} on ${new Date(availableSchedule)}`
                        }
                    }
                }
                else if (roomConflict) {
                    const occuppiedRooms = await occuppied(requestedStartTime, requestedEndTime);
                    const room = await availableResources("room", occuppiedRooms)

                    if (room) {
                        result = {
                            message: `Room No: ${currentRoom.room_number} is not available on ${new Date(data.scheduleAt)}`,
                            suggestion: `You can block Room No: ${room.room_number} & Trainer: ${currentTrainer.name} on ${new Date(data.scheduleAt)}`
                        }

                    } else {
                        const availableSchedule = await findNextAvailableSlotForBoth(data.room, data.trainer, data.scheduleAt, data.duration)
                        console.log(availableSchedule) // Sugeestion

                        result = {
                            message: `No Rooms available on ${new Date(data.scheduleAt)}`,
                            suggestion: `You can block ${currentRoom.room_number} & ${currentTrainer.name} on ${new Date(availableSchedule)}`
                        }
                    }
                }
                else if (trainerConflict) {
                    const occuppiedTrainers = await occuppied(requestedStartTime, requestedEndTime);
                    const trainer = await availableResources("trainer", occuppiedTrainers)

                    if (trainer) {
                        result = {
                            message: `Trainer: ${currentTrainer.name} is not available on ${new Date(data.scheduleAt)}`,
                            suggestion: `You can block Room No: ${currentRoom.room_number} & Trainer: ${trainer.name} on ${new Date(data.scheduleAt)}`
                        }
                    } else {
                        const availableSchedule = await findNextAvailableSlotForBoth(data.room, data.trainer, data.scheduleAt, data.duration)

                        result = {
                            message: `No Trainers are available on ${new Date(data.scheduleAt)}`,
                            suggestion: `You can block ${currentRoom.room_number} & ${currentTrainer.name} on ${new Date(availableSchedule)}`
                        }
                    }
                }
                else {
                    const newMeeting = new schedulesModel({
                        title: data.title,
                        description: data.description,
                        room: Object(data.room),
                        trainer: Object(data.trainer),
                        scheduledAt: new Date(data.scheduleAt).toISOString(),
                        duration: data.duration,
                        status: "Scheduled"
                    });
                    await newMeeting.save();
                    return res.status(201).json({ message: "Meeting scheduled successfully" });
                }

                res.send({ result })
            }
            catch (error) {
                res.status(400).json({
                    error: error.message || "server error"
                })
            }
        }

        this.getSchedules = async (req, res) => {
            schedulesModel.find().populate('trainer').populate('room').then(response => {
                res.json({ response });
            }).catch(error => {
                res.status(400).json({
                    error: error.message || "server error"
                })
            })
        }

        this.deleteSchedules = async (req, res) => {
            schedulesModel.deleteMany().then(response => {
                res.json({ response });
            }).catch(error => {
                res.status(400).json({
                    error: error.message || "server error"
                })
            })
        }

        function occuppied(requestedStartTime, requestedEndTime) {
            return schedulesModel.find({
                scheduledAt: {
                    $lt: requestedEndTime
                },
                $expr: {
                    $gt: [{ $add: ["$scheduledAt", "$duration"] }, requestedStartTime]
                }
            }, {
                room: 1,
                trainer: 1
            })
        }

        function availableResources(type, resources) {
            return (type === "trainer" ? trainersModel : roomsModel).findOne({
                _id: {
                    $nin: resources.map(item => new mongoose.Types.ObjectId(item[type]))
                }
            })
        }

        async function findNextAvailableSlot(type, id, scheduleAt, duration) {
            let availableTimeSlot;
            let meetDuration = duration

            while (!availableTimeSlot) {
                const requestedStartTime = new Date(new Date(scheduleAt).getTime() + meetDuration);
                const requestedEndTime = new Date(requestedStartTime.getTime() + duration);

                // const occuppiedResource = await occuppied(requestedStartTime, requestedEndTime);
                const isResourceAvailable = await checkAvailability(type, id, requestedStartTime, requestedEndTime)
                if (!isResourceAvailable) availableTimeSlot = requestedStartTime
                meetDuration += duration
            }
            return availableTimeSlot
        }

        async function findNextAvailableSlotForBoth(room, trainer, scheduleAt, duration) {
            let availableTimeSlot;
            let meetDuration = duration

            while (!availableTimeSlot) {
                const requestedStartTime = new Date(new Date(scheduleAt).getTime() + meetDuration);
                const requestedEndTime = new Date(requestedStartTime.getTime() + duration);

                // const occuppiedResource = await occuppied(requestedStartTime, requestedEndTime);
                const isResourceAvailable = await checkAvailability("both", { room, trainer }, requestedStartTime, requestedEndTime)
                if (!isResourceAvailable) availableTimeSlot = requestedStartTime
                meetDuration += duration
            }
            return availableTimeSlot
        }

        function checkAvailability(type, id, requestedStartTime, requestedEndTime) {
            return schedulesModel.findOne({
                ...(type === "both" ? {
                    $and: [
                        { room: new mongoose.Types.ObjectId(id.room) },
                        { trainer: new mongoose.Types.ObjectId(id.trainer) }
                    ]
                } : { [type]: new mongoose.Types.ObjectId(id) }),
                scheduledAt: {
                    $lt: requestedEndTime
                },
                $expr: {
                    $gt: [{ $add: ["$scheduledAt", "$duration"] }, requestedStartTime]
                }
            })
        }

        function find(type, _id) {
            return (type === "trainer" ? trainersModel : roomsModel).findOne({ _id })
        }

    }
}

module.exports = new Controller()