const fs = require("fs");
const path = require("path");

module.exports = class RouterService {
  constructor(response, result, queryParams) {
    this.response = response;
    this.result = result;
    this.queryParams = queryParams;
  }

  getItems() {
    const dbBuffer = fs.readFileSync("./db.json");

    this.response.end(dbBuffer);
  }

  async uploadItem() {
    const { picture: rawBase64Pic, name } = this.result
    const clearBase64 = rawBase64Pic.replace(/^data:image\/png;base64,/, "")
    const base64Buff = Buffer.from(clearBase64, 'base64')
    const imagePath = path.resolve(__dirname, '../uploads', name)
    fs.writeFile(imagePath, base64Buff, 'base64', (err) => {
      if (err) {
        console.error(err);
        this.response.end(JSON.stringify({ err }));
      } else {
        this.response.end(JSON.stringify({ name }));
      }
    })
  }

  deleteItem() {
    const dbBuffer = fs.readFileSync("./db.json");
    const db = JSON.parse(dbBuffer);
    const name = db.data.filter((item) => item.id === this.queryParams.id)[0]
      .name;
    const data = db.data.filter((item) => item.id !== this.queryParams.id);

    db.data = data;
    fs.writeFileSync("./db.json", JSON.stringify(db));
    this.response.end(JSON.stringify({ name: name }));
  }

  updateItem() {
    const dbBuffer = fs.readFileSync("./db.json");
    const db = JSON.parse(dbBuffer);
    const name = db.data.filter((item) => item.id === this.queryParams.id)[0]
      .name;

    db.data.forEach((item) => {
      if (item.id === this.queryParams.id) {
        item.name = this.result.title;
      }
    });

    fs.writeFileSync("./db.json", JSON.stringify(db));
    this.response.end(JSON.stringify({ name: name }));
  }

  notFound() {
    this.response.end("<h1>404<h1/>");
  }
};
