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
        recipes.forEach(recipe => console.log(recipe))
    } finally {
        await client.close();
    }
}

run()
    .then(() => {
        // gets the username of the user that has been logged
        let valor = window.location.search
        const urlParams = new URLSearchParams(valor);
        var username = urlParams.get('name');
        console.log("[+] Log => " + username);

        // prints the username on the sidebar
        document.getElementById("welcomeText").innerHTML = document.getElementById("welcomeText").textContent + username + "!!"

        /**
         * Button for Logging Out
         */
        document.getElementById("btnLogout").addEventListener('click', (e) => {
            e.preventDefault()
            window.location = "login.html"
        })

        /**
         * Shows all the recipes saved on the Db in a good way
         */
        let showRecipes = (listFilteredRecipes) => {
            let listRecipes = ""

            listFilteredRecipes.forEach((recipe, index) => {
                let category
                switch (recipe.category) {
                    case 1:
                        category = `
                            <span class="icon icon-record center good"></span> Fit`
                        break;
                    case 2:
                        category = `
                            <span class="icon icon-record center normal"></span> Normal`
                        break;
                    case 3:
                        category = `
                            <span class="icon icon-record bad"></span> Unhealthy`
                        break;
                }

                listRecipes += `
                <div class="col-lg-6 col-xxl-4 mb-5">
                    <div class="card bg-light border-0 h-100">
                        <div class="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                            <div class="feature bg-warning bg-gradient text-white rounded-3 mb-4 mt-n4">
                                <i class="bi bi-wrench"></i>
                            </div>
                            <h2 class="fs-4 fw-bold">${recipe.name}</h2>
                            <p class="mb-0">Category: ${category}</p>
                            <p class="mb-0">Prep Time: ${recipe.prepTime}</p>
                            <p class="mb-0">Author: ${recipe.author}</p>
                        </div>
                        <button type="button" class="btn btn-outline-warning btn-large" id=btnRecipe${index}><b class="lead">View Details »</b></button>
                    </div>
                </div>`
            });
            document.getElementById("gallery").innerHTML = listRecipes
        }
        showRecipes(recipes)

        /**
         * Creates the Listeners for seeing all the details of the recipe
         */
        let createListenersRecipes = (listRecipes) => {
            listRecipes.forEach((element, index) => {
                document.getElementById("btnRecipe" + index).addEventListener('click', (e) => {
                    e.preventDefault()
                    console.log(element.name);
                    window.location = "consult_recipe.html?id=" + element._id + "&username=" + username
                })
            });
        }
        createListenersRecipes(recipes)

        /**
         * Checks the recipes that have to be shown indicated on the filters
         */
        let check = () => {
            let selected = []
            let listFilteredRecipes = []

            if (document.getElementById("fitCheck").checked) {
                selected.push("Fit")
                recipes.forEach(recipe => {
                    if (recipe.category == 1) {
                        listFilteredRecipes.push(recipe)
                    }
                });
            }
            if (document.getElementById("normalCheck").checked) {
                selected.push("Normal")
                recipes.forEach(recipe => {
                    if (recipe.category == 2) {
                        listFilteredRecipes.push(recipe)
                    }
                });
            }
            if (document.getElementById("unhealthyCheck").checked) {
                selected.push("Unhealthy")
                recipes.forEach(recipe => {
                    if (recipe.category == 3) {
                        listFilteredRecipes.push(recipe)
                    }
                });
            }
            console.log("Selected => " + selected.join(", "));
            showRecipes(listFilteredRecipes)
            createListenersRecipes(listFilteredRecipes)
        }

        document.getElementById("fitCheck").addEventListener("click", check)
        document.getElementById("normalCheck").addEventListener("click", check)
        document.getElementById("unhealthyCheck").addEventListener("click", check)

        /**
         * SearchBox to search specific recipes
         */
        document.getElementById("searchBox").addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault()
                let listRecipesFound = []
                recipes.forEach(recipe => {
                    if (recipe.name.toLowerCase().includes(document.getElementById("searchBox").value.toLowerCase())) {
                        listRecipesFound.push(recipe)
                    }
                });
                showRecipes(listRecipesFound)
                createListenersRecipes(listRecipesFound)
            }
        })
    }).catch(console.dir)