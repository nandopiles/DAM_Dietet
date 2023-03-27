const { MongoClient } = require("mongodb");
const { dialog } = require('@electron/remote')
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
        //users.forEach(user => console.log(user))
    } finally {
        //Cliente se cerrará cuando la aplicación finalice/error
        await client.close();
    }
}

run()
    .then(() => {
        let userSelected
        let userFound = false

        document.getElementById("btnLogin").addEventListener('click', (e) => {
            e.preventDefault() //no recarga la página al apretar el botón
            //el forEach no se puede forzar que termine
            for (let i = 0; i < users.length; i++) {
                if (users[i].name == document.getElementById("username").value &&
                    users[i].password == document.getElementById("password").value) {
                    console.log("[+] User validated => " + users[i].name)
                    userSelected = users[i]
                    userFound = true
                    window.location = "main-window.html" //redireccionar a la vista utilizada (html)
                    return;
                }
            }
            if (!userFound) {
                let message = "Invalid information."
                console.log("[-] " + message)
                dialog.showErrorBox("Error", message)
            }
        })
    })
    .catch(console.dir);