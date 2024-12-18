const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crosgifRouter = require('./routes/crosgifGgRouter');
const fbRouter = require('./routes/fbGgRouter');

const app = express();
const PORT = process.env.PORT || 1337;

app.use(cors());
app.use(bodyParser.json());
app.use('/api/cgsheets/', crosgifRouter);
app.use('/api/fbsheets/', fbRouter);

app.get('/', async (req, res) => {
  res.send('Hello');
});

app.listen(PORT, () => console.log(`app listening on port ${PORT}`));
