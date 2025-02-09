const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const courses = require("./courses");
const students = require("./students");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.get("/courses", (req, res) => {
    res.send(courses);
});

app.get("/students", (req, res) => {
    res.send(students);
});

app.get("/students/:username", (req, res) => {
    const student = students.find((s) => s.username === req.params.username);
    if (student) {
        res.send(student);
    } else {
        res.status(404).json({ error: "Student not found" });
    }
});

app.get("/students/:id/courses", (req, res) => {
    const studentId = parseInt(req.params.id);
    const enrolledCourses = courses.filter((course) =>
        course.students.some((student) => student.id === studentId)
    );
    res.send(enrolledCourses);
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("likeCourse", ({ courseId, userId }) => {
        const course = courses.find((c) => c.id === courseId);
        if (course) {
            if (course.likedBy.includes(userId)) {
                course.likes -= 1;
                course.likedBy = course.likedBy.filter((id) => id !== userId);
                io.emit("updateLikes", courses);
            } else {
                course.likes += 1;
                course.likedBy.push(userId);
                io.emit("updateLikes", courses);
            }
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(5000, () => {
    console.log("Server running on port 5000");
});
