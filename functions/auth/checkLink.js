const Mongob = require('../../utils/mongodb/mongodb.js');



const checkLink = async (req, res) => {
    const { id } = req.body;
    function hasNotPassedDays(dateString, days) {
        // Parse the input date string
        const givenDate = new Date(dateString);
        // Get the current date
        const currentDate = new Date();
    
        // Calculate the difference in time (in milliseconds)
        const timeDifference = currentDate - givenDate;
        // Convert milliseconds to days
        const daysDifference = timeDifference / (1000 * 60 * 60 * 24); // 1000 ms * 60 s * 60 min * 24 hr
    
        // Return true if the difference is less than the specified days (i.e., not passed)
        return daysDifference < days;
    }

    try {
        const regId = await Mongob('ManageWise', 'regId', async (collection) => {
            return await collection.findOne({ _id: id });
        });

        if (!regId) {
            return res.status(404).json({ error: "Link not found" });
        }

        if (hasNotPassedDays(regId.time, 7)) {
            res.status(200).json({ message: "OK" });
        } else {
            res.status(401).json({ error: "Link expired" });
        }
    } catch (error) {
        console.error("Error checking link:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { checkLink };
