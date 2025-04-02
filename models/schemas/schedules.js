module.exports = (connection, mongoose) => {
    return connection.model("schedule", new mongoose.Schema(
        {
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
            },
            trainer: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "trainer",
                required: true
            },
            scheduledAt: {
                type: Date,
                required: true
            },
            duration: {
                type: Number,
                required: true
            },
            room: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "room",
                required: true
            },
            status: {
                type: String,
                enum: ["Scheduled", "Completed", "Cancelled"],
                default: "Scheduled"
            }
        },
        { timestamps: true }
    ))
}