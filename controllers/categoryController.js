import { execute, fetchFirst, fetchAll } from '../sql.js';

export const createCategory = async (req, res, db) => {
    console.log(req.body)
    const category = req.body

    if (!category) {
        return res.status(400).json({ error: "Missing a body" });
    }

    if (!category.name || !category.image || !category.description) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    category.name = category.name.toLowerCase().replace(/\s+/g, '_');

    if (category.tax_applicability && (!category.tax || !category.tax_type)) {
        return res.status(400).json({ error: "Tax and tax_type required when tax is applicable" });
    }

    const isApplicable = category.tax_applicability ? 1 : 0;
    const tax = category.tax_applicability ? category.tax : null;
    const taxType = category.tax_applicability ? category.tax_type : null;

    let sql = `INSERT INTO category(category_name, image, description, tax, tax_type, is_tax_applicable) 
       VALUES (?, ?, ?, ?, ?, ?);`
    let params = [category.name, category.image, category.description, tax, taxType, isApplicable];

    try {
        await execute(db, sql, params);
        res.status(201).json({ message: "Category created successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to create category" });
    }
}

export const getAllCategory = async (req, res, db) => {
    try {
        let categories = await fetchAll(db, 'SELECT * FROM category', []);
        if (!categories || categories.length === 0) {
            return res.status(404).json({ error: "No categories found" });
        }
        res.json(categories)
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Database error" });
    }
}

export const getCategory = async (req, res, db) => {
    const { id, name } = req.query;

    let sql, params;

    if (id) {
        sql = `SELECT * FROM category WHERE cid = ?`;
        params = [id];
    } else if (name) {
        sql = `SELECT * FROM category WHERE category_name = ?`;
        params = [name];
    } else {
        return res.status(400).json({ error: "Provide id or name" });
    }

    try {
        let category = await fetchFirst(db, sql, params);
        if (!category) {
            return res.status(404).json({ error: `Category with ${id ? `id: ${id}` : `name: ${name}`} not found.` })
        }
        res.json(category);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Database error" });
    }
}


export const patchCategory = async (req, res, db) => {
    const id = req.query.id
    const updateBody = req.body

    let sql, params;

    if (id) {
        sql = `SELECT * FROM category WHERE cid = ?`;
        params = [id];
    } else {
        return res.status(400).json({ error: "Provide id" });
    }

    let category;
    try {
        category = await fetchFirst(db, sql, params);
        if (!category) {
            return res.status(404).json({ error: `Category with id: ${id} not found.` })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Database error" });
    }

    let updateFields = [];

    const fieldMapping = {
        name: 'category_name',
        image: 'image',
        description: 'description',
        tax: 'tax',
        tax_type: 'tax_type',
        tax_applicability: 'is_tax_applicable'
    };

    if (category.is_tax_applicable === 0) {
        if (updateBody.tax && updateBody.tax_type && updateBody.tax_applicability === undefined) {
            return res.status(400).json({ error: "Set tax_applicabilty to true to update the tax and tax type" })
        }
    }
    if (!updateBody.tax_applicability && updateBody.tax_applicability !== undefined) {
        if (updateBody.tax && updateBody.tax_type) {
            return res.status(400).json({ error: "Set tax_applicabilty to true to give a value to tax and tax type" })
        }
    }
    if (updateBody.tax_applicability && !updateBody.tax && !updateBody.tax_type) {
        return res.status(400).json({ error: "Give appropriate values to update tax and tax type" })
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
        const sql = `UPDATE category SET ${updateFields.join(', ')} WHERE cid = ?`;


        params.shift()

        params = [...params, id]
        console.log(params)
        await execute(db, sql, params);

        res.status(200).json({ message: "Category updated successfully" });

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Database Error" })
    }
}