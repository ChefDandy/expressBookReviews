const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

app.use("/customer/auth/*", function auth(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).send({ message: 'No token provided.' });
  }

  jwt.verify(token, 'your_secret_key', function(err, decoded) {
    if (err) {
      return res.status(500).send({ message: 'Failed to authenticate token.' });
    }

    // if everything is good, save the decoded token to the request for use in other routes
    req.userId = decoded.id;
    next();
  });
});

const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
