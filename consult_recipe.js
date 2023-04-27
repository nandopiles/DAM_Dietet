const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;
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
        //console.log(username)

        const recipeSearched = recipes.find(obj => obj._id == recipeId);
        console.log(recipeSearched);

        let searchUser = async () => {
            await client.connect()
            user = await usersCollection.findOne({ name: username })
            console.log("[*] Ready => " + user._id);
            client.close()

            //gets the favorite list of the user selected
            favsArray = user.favs

            //changes the icon if the recipe is in the favsList already
            if (favsArray.some(fav => fav.equals(recipeSearched._id))) {
                document.getElementById("favoriteIcon").classList.replace('bi-heart', 'bi-heart-fill')
            }
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

            if (document.getElementById("favoriteIcon").classList.contains('bi-heart')) {
                //change the aspect of the Icon
                document.getElementById("favoriteIcon").classList.replace('bi-heart', 'bi-heart-fill')

                favsArray.push(recipeSearched._id)
                await client.connect()
                await usersCollection.updateOne(
                    { _id: user._id },
                    { $set: { favs: favsArray } }
                )
                client.close()
                console.log(`[+] Recipe "${recipeSearched.name}" added to Favs`);
            } else {
                //change the aspect of the Icon
                document.getElementById("favoriteIcon").classList.replace('bi-heart-fill', 'bi-heart')

                let newFavsArray = []
                //checks if the idRecipe is different from the one passed by parameter and pushes the id to a newFavsArray
                favsArray.forEach(id => {
                    if (!(id == recipeId)) {
                        newFavsArray.push(id)
                    }
                });
                await client.connect()
                await usersCollection.updateOne(
                    { _id: user._id },
                    { $set: { favs: newFavsArray } }
                )
                client.close()
                console.log(`[+] Recipe "${recipeSearched.name} deleted from Favs`);
            }
        })
    }).catch(console.dir)