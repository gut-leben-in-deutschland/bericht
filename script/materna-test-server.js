const express = require('express');

const app = express();

app.use('/static/LB', express.static('build'));

app.listen(8081, () => console.log(`Hey http://localhost:8081/static/LB/`)); // eslint-disable-line no-console
