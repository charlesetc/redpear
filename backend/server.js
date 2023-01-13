const express = require("express");
const app = express();

app.use(express.static("./site"));

let port = 9292;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
