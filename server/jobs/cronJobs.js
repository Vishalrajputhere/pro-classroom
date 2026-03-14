const cron = require("node-cron");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Class = require("../models/Class");

const startCronJobs = () => {
    console.log("⏱️  Cron Jobs initialized.");

    // Runs every day at 8:00 AM
    cron.schedule("0 8 * * *", async () => {
        try {
            console.log("\n⏱️  [CRON] Running daily deadline reminder check...");

            const now = new Date();
            const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            const upcomingAssignments = await Assignment.find({
                dueDate: { $gte: now, $lte: in24h },
            }).populate("class");

            if (upcomingAssignments.length === 0) {
                console.log("⏱️  [CRON] No imminent deadlines found today.");
                return;
            }

            console.log(`⏱️  [CRON] Found ${upcomingAssignments.length} assignment(s) due soon.`);

            for (const assignment of upcomingAssignments) {
                const classDoc = assignment.class;
                if (!classDoc || !classDoc.students || classDoc.students.length === 0) continue;

                const populatedClass = await Class.findById(classDoc._id).populate("students", "email username");
                if (!populatedClass) continue;

                const alreadySubmitted = await Submission.find({ assignment: assignment._id }).distinct("student");
                const alreadySubmittedSet = new Set(alreadySubmitted.map(String));

                for (const student of populatedClass.students) {
                    if (alreadySubmittedSet.has(String(student._id))) continue;

                    console.log(
                        `🔔 [REMINDER] To: ${student.username} (${student.email}) | Assignment: "${assignment.title}" | Due: ${new Date(assignment.dueDate).toLocaleDateString()}`
                    );
                }
            }

            console.log("⏱️  [CRON] Deadline reminder job complete.\n");
        } catch (err) {
            console.error("⏱️  [CRON ERROR] Failed to run deadline check:", err);
        }
    });
};

module.exports = startCronJobs;
