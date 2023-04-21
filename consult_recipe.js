const { MongoClient } = require("mongodb");
const { dialog } = require('@electron/remote')

const uri =
    "mongodb+srv://admin:admin@nutgod.adcito8.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri);


let recipesCollection
let recipes

async function run() {
    try {
        const database = client.db('Dietet_db');
        recipesCollection = database.collection('recipes');

        recipes = await recipesCollection.find({}).toArray()
        //recipes.forEach(recipe => console.log(recipe))
    } finally {
        await client.close();
    }
}

run()
    .then(() => {
        // gets the id of the recipe to show and the username
        let valor = window.location.search
        const urlParams = new URLSearchParams(valor);
        var recipeId = urlParams.get('id');
        var username = urlParams.get('username')
        console.log(username)

        const recipeSearched = recipes.find(obj => obj._id == recipeId);
        console.log(recipeSearched);

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

        document.getElementById("btnDownload").addEventListener('click', (e) => {
            e.preventDefault()

        })
    }).catch(console.dir)