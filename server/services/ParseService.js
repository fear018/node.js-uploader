const fs = require("fs");
const { URL } = require("url");
const { v4: uuidv4 } = require("uuid");

module.exports = class ParseService {
  constructor(server, request) {
    this.server = server;
    this.request = request;
  }

  parseQueryParams() {
    const { address, port } = this.server.address();
    const parseUrl = new URL(this.request.url, `http://${address}:${port}`);
    const queryParams = {};

    for (const [key, value] of parseUrl.searchParams.entries()) {
      queryParams[key] = value;
    }

    return { queryParams, pathname: parseUrl.pathname };
  }

  parseJsonBody() {
    const { pathname } = this.parseQueryParams();

    return new Promise((resolve, reject) => {
      let rawJson = "";
      this.request
        .on("data", (chunk) => {
          rawJson += chunk;
        })
        .on("end", () => {
          try {
            if (rawJson) {
              const dbBuffer = fs.readFileSync("./db.json");
              const db = JSON.parse(dbBuffer);

              if (pathname !== "/updateItem") {
                db.data.push({ id: uuidv4(), ...JSON.parse(rawJson) });
                fs.writeFileSync("./db.json", JSON.stringify(db));
              }

              const requestBody = JSON.parse(rawJson);

              resolve(requestBody);
            } else {
              resolve(null);
            }
          } catch (err) {
            reject(err);
          }
        })
        .on("error", reject);
    });
  }
};
