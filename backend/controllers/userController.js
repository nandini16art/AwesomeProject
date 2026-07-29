const db = require("../db");

const getCurrentUser = (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            email,
            role,
            created_at
        FROM users
        WHERE id = ?
    `;

    db.query(sql, [req.user.id], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        if (result.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        return res.status(200).json({

            success: true,

            user: result[0]

        });

    });

};

module.exports = {
    getCurrentUser
};