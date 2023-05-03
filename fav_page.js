const { MongoClient } = require("mongodb");
const { dialog } = require('@electron/remote')
const uri =
    "mongodb+srv://admin:admin@nutgod.adcito8.mongodb.net/?retryWrites=true&w=majority"

const client = new MongoClient(uri);


let usersCollection
let users

async function run() {
    try {
        const database = client.db('Dietet_db');
        recipesCollection = database.collection('recipes');
        usersCollection = database.collection('users')

        //await recipesCollection.find({}).toArray()
        users = await usersCollection.find({}).toArray()
    } finally {
        await client.close();
    }
}

run()
    .then(() => {
        let valor = window.location.search
        const urlParams = new URLSearchParams(valor);
        var username = urlParams.get('user');

        /**
         * Goes back to the main page
         */
        document.getElementById("btnBack").addEventListener('click', (e) => {
            e.preventDefault()

            window.location = "main_window.html?name=" + username
        })

        let userSelected
        let favList = []

        /**
         * Finds the objet User with the name passed
         */
        let getFavListOfUser = async () => {
            await client.connect()
            userSelected = await usersCollection.findOne({ name: username })
            console.log("[+] Log => " + userSelected.name);
            //for...of => waits for each iteration
            for (const id of userSelected.favs) {
                let recipeFounded = await recipesCollection.findOne({ _id: id })
                favList.push(recipeFounded)
            }
            client.close()
        }
        //getFavListOfUser()

        async function getFavListOfUserPromise() {
            await client.connect()
            userSelected = await usersCollection.findOne({ name: username })
            console.log("[+] Log => " + userSelected.name);
            //for...of => waits for each iteration
            for (const id of userSelected.favs) {
                let recipeFounded = await recipesCollection.findOne({ _id: id })
                favList.push(recipeFounded)
            }
            client.close()
        }
        getFavListOfUserPromise()
            .then(() => {
                /**
         * Creates the Listeners for seeing all the details of the recipe
         */
                let createListenersViewRecipe = (listRecipes) => {
                    listRecipes.forEach((element, index) => {
                        document.getElementById("btnView" + index).addEventListener('click', (e) => {
                            e.preventDefault()
                            console.log(element.name);
                            window.location = "consult_recipe.html?id=" + element._id + "&username=" + username
                        })
                    });
                    console.log("[+] Listeners Created");
                }

                /**
                 * Prints all the recipes stored in the DB in a striped list view
                 */
                let showRecipes = (recipesShow) => {
                    let listRecipes = ""
                    listRecipes = `
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th scope="col">Img</th>
                        <th scope="col">Title</th>
                        <th scope="col">Prep Time</th>
                        <th scope="col">Author</th>
                        <th scope="col">Category</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>`

                    recipesShow.forEach((element, index) => {
                        listRecipes += `
                <tr>
                    <th scope="row"><img class="lists-photos" src="img/DefaultRecipePicture.png" alt="Recipe${index}"></th>
                    <td>${element.name}</td>
                    <td>${element.prepTime}</td>
                    <td>${element.author}</td>`

                        let category
                        switch (element.category) {
                            case 1:
                                category = `
                        <td>
                            <span class="icon icon-record center good"></span>
                        </td>`
                                break;
                            case 2:
                                category = `
                        <td>
                            <span class="icon icon-record center normal"></span>
                        </td>`
                                break;
                            case 3:
                                category = `
                        <td>
                            <span class="icon icon-record bad"></span>
                        </td>`
                                break;
                        }
                        listRecipes += category

                        listRecipes += `
                    <td>
                        <button type="button" class="btn btn-success" id="btnView${index}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"></path>
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"></path>
                            </svg>
                        </button>
                    </td>
                </tr>`
                    })

                    listRecipes += `
                </tbody>
            </table>
            `
                    document.getElementById("gallery").innerHTML = listRecipes

                    createListenersViewRecipe(recipesShow)
                }
                showRecipes(favList)

                /**
                * SearchBox to search specific recipes
                */
                document.getElementById("searchBox").addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        let listRecipesFound = []
                        favList.forEach(recipe => {
                            if (recipe.name.toLowerCase().includes(document.getElementById("searchBox").value.toLowerCase())) {
                                listRecipesFound.push(recipe)
                            }
                        });
                        showRecipes(listRecipesFound)
                    }
                })
            })


    })