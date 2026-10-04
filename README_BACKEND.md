# Attendance Analyzer Pro — SMS Backend Server Setup Guide

This directory contains backend server scripts written in **Python (Flask)** and **Node.js (Express)** to send real SMS text messages to students or parents when a student is marked **ABSENT** for a class date.

---

## Option 1: Running Python Flask Backend Server (Recommended)

### 1. Install Dependencies
```bash
pip install flask flask-cors twilio
```

### 2. Configure Twilio Credentials
Open `server.py` and replace the placeholder credentials with your Twilio Account credentials:
```python
TWILIO_ACCOUNT_SID = "YOUR_ACTUAL_TWILIO_ACCOUNT_SID"
TWILIO_AUTH_TOKEN  = "YOUR_ACTUAL_TWILIO_AUTH_TOKEN"
TWILIO_PHONE_NUMBER = "+18005550199" # Your Twilio phone number
```
*Or set environment variables:*
```bash
export TWILIO_ACCOUNT_SID="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
export TWILIO_AUTH_TOKEN="your_auth_token"
export TWILIO_PHONE_NUMBER="+18005550199"
```

### 3. Start the Python Server
```bash
python server.py
```
The server will run at: Student Login Dashboard
Student can log in with ID/password
View own attendance
Subject-wise percentage
Attendance shortage warning
Leave status
Faculty Dashboard
Faculty sees only assigned subjects/classes
Mark attendance
Edit attendance with reason
View subject reports
Real Database Backend
Node.js + Express
MySQL
Store students, attendance, users, leaves, timetable, etc.
Your current page has a cloud/API sync area, but a real backend would make the project much more complete.

---

## Option 2: Running Node.js Express Backend Server

### 1. Install Dependencies
```bash
npm install express cors twilio dotenv
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+18005550199
```

### 3. Start the Node Server
```bash
node server.js
```

---

## Web App Integration & Testing

1. Open the Attendance Analyzer web app ([index.html](../web/index.html) or [attendance_analyzer_standalone.html](../web/attendance_analyzer_standalone.html)).
2. Go to **Mark Attendance**, select a date, and mark attendance for your class.
3. Click the **"Send SMS to Absent Students ($U - A$)"** button.
4. If your backend server is running on `http://localhost:5000`, the web app will connect to it and trigger real SMS delivery via Twilio!
5. If the server is offline or Twilio credentials are not set, the web app automatically falls back to **Browser SMS Simulation Mode** so you can view all generated SMS messages right in the web UI outbox log.
