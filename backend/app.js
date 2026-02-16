const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors'); 
const gmailDraftRoutes = require('./routes/gmailDraft');
const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL, 
  credentials: true 
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'));

app.use('/auth', require('./routes/auth'));  
app.use('/user', require('./routes/user')); 
app.use('/gmail', require('./routes/gmail')); 
// app.use('/ai', require('./routes/ai'));
app.use('/ai', require('./routes/ai'));
app.use('/calendar', require('./routes/calendar'));
app.use("/api/compose", require("./routes/compose"));

app.use('/ai-extra', require('./routes/aiRoutes'));



app.use('/gmail', gmailDraftRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`)
);
