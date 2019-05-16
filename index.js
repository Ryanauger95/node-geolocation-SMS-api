const express = require('express');
const ipInfo = require('./config/ipInfo');
const app = express();
const cors = require('cors');


// Register all API endpoints
require('./routes/qrCodeRoutes')(app);
require('./routes/scheduleRoutes')(app);


app.use(cors());
app.listen(ipInfo.localPort);
