const db = require('./models');


const test = async () => {

    let results = await db.users.findByPk('87e53080-ad4f-4d0b-b79b-8e7b9b881645')
    console.log(results)
}
test()
