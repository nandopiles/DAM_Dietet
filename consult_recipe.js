const { MongoClient } = require("mongodb");
const { dialog } = require('@electron/remote')

const uri =
    "mongodb+srv://admin:admin@nutgod.adcito8.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri);


let recipesCollection
let recipes
let usersCollection
let user

async function run() {
    try {
        const database = client.db('Dietet_db');
        recipesCollection = database.collection('recipes');
        usersCollection = database.collection('users')

        recipes = await recipesCollection.find({}).toArray()
        //recipes.forEach(recipe => console.log(recipe))
    } finally {
        await client.close();
    }
}

run()
    .then(() => {
        let favsArray = []
        // gets the id of the recipe to show and the username
        let valor = window.location.search
        const urlParams = new URLSearchParams(valor);
        var recipeId = urlParams.get('id');
        var username = urlParams.get('username')
        console.log(username)

        const recipeSearched = recipes.find(obj => obj._id == recipeId);
        console.log(recipeSearched);

        let searchUser = async () => {
            await client.connect()
            user = await usersCollection.findOne({ name: username })
            console.log("[*] Ready => " + user._id);
            client.close()
        }
        searchUser()

        /**
         * Goes back to the Main Window page
         */
        document.getElementById("btnBack").addEventListener('click', (e) => {
            e.preventDefault()
            window.location = "main_window.html?name=" + username
        })

        /**
         * Fills the info of the recipe founded in the Db
         * @param {*} recipe the obj recipe
         */
        let fillInfoRecipe = () => {
            document.getElementById("title").innerHTML = recipeSearched.name
            let listIngredients = ""
            recipeSearched.ingredients.split(",").forEach(ingredient => {
                listIngredients += `<li class="lead">${ingredient}</li>`
            });
            document.getElementById("ingredients").innerHTML = listIngredients
            document.getElementById("prepTime").innerHTML = recipeSearched.prepTime
            let listSteps = ""
            recipeSearched.steps.split(".").forEach(step => {
                listSteps += `<li class="lead">${step}</li>`
            });
            document.getElementById("steps").innerHTML = listSteps
            document.getElementById("author").innerHTML = recipeSearched.author
        }
        fillInfoRecipe()

        document.getElementById("btnFavorite").addEventListener('click', async (e) => {
            e.preventDefault()

            if (document.getElementById("btnFavorite").classList.contains('bi-heart')) {
                favsArray = user.favs
                favsArray.push(recipeId)

                await client.connect()
                await usersCollection.updateOne(
                    { _id: user._id },
                    { $set: { favs: favsArray } }
                )
                console.log("[+] Recipe added to Favs");
                client.close()
                //change the aspect of the btn
                document.getElementById("btnFavorite").classList.replace('bi-heart', 'bi-heart-fill')
            } else if (document.getElementById("btnFavorite").classList.contains('bi-heart-fill')) {
                //it's on favs, it have to delete the idRecipe from the list =>

                //change the aspect of the btn
                document.getElementById("btnFavorite").classList.replace('bi-heart-fill', 'bi-heart')
            }
        })
    }).catch(console.dir)