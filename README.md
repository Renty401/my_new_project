# FitPlanet Quest

**FitPlanet Quest** is a mobile application developed with **Ionic React** that encourages users to discover and explore hiking trails in Mauritius through **navigation, real-time information, QR codes, and gamification**.

The application is connected to a **Laravel REST API** developed as part of the Web Service Development project. The API provides hiking trail information such as location, difficulty, distance, estimated duration, safety recommendations, and trail status.

---

## Project Overview

FitPlanet Quest combines outdoor exploration with technology to provide an interactive hiking experience.

Users can:

* Discover hiking trails in Mauritius
* Use their current GPS location
* Calculate routes to hiking trails
* View weather information
* View detailed trail information
* Scan QR codes
* Earn XP through activities
* Participate in a gamified hiking experience
* Check trail difficulty and safety recommendations

---

##  Features

###  Hiking Trail Discovery

Users can browse available hiking trails and access information including:

* Trail name
* District
* Difficulty level
* Distance
* Estimated duration
* Safety information
* Trail status
* GPS coordinates
* Trail image

### GPS & Location

The application uses the device's geolocation capabilities to determine the user's current position.

This allows users to:

* Find their current location
* Locate hiking trails
* Navigate towards a selected trail

### Route Calculation

FitPlanet Quest integrates routing services to calculate routes between the user's location and hiking trails.

**OSRM (Open Source Routing Machine)** is used for route calculation.

###  Weather Information

Weather information is retrieved using the **Open-Meteo API**.

This helps users check weather conditions before starting their hiking activity.

###  QR Code Scanning

The application includes QR code scanning functionality for interactive hiking activities.

QR codes can be used as checkpoints or activities within the gamified experience.

### XP & Gamification

Users can earn **Experience Points (XP)** by completing activities.

The gamification system is designed to make hiking more interactive and encourage users to explore more trails.

---

# System Architecture

The project follows a client-server architecture.

```text
                    ┌──────────────────────┐
                    │   FitPlanet Quest    │
                    │   Ionic React App    │
                    └──────────┬───────────┘
                               │
                               │ HTTP Requests
                               ▼
                    ┌──────────────────────┐
                    │    Laravel REST API  │
                    │       Backend        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │        MySQL         │
                    │       Database       │
                    └──────────────────────┘


External Services:

 ┌──────────────┐
 │  Open-Meteo  │ → Weather information
 └──────────────┘

 ┌──────────────┐
 │     OSRM     │ → Route calculation
 └──────────────┘

 ┌──────────────┐
 │  Nominatim   │ → Location / geocoding
 └──────────────┘
```

---

# 🛠️ Technologies Used

## Frontend

* **Ionic React**
* **React**
* **JavaScript / TypeScript**
* **HTML**
* **CSS**

## Backend

* **Laravel**
* **PHP**
* **REST API**

## Database

* **MySQL**

## External APIs & Services

* **Open-Meteo** — Weather information
* **OSRM** — Route calculation
* **Nominatim** — Geocoding and location services
* **GPS / Geolocation** — User location
* **QR Code Scanner** — QR-based activities

---

# 📂 Project Structure

A simplified structure of the application is:

```text
FitPlanetQuest/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── assets/
│   └── ...
│
├── public/
│
├── package.json
├── ionic.config.json
├── capacitor.config.ts
└── README.md
```

> The exact structure may vary depending on the current version of the project.

---

# 🔗 Backend API

FitPlanet Quest communicates with a Laravel REST API responsible for managing hiking trail data.

The API provides information such as:

```text
Trail
├── ID
├── Trail Name
├── District
├── Difficulty
├── Distance (km)
├── Estimated Duration
├── Safety Note
├── Status
├── Image URL
├── Latitude
└── Longitude
```

The mobile application retrieves this information through HTTP requests.

---

# Installation & Setup

## 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/FitPlanetQuest.git
```

Move into the project directory:

```bash
cd FitPlanetQuest
```

---

## 2. Install dependencies

Install the required Node.js packages:

```bash
npm install
```

---

## 3. Configure the API

Make sure the Laravel backend is running.

Update the API base URL in the application configuration/service file.

For example:

```text
http://localhost:8001/api
```

> Replace the URL with the address of your running Laravel API.

---

## 4. Start the Ionic application

Run:

```bash
ionic serve
```

The application should then be available through the local development server.

---

#  API Integration

The application communicates with the Laravel backend using HTTP requests.

Example flow:

```text
User opens Hiking Trails
          ↓
Ionic React sends API request
          ↓
Laravel REST API
          ↓
MySQL Database
          ↓
Trail information returned
          ↓
Ionic React displays the trails
```

---

# External Services

## Open-Meteo

Used to retrieve weather information based on geographical coordinates.

```text
Trail Coordinates
       ↓
Open-Meteo API
       ↓
Weather Information
       ↓
Displayed in the App
```

## OSRM

Used for calculating routes between the user's current location and hiking destinations.

```text
User Location + Trail Location
              ↓
             OSRM
              ↓
        Calculated Route
```

## Nominatim

Used for geocoding and location-related operations.

---

# 🧪 Testing

The backend API can be tested using tools such as **Postman**.

Example API request:

```http
GET /api/trails
```

The response contains the available hiking trails.

The mobile application can then consume this data and display it to the user.

---

#  Security Considerations

The project follows basic security practices including:

* API-based communication between frontend and backend
* Input validation on the backend
* Database access through Laravel
* Avoiding hard-coded sensitive credentials
* Using environment configuration for sensitive settings

Sensitive information such as API keys or database credentials should **not** be committed to GitHub.

---

# Project Objectives

The main objectives of FitPlanet Quest are to:

1. Promote exploration of hiking trails in Mauritius.
2. Provide users with useful trail and safety information.
3. Integrate location-based technologies into a mobile application.
4. Demonstrate the use of REST APIs in a real-world application.
5. Use external APIs for weather and routing services.
6. Introduce gamification through XP and QR-based activities.
7. Provide an interactive and user-friendly hiking experience.

---

# 📚 Academic Context

**Project:** FitPlanet Quest
**Course:** Web Service Development
**Application Type:** Mobile Application
**Frontend:** Ionic React
**Backend:** Laravel REST API
**Database:** MySQL

This project demonstrates the integration of a mobile frontend with a RESTful backend and external web services.

---

# Author

**Renty Andrianina Randrianarisoa**

Software Engineering Student
University of Technology, Mauritius

---

# License

This project was developed for academic purposes.

---
