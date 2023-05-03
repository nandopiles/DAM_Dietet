const { MongoClient } = require("mongodb");
const { dialog } = require('@electron/remote')
const uri =
    "mongodb+srv://admin:admin@nutgod.adcito8.mongodb.net/?retryWrites=true&w=majority"

const client = new MongoClient(uri);


let recipesCollection
let recipes
let usersCollection
let users
let selectedUser

async function run() {
    try {
        const database = client.db('Dietet_db');
        recipesCollection = database.collection('recipes');
        usersCollection = database.collection('users')

        recipes = await recipesCollection.find({}).toArray()
        users = await usersCollection.find({}).toArray()
        //recipes.forEach(recipe => console.log(recipe))
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
         * Fills the fields with the info of the user (email and username)
         */
        let fillEditInfo = async () => {
            await client.connect()
            selectedUser = await usersCollection.findOne({ name: username })
            client.close()

            document.getElementById("username").value = selectedUser.name
            console.log("[+] User info filled");
        }
        fillEditInfo()

        /**
         * Button for Logging Out
         */
        document.getElementById("btnLogout").addEventListener('click', (e) => {
            e.preventDefault()
            window.location = "login.html"
        })

        /**
         * Prints all the recipes saved on the Db in a good way
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
                        <button type="button" class="btn btn-outline-warning btn-large" id=btnRecipe${index}><b class="lead fs-6">View Details »</b></button>
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

        /**
         * Shows/hides the field of the username
         */
        document.getElementById("editProfile").addEventListener('click', (e) => {
            e.preventDefault()

            document.getElementById("textUsername").classList.toggle('d-none')
            document.getElementById("username").classList.toggle('d-none')
            document.getElementById("btnUpdate").classList.toggle('d-none')
        })

        /**
         * Shows/hides the field of the password
         */
        document.getElementById("editPassword").addEventListener('click', (e) => {
            e.preventDefault()

            document.getElementById("textPasswords").classList.toggle('d-none')
            document.getElementById("password1").classList.toggle('d-none')
            document.getElementById("password2").classList.toggle('d-none')
            document.getElementById("btnUpdatePassword").classList.toggle('d-none')
        })

        /**
         * Checks if the username is already in use
         * @returns if the operation can be done
         */
        let checkUserInfoIsValid = () => {
            for (let i = 0; i < users.length; i++) {
                if (users[i].name == document.getElementById("username").value) {
                    dialog.showErrorBox('Error', 'Username is already in use.')
                    return false;
                }
            }
            return true;
        }

        /**
         * Updates the username
         */
        document.getElementById("btnUpdate").addEventListener('click', async (e) => {
            e.preventDefault()

            if (checkUserInfoIsValid() && confirm("Are you sure to update the Username to " + document.getElementById("username").value + "?")) {
                await client.connect()
                await usersCollection.updateOne(
                    { _id: selectedUser._id },
                    {
                        $set:
                        {
                            name: document.getElementById("username").value
                        }
                    }
                )
                client.close()
                document.getElementById("welcomeText").innerHTML = `Welcome, ${document.getElementById("username").value}!!`
                console.log("[+] Username updated");
            }
        })

        /**
         * Checks if the passwords are valid
         * @returns if the operation can be done
         */
        let checkPasswords = () => {
            if (document.getElementById("password1").value != document.getElementById("password2").value ||
                document.getElementById("password1").value == "" || document.getElementById("password2").value == "") {
                dialog.showErrorBox('Error', 'Problem with the passwords.')
                return false;
            }
            return true;
        }

        /**
         * Updates the password of the user
         */
        document.getElementById("btnUpdatePassword").addEventListener('click', async (e) => {
            e.preventDefault()

            if (checkPasswords() && confirm("Are you sure to update the password?")) {
                await client.connect()
                await usersCollection.updateOne(
                    { _id: selectedUser._id },
                    {
                        $set:
                        {
                            password: document.getElementById("password1").value
                        }
                    }
                )
                client.close()
                console.log("[+] Password updated");
            }
        })

        /**
         * Redirects to other page where is a list with the Favs Recipes
         */
        document.getElementById("btnFavorite").addEventListener('click', async (e) => {
            e.preventDefault()

            window.location = "fav_page.html?user=" + document.getElementById("username").value
        })
    }).catch(console.dir)