# Guestara-Menu-Management-API

This assignment project can be run locally by,

1. First, clone the github project
2. Run npm install in the directory you have cloned the project
3. Then run this command
   `node index.js`
   to activate the server. The server will be listening on http://localhost:8888
4. You can use postman to try out all the API endpoints

# API Endpoints
## Category Management
POST `/category`

Create a new category.
Body: { name, description, taxType, ... }
Response: Returns 200 and a message created category successfully.

GET `/categories`

Retrieve all categories.
Response: Array of all category objects.

GET `/category`

Fetch a specific category by query (e.g., ?id= or ?name=).
Response: Category details of the specified id or name.

PATCH `/category`

Update details of an existing category.
Params: :identifier → category ID
Body: { name, fieldsToUpdate... }
Response: Returns the message updated category succesfully.

## Subcategory Management
POST `/category/:name/sub-category`

Create a new subcategory under a specific category.
Params: :name → category name
Body: { name, description, ... }
Response: Returns the message created subcategory successfully.

GET `/subcategories`

Retrieve all subcategories.
Response: Array of subcategory objects.

GET `/subcategory`

Fetch details of a specific subcategory by query (e.g., ?id= or ?name=).
Response: Subcategory details.

GET `/category/:identifier/subcategories`

List all subcategories under a given category.
Params: :identifier → category ID or name
Response: Array of subcategories.

PATCH `/subcategory`

Update an existing subcategory.
Params: :identifier → subcategory ID
Body: { name, fieldsToUpdate... }
Response: Updated subcategory details.

Item Management
POST `/category/:name/item`

Create a new item directly under a category.
Params: :name → category name
Body: { name, price, description, taxType, ... }
Response: Return message, created item.

POST `/sub-category/:name/item`

Create a new item under a specific subcategory.
Params: :name → subcategory name
Body: { name, price, description, taxType, ... }
Response: Return message, created item under specific subcategory.

GET `/items`

Retrieve all items.
Response: Array of all items.

GET `/item`

Fetch a specific item by query (e.g., ?id= or ?name=).
Response: Item details.

GET `/category/:identifier/items`

Get all items belonging to a specific category.
Params: :identifier → category ID or name
Response: Array of items.

GET `/subcategory/:identifier/items`

Get all items belonging to a specific subcategory.
Params: :identifier → subcategory ID or name
Response: Array of items.

PATCH `/item`

Update details of an existing item.
Params: :identifier → item ID
Body: { name, fieldsToUpdate... }
Response: Updated item details.

## Search
GET `/items/search`

Search for items based on query parameters (e.g., ?q=pizza).
Response: Array of matching items.

