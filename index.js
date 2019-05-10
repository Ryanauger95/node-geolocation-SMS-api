const express = require('express');
const ipInfo = require('./config/ipInfo');
require('./services/passport');
const app = express();
require('./routes/authRoutes')(app);


app.listen(ipInfo.localPort);
