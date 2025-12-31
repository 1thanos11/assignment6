const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

app.use(express.json());

const db = mysql.createConnection({
  host: "127.0.0.1",
  port: "3306",
  database: "store",
  user: "root",
  password: "",
});

db.connect((error) => {
  if (error) {
    console.log(`DataBase Connection Failed 🤦‍♂️`);
  } else {
    console.log(`DataBase Connected Successfully 👏`);
  }
});

// create table suppliers :

app.post("/create/suppliers", (req, res, next) => {
  const sqlCreateTable = `CREATE TABLE Suppliers (
supplierID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    supplierName VARCHAR(255) NOT NULL,
    contactNumber VARCHAR(100) NOT NULL
);`;

  db.execute(sqlCreateTable, (error, result, fields) => {
    if (error) {
      if (error?.errno == 1050) {
        return res.status(409).json({ message: "Table already exists" });
      }
      return res.status(500).json({ message: "Query Syntax Error", error });
    }
    if (result.length <= 0) {
      return res
        .status(500)
        .json({ message: "Can't Create This Table Right Now", result });
    }

    res.status(200).json({ message: "Done", result });
  });
});

// create table products :

app.post("/create/products", (req, res, next) => {
  const sqlCreateTable = `CREATE TABLE Products (
    productID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    productName VARCHAR(255) NOT NULL,
    productPrice DECIMAL(10,2) NOT NULL,
    productStockQuantity INT NOT NULL DEFAULT 0,
    supplierID INT NOT NULL,
    
    CONSTRAINT fk_products_supplier
    FOREIGN KEY (supplierID)
    REFERENCES Suppliers(supplierID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);`;

  db.execute(sqlCreateTable, (error, result, fields) => {
    if (error) {
      if (error?.errno == 1050) {
        return res.status(409).json({ message: "Table already exists" });
      }
      return res.status(500).json({ message: "Query Syntax Error", error });
    }
    if (result.length <= 0) {
      return res
        .status(500)
        .json({ message: "Can't Create This Table Right Now", result });
    }

    res.status(200).json({ message: "Done", result });
  });
});

app.post("/create/sales", (req, res, next) => {
  const sqlCreateTable = `CREATE TABLE Sales (
    saleID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    quantitySold INT NOT NULL,
    saleDate DATE NOT NULL DEFAULT CURRENT_DATE,  -- use CURRENT_DATE for DATE
    productID INT NOT NULL,

    CONSTRAINT fk_sales_product
    FOREIGN KEY (productID)
    REFERENCES Products(productID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);`;

  db.execute(sqlCreateTable, (error, result, fields) => {
    if (error) {
      if (error?.errno == 1050) {
        return res.status(409).json({ message: "Table already exists" });
      }
      return res.status(500).json({ message: "Query Syntax Error", error });
    }
    if (result.length <= 0) {
      return res
        .status(500)
        .json({ message: "Can't Create This Table Right Now", result });
    }

    res.status(200).json({ message: "Done", result });
  });
});

// add category :

app.post("/add/category", (req, res, next) => {
  const sql = `ALTER TABLE Products ADD COLUMN category varchar(255)`;
  db.execute(sql, (error, result, fields) => {
    if (error) {
      return res.status(500).json({ message: "Query Syntax Error", error });
    }
    if (result.length <= 0) {
      return res
        .status(500)
        .json({ message: "Can't Create This Column Right Now", result });
    }

    res.status(201).json({ message: "Done", result });
  });
});

// Remove Caategory :

app.delete("/delete/category", (req, res, next) => {
  const sql = `ALTER TABLE Products DROP COLUMN category`;
  db.execute(sql, (error, result, fields) => {
    if (error) {
      return res.status(500).json({ message: "Query Syntax Error", error });
    }
    if (result.length <= 0) {
      return res
        .status(500)
        .json({ message: "Can't Delete This Column Right Now", result });
    }

    res.status(201).json({ message: "Done", result });
  });
});

// change ContactNumber :

