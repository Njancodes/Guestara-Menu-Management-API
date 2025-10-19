import { execute, fetchAll, fetchFirst } from '../sql.js';

export const getAllItem = async (req, res, db) => {
    try {
        let items = await fetchAll(db, 'SELECT * FROM item', []);
        if (!items || items.length === 0) {
            return res.status(404).json({ error: "No items found" });
        }
        res.json(items)
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Database error" });
    }
}

export const getAllItemsUnderCategory = async (req, res, db) => {
    const identifier = req.params.identifier;

    let sql, params;

    if (!isNaN(identifier)) {
        sql = `SELECT * FROM item WHERE cid = ?`;
        params = [parseInt(identifier)];
    } else {
        try {
            const categorySql = `SELECT cid FROM category WHERE category_name = ?`;
            const category = await fetchFirst(db, categorySql, identifier);

            if (!category) {
                return res.status(404).json({ error: "Category not found" });
            }

            sql = `SELECT * FROM item WHERE cid = ?`;
            params = [category.cid];
        } catch (err) {
            return res.status(500).json({ error: "Database error" });
        }
    }

    try {
        const items = await fetchAll(db, sql, params);

        if (!items || items.length === 0) {
            return res.status(404).json({ error: "No items found" });
        }

        res.json(items);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
}


export const getAllItemsUnderSubcategory = async (req, res, db) => {
    const identifier = req.params.identifier;

    let sql, params;

    if (!isNaN(identifier)) {
        sql = `SELECT * FROM item WHERE sid = ?`;
        params = [parseInt(identifier)];
    } else {
        try {
            const subcategorySql = `SELECT sid FROM sub_category WHERE sub_category_name = ?`;
            const subcategory = await fetchFirst(db, subcategorySql, identifier);

            if (!subcategory) {
                return res.status(404).json({ error: "Sub category not found" });
            }

            sql = `SELECT * FROM item WHERE sid = ?`;
            params = [subcategory.sid];
        } catch (err) {
            return res.status(500).json({ error: "Database error" });
        }
    }

    try {
        const items = await fetchAll(db, sql, params);

        if (!items || items.length === 0) {
            return res.status(404).json({ error: "No items found" });
        }

        res.json(items);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
}

export const getItem = async (req, res, db) => {
    const { id, name } = req.query;

    let sql, params;

    if (id) {
        sql = `SELECT * FROM item WHERE tid = ?`;
        params = [id];
    } else if (name) {
        sql = `SELECT * FROM item WHERE item_name = ?`;
        params = [name];
    } else {
        return res.status(400).json({ error: "Provide id or name" });
    }

    try {
        let item = await fetchFirst(db, sql, params);
        if (!item) {
            return res.status(404).json({ error: `Item with ${id ? `id: ${id}` : `name: ${name}`} not found.` })
        }
        res.json(item);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Database error" });
    }
}

export const createItemUnderCategory = async (req, res, db) => {
    console.log(req.body);
    console.log(req.params.name);

    let category_name = req.params.name;
    let category_obj;

    try {
        const sql = `SELECT cid FROM category WHERE category_name = ?`;
        //FETCH ERROR
        category_obj = await fetchFirst(db, sql, category_name);
        if (!category_obj) {
            return res.status(404).json({ error: "Category not found" });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Database Error" })
    }

    const item = req.body
    //DO VALIDATION AND ERROR CHECKING

    if (!item.name || !item.image || !item.description || !item.base_amount || item.discount === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }


    item.name = item.name.toLowerCase().replace(/\s+/g, '_');

    if (item.tax_applicability && (!item.tax)) {
        return res.status(400).json({ error: "Tax required when tax is applicable" });
    }

    const isApplicable = item.tax_applicability ? 1 : 0;
    const tax = item.tax_applicability ? item.tax : null;

    let sql = `INSERT INTO item(cid, item_name, image, description, base_amount, discount, tax, is_tax_applicable) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`
    let params = [category_obj.cid, item.name, item.image, item.description, item.base_amount, item.discount, tax, isApplicable];


    try {
        await execute(db, sql, params);
        res.status(201).json({ message: `Item created under category ${req.params.name}` });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to create item" });
    }

}

export const createItemUnderSubcategory = async (req, res, db) => {
    console.log(req.body);
    console.log(req.params.name);

    const sub_category_name = req.params.name;
    let sub_category_obj;

    try {
        const sql = `SELECT sid,cid FROM sub_category WHERE sub_category_name = ?`;
        //FETCH ERROR
        sub_category_obj = await fetchFirst(db, sql, sub_category_name);
        if (!sub_category_obj) {
            return res.status(404).json({ error: "Sub-category not found" });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Database Error" })
    }

    const item = req.body

    // Check required fields
    if (!item.name || !item.image || !item.description || !item.base_amount || item.discount === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    item.name = item.name.toLowerCase().replace(/\s+/g, '_');

    // If tax is applicable, check tax fields
    if (item.tax_applicability && (!item.tax)) {
        return res.status(400).json({ error: "Tax required when tax is applicable" });
    }

    const isApplicable = item.tax_applicability ? 1 : 0;
    const tax = item.tax_applicability ? item.tax : null;

    let sql = `INSERT INTO item(sid, cid, item_name, image, description, base_amount, discount, tax, is_tax_applicable) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
    let params = [sub_category_obj.sid, sub_category_obj.cid, item.name, item.image, item.description, item.base_amount, item.discount, tax, isApplicable];

    try {
        await execute(db, sql, params);
        res.status(201).json({ message: `Item created under sub-category ${req.params.name}` });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to create item" });
    }
}

export const patchItem = async (req, res, db) => {
    const id = req.query.id
    const updateBody = req.body

    let sql, params;

    if (id) {
        sql = `SELECT * FROM item WHERE tid = ?`;
        params = [id];
    } else {
        return res.status(400).json({ error: "Provide id" });
    }

    let item;
    try {
        item = await fetchFirst(db, sql, params);
        if (!item) {
            return res.status(404).json({ error: `Item with id: ${id} not found.` })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Database error" });
    }

    let updateFields = [];

    const fieldMapping = {
        name: "item_name",
        image: "image",
        description: "description",
        tax_applicability: "is_tax_applicable",
        tax: "tax",
        base_amount: "base_amount",
        discount: "discount",
    };

    if (item.is_tax_applicable === 0) {
        if (updateBody.tax && updateBody.tax_applicability === undefined) {
            return res.status(400).json({ error: "Set tax_applicabilty to true to update the tax" })
        }
    }
    if (!updateBody.tax_applicability && updateBody.tax_applicability !== undefined) {
        if (updateBody.tax) {
            return res.status(400).json({ error: "Set tax_applicabilty to true to give a value to tax" })
        }
    }
    if (updateBody.tax_applicability && !updateBody.tax) {
        return res.status(400).json({ error: "Give appropriate values to update tax" })
    }

    for (const [bodyKey, dbColumn] of Object.entries(fieldMapping)) {
        if (updateBody[bodyKey] !== undefined) {

            updateFields.push(`${dbColumn} = ?`);

            // Convert boolean to 1/0 for tax_applicability
            if (bodyKey === 'tax_applicability') {
                params.push(updateBody[bodyKey] ? 1 : 0);
            } else if (bodyKey === 'name') {
                // Normalize name
                params.push(updateBody[bodyKey].toLowerCase().replace(/\s+/g, '_'));
            } else {
                params.push(updateBody[bodyKey]);
            }
        }
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
    }

    try {
        const sql = `UPDATE item SET ${updateFields.join(', ')} WHERE tid = ?`;

        params.shift()
        params = [...params, id]
        await execute(db, sql, params);
        res.status(200).json({ message: "Item updated successfully" });

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Database Error" })
    }
}

export const searchItem = async (req, res, db) => {
    let search_term = req.query.name;
    console.log(search_term)
    if (!search_term) {
        return res.status(400).json({ error: "Give a search term" });
    }

    search_term = search_term.toLowerCase().replace(/\s+/g, '_');

    let sql, params;

    sql = 'SELECT * FROM item WHERE item_name LIKE ?';
    params = [`%${search_term}%`];

    try {
        const items = await fetchAll(db, sql, params);
        if (!items || items.length === 0) {
            return res.status(404).json({ error: "No items found matching search" });
        }

        res.json(items);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Database error" });
    }
}