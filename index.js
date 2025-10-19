import express from 'express';
import sqlite3 from 'sqlite3';

import { execute } from './sql.js';
import { createCategory } from './controllers/categoryController.js';
import { createSubcategory, getSubcategory, getAllSubcategory, getSubcategoryUnderCategory, patchSubcategory } from './controllers/subcategoryController.js';
import { createItemUnderCategory, searchItem, patchItem, createItemUnderSubcategory, getAllItem, getAllItemsUnderSubcategory, getAllItemsUnderCategory, getItem } from './controllers/itemController.js';
import { getAllCategory, getCategory, patchCategory } from './controllers/categoryController.js';

const db = new sqlite3.Database('sq.db');
try {
    await execute(db, `CREATE TABLE IF NOT EXISTS category (cid INTEGER PRIMARY KEY, category_name TEXT, image VARCHAR(2083), description TEXT, is_tax_applicable BOOLEAN NOT NULL CHECK (is_tax_applicable IN (0,1)), tax INTEGER NULL, tax_type TEXT NULL);`);
    await execute(db, `CREATE TABLE IF NOT EXISTS sub_category (sid INTEGER PRIMARY KEY, cid INTEGER NOT NULL , sub_category_name TEXT, image VARCHAR(2083), description TEXT,is_tax_applicable BOOLEAN NULL CHECK (is_tax_applicable IN (0,1)), tax INTEGER NULL, FOREIGN KEY(cid) REFERENCES category(cid));`);
    await execute(db, `CREATE TABLE IF NOT EXISTS item (tid INTEGER PRIMARY KEY, sid INTEGER, cid INTEGER NOT NULL, item_name TEXT, image VARCHAR(2083), description TEXT, is_tax_applicable BOOLEAN NOT NULL CHECK (is_tax_applicable IN (0,1)), tax INTEGER NULL, base_amount INTEGER NOT NULL, discount INTEGER NOT NULL, total_amount AS (base_amount - discount), FOREIGN KEY(sid) REFERENCES sub_category(sid), FOREIGN KEY(cid) REFERENCES category(cid));`);
    await execute(db, `CREATE TRIGGER IF NOT EXISTS default_value_for_sub_category 
        AFTER INSERT ON sub_category
        FOR EACH ROW WHEN NEW.is_tax_applicable IS NULL OR NEW.tax IS NULL
        BEGIN 
            UPDATE sub_category
            SET     
                is_tax_applicable = COALESCE(NEW.is_tax_applicable, (SELECT is_tax_applicable FROM category WHERE cid = NEW.cid)),
                tax = COALESCE(NEW.tax, (SELECT tax FROM category WHERE cid = NEW.cid))
            WHERE sid = NEW.sid;
        END;`);
    await execute(db, `CREATE TRIGGER nullify_category_tax_on_false 
        AFTER UPDATE ON category
        FOR EACH ROW
        WHEN NEW.is_tax_applicable = 0
        BEGIN
            UPDATE category 
            SET tax = NULL, tax_type = NULL 
            WHERE cid = NEW.cid;
        END;`);
    await execute(db, `CREATE TRIGGER nullify_sub_category_tax_on_false 
        AFTER UPDATE ON sub_category
        FOR EACH ROW
        WHEN NEW.is_tax_applicable = 0
        BEGIN
            UPDATE sub_category 
            SET tax = NULL
            WHERE sid = NEW.sid;
        END;`);
    await execute(db, `CREATE TRIGGER nullify_item_tax_on_false 
        AFTER UPDATE ON item
        FOR EACH ROW
        WHEN NEW.is_tax_applicable = 0
        BEGIN
            UPDATE item 
            SET tax = NULL
            WHERE tid = NEW.tid;
        END;`);
} catch (error) {
    console.log(error);
}




const app = express();

app.use(express.json());

app.post("/category", async (req, res) => { createCategory(req, res, db) })

app.post("/category/:name/sub-category", async (req, res) => { createSubcategory(req, res, db) })

app.post("/category/:name/item", async (req, res) => { createItemUnderCategory(req, res, db) })

app.post("/sub-category/:name/item", async (req, res) => { createItemUnderSubcategory(req, res, db) })

app.get("/categories", async (req, res) => { getAllCategory(req, res, db) })
app.get("/category", async (req, res) => { getCategory(req, res, db) })

app.get("/subcategories", async (req, res) => { getAllSubcategory(req, res, db) })
app.get("/subcategory", async (req, res) => { getSubcategory(req, res, db) })
app.get("/category/:identifier/subcategories", async (req, res) => { getSubcategoryUnderCategory(req, res, db) })

app.get("/items", async (req, res) => { getAllItem(req, res, db) })
app.get("/category/:identifier/items", async (req, res) => { getAllItemsUnderCategory(req, res, db) })
app.get("/subcategory/:identifier/items", async (req, res) => { getAllItemsUnderSubcategory(req, res, db) })
app.get("/item", async (req, res) => { getItem(req, res, db) })

app.patch("/category", async (req, res) => { patchCategory(req, res, db) })
app.patch("/subcategory", async (req, res) => { patchSubcategory(req, res, db) })
app.patch("/item", async (req, res) => { patchItem(req, res, db) })

app.get("/items/search",async (req,res)=>{searchItem(req,res,db)})

app.listen(8888, () => {
    console.log("Server listening on http://localhost:8888");
})