app.patch("/change/contactNumber", (req, res, next) => {
  const sql = `ALTER TABLE Suppliers CHANGE COLUMN contactNumber contactNumber varchar(15) NOT NULL`;
  db.execute(sql, (error, result, fields) => {
    if (error) {
      return res.status(500).json({ message: "Query Syntax Error", error });
    }
    if (result.length <= 0) {
      return res
        .status(500)
        .json({ message: "Can't Change This Column Right Now", result });
    }

    res.status(201).json({ message: "Done", result });
  });
});

// ADD NOT NULL To productName :

app.patch("/change/productName", (req, res, next) => {
  const sql = `ALTER TABLE Products CHANGE COLUMN productName productName varchar(255) NOT NULL`;
  db.execute(sql, (error, result, fields) => {
    if (error) {
      return res.status(500).json({ message: "Query Syntax Error", error });
    }
    if (result.length <= 0) {
      return res
        .status(500)
        .json({ message: "Can't Change This Column Right Now", result });
    }

    res.status(201).json({ message: "Done", result });
  });
});

// INSERT supplier FreshFoods :

app.post("/insert/FreshFoods", (req, res, next) => {
  const { supplierName, contactNumber } = req.body;
  const sql = `INSERT INTO Suppliers (supplierName,contactNumber) VALUES (?,?)`;
  db.execute(sql, [supplierName, contactNumber], (error, result, fields) => {
    if (error) {
      return res.status(500).json({ message: "Query Syntax Error", error });
    }

    return result.affectedRows
      ? res.status(201).json({ message: "Done", result })
      : res.status(500).json({ message: "Failed To INSERT Supplier" });
  });
});

// INSERT INTO Products :

app.post("/insert/products/:supplierID", (req, res, next) => {
  const { supplierID } = req.params;
  const { productName, productPrice, productStockQuantity } = req.body;
  const sql = `INSERT INTO Products (supplierID,productName,productPrice,productStockQuantity) VALUES (?,?,?,?)`;
  db.execute(
    sql,
    [supplierID, productName, productPrice, productStockQuantity],
    (error, result, fields) => {
      if (error) {
        if (error.errno == 1452) {
          return res.status(500).json({ message: "Invalid Supplier ID" });
        }
        return res.status(500).json({ message: "Query Syntax Error", error });
      }
      return result.affectedRows
        ? res.status(201).json({ message: "Done", result })
        : res.status(500).json({
            message: "Can't INSERT This Product Please Try Again Later",
          });
    },
  );
});

// ADD Record To Sale :

app.post("/insert/:productID/sale", (req, res) => {
  const { productID } = req.params; // use params since you have :productID
  const { quantitySold, saleDate } = req.body;

  const insertSql = `INSERT INTO Sales (productID, quantitySold, saleDate) VALUES (?, ?, ?)`;
  db.execute(
    insertSql,
    [productID, quantitySold, saleDate],
    (error, result) => {
      if (error) {
        return res.status(500).json({ message: "Query Syntax Error", error });
      }

      const updateSql = `UPDATE Products SET productStockQuantity = GREATEST(productStockQuantity - ?, 0) WHERE productID = ?`;
      db.execute(updateSql, [quantitySold, productID], (error, result) => {
        if (error) {
          if (error.errno === 1452) {
            return res.status(404).json({ message: "Product Doesn't Exist" });
          }
          return res.status(500).json({ message: "Query Syntax Error", error });
        }

        return result.affectedRows
          ? res
              .status(201)
              .json({ message: "Sale recorded and stock updated", result })
          : res.status(500).json({ message: "Failed to update stock" });
      });
    },
  );
});

// UPDATE Price :

app.patch("/update/price/:productID", (req, res, next) => {
  const { productID } = req.params;
  const { productPrice } = req.body;

  const sql = `UPDATE Products SET productPrice=? WHERE productID=?`;
  db.execute(sql, [productPrice, productID], (error, result, fields) => {
    if (error) {
      return res.status(500).json({ message: "Query Syntax Error", error });
    }

    return result.affectedRows
      ? res.status(201).json({ message: "Done", result })
      : res.status(500).json({ message: "Product Doesn't Exist" });
  });
});

app.listen(PORT, () => {
  console.log(`Server Is Running On PORT ${PORT} 🚀`);
});
