const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();

const SERVER_PORT_DEFAULT = 3333;
const PORT = process.env.PORT || SERVER_PORT_DEFAULT;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use(function (req, res, next) {
    console.log(process.env.NODE_API_HOST);

    if (req.originalUrl.includes('/DATA')) {
        axios.get(req.originalUrl).then((response) => {
            res.send(response.data);
        });
    }

    if (req.originalUrl.includes('api')) {
        axios.get(req.originalUrl).then((response) => {
            res.send(response.data);
        });
    }

    next();
});

app.listen(PORT, function () {
    console.log(`API Server listening on port ${PORT}`);
});

process.on('SIGINT', () => {
    console.log('SIGINT');
    process.exit();
});
