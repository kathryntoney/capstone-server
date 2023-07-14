const express = require('express')
const cors = require('cors')
const app = express()



const PORT = 3001
app.use(cors({ origin: "https://pocketsomm.netlify.app" }))

app.use(require('./routes/authentication.js'))




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})