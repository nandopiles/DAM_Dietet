const { MongoClient } = require("mongodb");
const uri =
    "mongodb+srv://admin:admin@nutgod.adcito8.mongodb.net/?retryWrites=true&w=majority"

const client = new MongoClient(uri);

let users

async function run() {
    try {
        const database = client.db('Dietet_db');
        const usersCollection = database.collection('users');
        //paso toda la info de la Colección Users a un Array para trabajar con él
        users = await usersCollection.find({}).toArray()
        users.forEach(user => console.log(user))
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

run()
    .then(() => {
        document.getElementById("btnLogin").addEventListener('click', () => {
            //el forEach no le puedo forzar que termine
            for (let i = 0; i < users.length; i++) {
                if (users[i].name == document.getElementById("username").value &&
                    users[i].password == document.getElementById("password").value) {
                    console.log("OOOOOOLEEEEEE")
                    return;
                } else {
                    console.log("[-] Error " + document.getElementById("username").value)
                }
            }
        })

    })
    .catch(console.dir);