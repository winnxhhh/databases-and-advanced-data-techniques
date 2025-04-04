const express = require('express');
const bodyParser = require('body-parser');
const mustacheExpress = require('mustache-express');
const mysql = require('mysql');
const app = express();
const PORT = 3000;

// Body-parser middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public')); // Set location of static files

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'resale_flats'
});

// Connect db to app
db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1); // Exit the application if the connection fails
  }
  console.log('Connected to the MySQL database.');
});

// Configure Mustache
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

// Start of self written code
// Serve the main page
app.get('/', (req, res) => {
  console.log('Request received on /');
  res.render('index.mustache');
});

// Add all route handlers to the app under the path /resale
const resaleRoutes = require('./routes/resale');
app.use('/resale', resaleRoutes(db));

// Export db object
module.exports.db = db;
// End of self written code

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});