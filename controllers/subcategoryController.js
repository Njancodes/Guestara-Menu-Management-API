import { execute, fetchAll, fetchFirst } from '../sql.js';

export const createSubcategory = async (req, res, db) => {
    console.log(req.body);
    console.log(req.params.name);

    let category_name = req.params.name;
    let category_obj;


    category_name = category_name.toLowerCase().replace(/\s+/g, '_');

    try {
        const sql = `SELECT cid FROM category WHERE category_name = ?`;
        //FETCH ERROR
        category_obj = await fetchFirst(db, sql, category_name);
        if (!category_obj) {
            return res.status(404).json({ error: "Category not found" });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Database error" });
    }

    const sub_category = req.body

    if (!sub_category.name || !sub_category.image || !sub_category.description) {
        return res.status(400).json({ error: "Missing required fields" });
    }


    sub_category.name = sub_category.name.toLowerCase().replace(/\s+/g, '_');

    if (sub_category.tax_applicability && (!sub_category.tax)) {
        return res.status(400).json({ error: "Tax required when tax is applicable" });
    }


    const isApplicable = sub_category.tax_applicability ? 1 : 0;
    const tax = sub_category.tax_applicability ? sub_category.tax : null;

    let sql = `INSERT INTO sub_category(cid, sub_category_name, image, description, tax, is_tax_applicable) 
       VALUES (?, ?, ?, ?, ?, ?);`
    let params = [category_obj.cid, sub_category.name, sub_category.image, sub_category.description, tax, isApplicable];

    try {
        await execute(db, sql, params)
        res.status(201).json({ message: "Sub-category created successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to create sub-category" });
    }

}

export const getAllSubcategory = async (req, res, db) => {
    try {
        let sub_categories = await fetchAll(db, 'SELECT * FROM sub_category', []);
        if (!sub_categories || sub_categories.length === 0) {
            return res.status(404).json({ error: "No sub categories found" });
        }
        res.json(sub_categories)
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Database error" });
    }
}

export const getSubcategoryUnderCategory = async (req, res, db) => {
    const identifier = req.params.identifier;
    console.log(identifier)
    let sql, params;

    if (!isNaN(identifier)) {
        sql = `SELECT * FROM sub_category WHERE cid = ?`;
        params = [parseInt(identifier)];
    } else {
        try {
            const categorySql = `SELECT cid FROM category WHERE category_name = ?`;
            const category = await fetchFirst(db, categorySql, identifier);

            if (!category) {
                return res.status(404).json({ error: "Category not found" });
            }

            sql = `SELECT * FROM sub_category WHERE cid = ?`;
            params = [category.cid];
        } catch (err) {
            return res.status(500).json({ error: "Database error" });
        }
    }

    try {
        const subcategories = await fetchAll(db, sql, params);

        if (!subcategories || subcategories.length === 0) {
            return res.status(404).json({ error: "No subcategories found" });
        }

        res.json(subcategories);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
}

export const getSubcategory = async (req, res, db) => {
    const { id, name } = req.query;

    let sql, params;

    if (id) {
        sql = `SELECT * FROM sub_category WHERE sid = ?`;
        params = [id];
    } else if (name) {
        sql = `SELECT * FROM sub_category WHERE sub_category_name = ?`;
        params = [name];
    } else {
        return res.status(400).json({ error: "Provide id or name" });
    }

    try {
        let sub_category = await fetchFirst(db, sql, params);
        if (!sub_category) {
            return res.status(404).json({ error: `Sub category with ${id ? `id: ${id}` : `name: ${name}`} not found.` })
        }
        res.json(sub_category);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Database error" });
    }
}



export const patchSubcategory = async (req, res, db) => {
    const id = req.query.id
    const updateBody = req.body

    let sql, params;

    if (id) {
        sql = `SELECT * FROM sub_category WHERE sid = ?`;
        params = [id];
    } else {
        return res.status(400).json({ error: "Provide id" });
    }

    let sub_category;
    try {
        sub_category = await fetchFirst(db, sql, params);
        if (!sub_category) {
            return res.status(404).json({ error: `Sub Category with id: ${id} not found.` })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Database error" });
    }

    let updateFields = [];

    const fieldMapping = {
        name: 'sub_category_name',
        image: 'image',
        description: 'description',
        tax: 'tax',
        tax_applicability: 'is_tax_applicable'
    };

    if (sub_category.is_tax_applicable === 0) {
        if (updateBody.tax  && updateBody.tax_applicability === undefined) {
            return res.status(400).json({ error: "Set tax_applicabilty to true to update the tax" })
        }
    }
    if (!updateBody.tax_applicability && updateBody.tax_applicability !== undefined) {
        if (updateBody.tax ) {
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
        const sql = `UPDATE sub_category SET ${updateFields.join(', ')} WHERE sid = ?`;

        params.shift()
        params = [...params, id]
        await execute(db, sql, params);
        res.status(200).json({ message: "Sub category updated successfully" });

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Database Error" })
    }
}