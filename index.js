const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const app = express();
const port = 3001;

const connection = mysql.createConnection({
	host: "server2.bsthun.com",
	port: "6105",
	user: "lab_ggrmj",
	password: "f91um4hPDJixJXIE",
	database: "lab_todo02_g5kqoa",
});

connection.connect(() => {
	console.log("Database is connected");
});

app.use(bodyParser.json({ type: "application/json" }));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    var sql = mysql.format (
        "SELECT * FROM users WHERE username = ?",
        [username]
    );
    console.log("DEBUG: /login => " + sql);
    connection.query(sql, async(err, rows) => {
        if (err){
            return res.json({
                success: false,
                data: null,
                error: err.message,
            });
        }
        numRows = rows.length;
        if(numRows == 0){
            res.json({
                success: false,
                message: "User not found",
            });
        }else {
            const match = await bcrypt.compare(
                password, rows[0].hashed_password);
            if ( match ){
                res.json({
                    success: true,
                    message: "User authentication is a success",
                    user: rows[0],
                })
            }else{
                res.json({
                    success: false,
                    message: "Incorrect password"
                })
            }
            
        }
    })
});
app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    //password validation
    if(password.length < 8 || 
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/\d/.test(password)
        ) {
            return res.json({
                success: false,
                message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit.'
            });
        }else {
            //generate salt and hash pw
            bcrypt.genSalt(10, (err, salt) => {
                if(err) {
                    return res.json({
                        success: false,
                        data: null,
                        error: err.message,
                    });
                }
                bcrypt.hash(password, salt, (err, hashedpassword) => {
                    if(err) {
                        return res.json({
                            success: false,
                            data: null,
                            error: err.message,
                        });
                    }
                    //inset new user record into db
                    var sql = mysql.format(
                                "INSERT INTO users (username, password, hashed_password) VALUES (?, ?, ?)",
                                [username, password, hashedpassword]
                                );
                    connection.query(sql, (err, rows) => {
                        if(err) {
                            return res.json({
                                success: false,
                                data: null,
                                error: err.message,
                            });
                        } else {
                            if(rows) {
                                res.json({
                                    success: true,
                                    data: {
                                        message: "Registration success"
                                    }
                                })
                            }
                        }
                    })
                })
            })
        }

    
});