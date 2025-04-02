module.exports = (connection, mongoose) => {
    return connection.model("room", new mongoose.Schema(
        {
            room_number: {
                type: Number,
                required: true
            }
        },
        { timestamps: true }
    ))
}