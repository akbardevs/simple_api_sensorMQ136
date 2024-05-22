const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const DATA_FILE = "./sensor_data.json";

app.use(bodyParser.json());

// API to store sensor data
app.post("/save", (req, res) => {
  let data = req.body; // assuming { value: xxx }
  console.log("Received data:", data);

  // Ensure the data object has 'value' property
  if (data && data.value !== undefined) {
    // Add a timestamp to the data
    data.timestamp = new Date().toISOString(); // ISO 8601 format
    console.log("Updated data with timestamp:", data);

    // Read existing data and append new entry
    fs.readFile(DATA_FILE, (err, fileData) => {
      let jsonData = [];
      if (!err && fileData.length > 0) {
        try {
          jsonData = JSON.parse(fileData.toString());
        } catch (parseErr) {
          console.error("Error parsing JSON from file:", parseErr);
          res.status(500).send("Error parsing data file");
          return;
        }
      }

      jsonData.push(data);

      // Write data back to the file
      fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), (writeErr) => {
        if (writeErr) {
          console.error("Error writing to file:", writeErr);
          res.status(500).send("Error writing to file");
          return;
        }
        res.send("Data saved successfully with timestamp");
      });
    });
  } else {
    console.log("Invalid data received", data);
    res.status(400).send("Invalid data: 'value' is required");
  }
});

// API to get sensor data
app.get("/data", (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    if (err) {
      res.status(500).send("Error reading data file");
      return;
    }
    res.json(JSON.parse(data.toString() || "[]"));
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
