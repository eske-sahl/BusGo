const express = require('express');
const cors=require('cors');
const stopRoutes = require("./routes/stops");
const busRoutes = require("./routes/busroute");
const routeRoutes = require("./routes/routes");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require("./db");
const earningsRoutes = require("./routes/earnings");
const usersRoute = require("./routes/users-route");
const driverRequestsRoute = require("./routes/driver-requests");






const app = express();


app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use("/api/stops", stopRoutes);
app.use("/api/bus", busRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/earnings", earningsRoutes);
app.use("/api/driver-requests", driverRequestsRoute);
app.use("/api/users", usersRoute);



app.post('/register', async (req, res) => {
    const {
        Email, Username, Password, Phone, Role,
        Designation, Place, DOB, Photo, Fullname, Gender
    } = req.body;

    if (!Email || !Username || !Password || !Role) {
        return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    try {
        const hashedPassword = await bcrypt.hash(Password, 10);

        const SQL = `
            INSERT INTO users 
            (email, username, password, phone, role, designation, place, dob, photo, fullname, gender)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            Email, Username, hashedPassword, Phone || null,
            Role, Designation || null, Place || null, DOB || null,
            Photo || null, Fullname || null, Gender || null
        ];

        db.query(SQL, values, (err, result) => {
            if (err) {
                console.error("Register error:", err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ success: false, message: "Email or username already exists" });
                }
                return res.status(500).json({ success: false, message: "Database error" });
            }

            res.status(201).json({
                success: true,
                message: "Registration successful! Please login."
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
app.post('/login', (req, res) => {
    const { LoginEmail, LoginPassword } = req.body;

    if (!LoginEmail || !LoginPassword) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const SQL = "SELECT * FROM users WHERE email = ?";
    
    db.query(SQL, [LoginEmail], async (err, results) => {
        if (err) {
            console.error("Login DB error:", err);
            return res.status(500).json({
                success: false,
                message: "Server error – please try again later"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password p"
            });
        }

        const user = results[0];

        // Compare hashed password
        const passwordMatch = await bcrypt.compare(LoginPassword, user.password);
        console.log(LoginPassword);
        console.log(user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password o"
            });
        }

        // Never send password back
        const safeUser = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            username: user.username,
            role: user.role,
            phone: user.phone,
            place: user.place,
            dob: user.dob,
            designation: user.designation,
            photo: user.photo,
            gender: user.gender
        };

        // Create JWT
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }   // or '7d', '1h' — your choice
        );

        return res.json({
            success: true,
            message: "Login successful",
            token,           // ← frontend will store this
            user: safeUser   // ← same shape your dashboards already expect
        });
    });
});
app.get('/test', (req, res) => {
    res.send("Backend OK");
});

app.get('/Buses', (req, res) => {
  const SQL = `
    SELECT 
      b.id,
      b.name,
      b.number,
      b.capacity,
      b.status,
      b.driver,
      r.route_name,
      r.start_place,
      r.end_place,
      r.start_time,
      r.end_time
    FROM buses b
    LEFT JOIN routes r ON b.id = r.bus_id
  `;

  db.query(SQL, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.listen(3002,()=>{
    console.log("Server is running on port 3002");
})

