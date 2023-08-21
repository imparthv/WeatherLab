// Created By: Parth Vasdewani
// APIs
import mysql from "mysql";
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import fetch from "node-fetch"

// Specify path to enviromental variables
dotenv.config({ path: "./.env" });

// Assigning port
const PORT = process.env.PORT;


//Setup Database
const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
});

// checking database connection
connection.connect((err) => {
    if (err) {
        return console.error("error: " + err.message);
    }
    console.log("Connected to MySQL server");
});

// Initialising express app
const app = express();

// Associating modules required along with Express
// The secret variable is used to secure session data
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}))

// The json and urlencoded methods will extract the form data from our html file.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", ".hbs");

// Other imports
import path from "path";
const __dirname = path.resolve();
const publicDir = path.join(__dirname, "./public");
app.use(express.static(publicDir));

// Index Page to be displayed to the client upon creating new connection
app.get("/", (req, res) => {
    const weatherData = {
        location: "Location",
        temperature: "Temperature",
        description: "Description",
        feelsLike: "Feels Like",
        humidity: "Humidity",
        windSpeed: "Wind Speed"
    }
    res.render("index", { weatherData: weatherData });
})

// Fetching weather details of submitted location
app.post("/", async (req, res) => {
    var userLocation = await req.body.userLocation;
    const API_KEY = process.env.API_KEY
    const api_url = `https://api.openweathermap.org/data/2.5/weather?q=${userLocation}&appid=${API_KEY}&units=metric`;
    const apiResponse = await fetch(api_url);
    // Changing recieved data into json format
    const weatherData = await apiResponse.json();
    const temperature = Math.floor(weatherData.main.temp);
    const description = weatherData.weather[0].description;
    const feelsLike = weatherData.main.feels_like;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed
    const sendWeatherData = {
        location: userLocation,
        temperature: temperature,
        feelsLike: feelsLike,
        description: description,
        humidity: humidity,
        windSpeed: windSpeed
    }

    res.render("index", { weatherData: sendWeatherData });
    // res.end();
})

//Listening to server
app.listen(PORT, () => {
    console.log(`Server is running successfully on ${PORT}`)
});