# Menu Management API

This project is a **menu management API** designed to handle categories, subcategories, and items for a restaurant or hotel system. It was built as an assignment project and demonstrates efficient API structuring, logical design, and database handling.

---

## Getting Started

You can run this project locally by following these steps:

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the server**

   ```bash
   node index.js
   ```

   The server will start on:
   `http://localhost:8888`

4. **Test the endpoints**
   Use **Postman** or any REST client to try out the API endpoints.

---

## Questions and Answers

### 1. Which database have you chosen and why?

I chose **SQLite3** as the database because it allows fast integration, lightweight setup, and local testing without requiring a separate client-server DBMS. It is ideal for small to medium-scale applications and quick prototypes.

### 2. Three things you learned from this assignment

* I learned to manage time more efficiently by prioritizing and planning tasks.
* I understood how to reduce and define the project scope effectively.
* I learned how to structure code to make it cleaner, more modular, and easier to maintain.

### 3. What was the most difficult part of the assignment?

The most challenging part was implementing the tax applicability logic when updating a category. Initially, the logic was confusing, but after systematically breaking down the problem, I realized it wasn’t as complex as it seemed.

### 4. What would you have done differently with more time?

Given more time, I would have added a more advanced search functionality and a frontend interface to visualize and test all the API endpoints interactively.

---

## API Endpoints

### Category Management

#### POST `/category`

Create a new category.

Body: `{ name, description, taxType, ... }`

Response: Returns status 200 and a message "Created category successfully."

#### GET `/categories`

Retrieve all categories.

Response: Array of all category objects.

#### GET `/category`

Fetch a specific category by query (e.g., `?id=` or `?name=`).

Response: Category details for the specified ID or name.

#### PATCH `/category`

Update details of an existing category.

Params: `:identifier` → Category ID

Body: `{ name, fieldsToUpdate... }`

Response: Returns the message "Updated category successfully."

---

### Subcategory Management

#### POST `/category/:name/sub-category`

Create a new subcategory under a specific category.

Params: `:name` → Category name

Body: `{ name, description, ... }`

Response: Returns the message "Created subcategory successfully."

#### GET `/subcategories`

Retrieve all subcategories.

Response: Array of subcategory objects.

#### GET `/subcategory`

Fetch a specific subcategory by query (e.g., `?id=` or `?name=`).

Response: Subcategory details.

#### GET `/category/:identifier/subcategories`

List all subcategories under a given category.

Params: `:identifier` → Category ID or name

Response: Array of subcategories.

#### PATCH `/subcategory`

Update an existing subcategory.

Params: `:identifier` → Subcategory ID

Body: `{ name, fieldsToUpdate... }`

Response: Returns the message "Updated subcategory successfully."

---

### Item Management

#### POST `/category/:name/item`

Create a new item directly under a category.

Params: `:name` → Category name

Body: `{ name, price, description, taxType, ... }`

Response: Returns the message "Created item successfully."

#### POST `/sub-category/:name/item`

Create a new item under a specific subcategory.

Params: `:name` → Subcategory name

Body: `{ name, price, description, taxType, ... }`

Response: Returns the message "Created item under specific subcategory."

#### GET `/items`

Retrieve all items.

Response: Array of all item objects.

#### GET `/item`

Fetch a specific item by query (e.g., `?id=` or `?name=`).

Response: Item details.

#### GET `/category/:identifier/items`

Get all items belonging to a specific category.

Params: `:identifier` → Category ID or name

Response: Array of items.

#### GET `/subcategory/:identifier/items`

Get all items belonging to a specific subcategory.

Params: `:identifier` → Subcategory ID or name

Response: Array of items.

#### PATCH `/item`

Update an existing item.

Params: `:identifier` → Item ID

Body: `{ name, fieldsToUpdate... }`

Response: Returns the message "Updated item successfully."

---

### Search

#### GET `/items/search`

Search for items based on query parameters (e.g., `?q=pizza`).

Response: Array of matching items.
