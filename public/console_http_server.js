const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();

const SERVER_PORT_DEFAULT = 3333;
const PORT = process.env.PORT || SERVER_PORT_DEFAULT;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use(async (req, res, next) => {
    const API_HOST_FLOW_COLLECTOR = process.env.NODE_API_HOST_FLOW_COLLECTOR;

    if (req.originalUrl.includes('/DATA')) {
        const { data } = await axios.get(`${API_HOST}${req.originalUrl}`);

        res.json(data);
    }

    if (req.originalUrl.includes('/api')) {
        const { data } = await axios.get(`${API_HOST_FLOW_COLLECTOR}${req.originalUrl}`);

        res.json(data);
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
