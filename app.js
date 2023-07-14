const express = require('express')

const app = express()



const PORT =  3001

app.use(require('./routes/authentication.js'))




app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})