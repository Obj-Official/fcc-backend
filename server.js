const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// mongoose.connect(process.env.LOCAL_MONGODB, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
// .then(() => console.log('MongoDB Connected'))
// .catch(err => console.error('MongoDB Connection Error:', err));

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_CONNECT_URI)
        console.log('MongoDB Connected')
    }catch (error){
        console.log('MongoDB Connection Error:', error);   
    }
}
connectDB()

const Booking = require('./models/Booking');

app.get('/allbookings', async(req, res)=>{
    const bookings = await Booking.find();

    res.json(bookings);
});

app.put('/approve-booking/:id', async (req, res) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id, 
            { approved: true }, 
            { new: true } // Return updated document
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: "Error updating booking", error });
    }
});

app.put('/cancel-booking/:id', async (req, res) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id, 
            { canceled: true }, 
            { new: true } // Return updated document
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: "Error updating booking", error });
    }
});

app.get('/todaybookings', async (req, res) => {
    try {
        const now = new Date();
        
        // Convert to WAT (UTC+1) by adding one hour
        const offset = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
        const watTime = new Date(now.getTime() + offset);

        // Set WAT start of today
        const startOfToday = new Date(watTime);
        startOfToday.setHours(23, 59, 59, 999);

        // Set WAT end of today
        const endOfToday = new Date(watTime);
        endOfToday.setHours(47, 59, 59, 999);

        const bookings = await Booking.find({
            date: { $gte: startOfToday, $lte: endOfToday }
        });

        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
});

app.post('/newbooking', async (req, res) => {
    try {
        // Extract request body
        const {
            serviceName, date, time, firstName, lastName, email, phoneNumber, address,
            gender, dateOfBirth, age, occupation, nextOfKinFullName, nextOfKinPhone,
            nextOfKinEmail, relationshipWithNextOfKin, pdfBase64URL
        } = req.body;

        // Ensure all required fields are provided
        if (!serviceName || !date || !time || !firstName || !lastName || !email ||
            !phoneNumber || !address || !gender || !dateOfBirth || !age || !occupation ||
            !nextOfKinFullName || !nextOfKinPhone || !nextOfKinEmail || !relationshipWithNextOfKin) {
            return res.status(400).json({ error: "All required fields must be provided." });
        }

        // Generate a unique booking ID
        const generateBookingId = () => {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let bookingId = "";
            for (let i = 0; i < 8; i++) {
                bookingId += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return bookingId;
        };

        const getUniqueBookingId = async () => {
            let bookingID;
            let exists = true;

            while (exists) {
                bookingID = generateBookingId();
                const existingBooking = await Booking.findOne({ bookingID });
                if (!existingBooking) {
                    exists = false;
                }
            }
            return bookingID;
        };

        let bookid = await getUniqueBookingId();

        // Create new booking
        const booking = new Booking({
            bookingID: bookid,
            serviceName, date, time, firstName, lastName, email, phoneNumber, address,
            gender, dateOfBirth, age, occupation, nextOfKinFullName, nextOfKinPhone,
            nextOfKinEmail, relationshipWithNextOfKin, pdfBase64URL
        });

        await booking.save(); // Save the booking to MongoDB
        res.status(201).json(booking);

    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

const port = process.env.PORT
app.listen(port, "0.0.0.0", () => console.log('Server connected on port ' + port));