module.exports = (connection, mongoose) => {
    return connection.model("trainer", new mongoose.Schema(
        {
            name: {
                type: String,
                required: true
            }
        },
        { timestamps: true }
    ))
}
