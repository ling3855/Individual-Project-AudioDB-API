const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios');

// database configuration
const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);

// test your database
db.connect()
    .then(obj => {
        console.log('Database connection successful'); // you can view this message in the docker compose logs
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });

app.set('view engine', 'ejs');
app.use(bodyParser.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,

    })
);

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);


app.use(
    express.static("resources")
);

app.listen(3000);
console.log('Server is listening on port 3000');

app.get('/', (req, res) => {
    res.render('pages/main');
});


app.get("/search", function (req, res) {
  const query = "select * from artists";
  console.log(req.query.searchTerm)
  axios({
        url: `https://www.theaudiodb.com/api/v1/json/2/search.php?s=${req.query.searchTerm}`,
        method: 'GET',
        dataType:'json',
        headers:{
            "Accept-Encoding":'text/html;charset=UTF-8',
        }, 
        params: {
            s: req.query.searchTerm,
        }      
    })
    .then(function (response) {
        res.render("pages/search.ejs", { 
            response,
            artistName: response.data.artists[[0]].strArtist,
            artistWebsite: response.data.artists[[0]].strWebsite,
            formedYear: response.data.artists[[0]].intFormedYear,
            artistGenre: response.data.artists[[0]].strGenre,
            biographyEN: response.data.artists[[0]].strBiographyEN,
            artistBanner: response.data.artists[[0]].strArtistBanner,
        });
    })
    .catch((err) => {
        res.render("pages/main.ejs", {
            error: true,
            message: "Artist was not found or please make sure spelling is correct and check for no capitalization ",
        });
    });
});
