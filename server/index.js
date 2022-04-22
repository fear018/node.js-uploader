const http = require("http");
const ParseService = require("./services/ParseService");
const RouterService = require("./services/RouterService");

const port = 3000;
const host = "127.0.0.1";
const allowedMethods = ["GET", "POST", "PUT", "DELETE"];

const server = http.createServer(async (request, response) => {
  const parseService = new ParseService(server, request);

  try {
    const { pathname, queryParams } = parseService.parseQueryParams();
    const result = await parseService.parseJsonBody();
    const routerService = new RouterService(response, result, queryParams);

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", true);
    response.setHeader("Content-Type", "application/json");

    if (!allowedMethods.includes(request.method)) {
      response.writeHead(400);
      response.setHeader("Allow", allowedMethods.join(","));
      response.end();
      return;
    }

    switch (pathname) {
      case "/upload":
        await routerService.uploadItem(request);
        break;
      case "/items":
        routerService.getItems();
        break;
      case "/deleteItem":
        routerService.deleteItem();
        break;
      case "/updateItem":
        routerService.updateItem();
        break;
      default:
        routerService.notFound();
        break;
    }
  } catch (err) {
    console.error(err);
    response.writeHead(500);
    response.end("Internal server error");
    return;
  }
});

server.on("error", (err) => {
  console.error(err);
});

server.listen(port, host, () => {
  const { address, port } = server.address();

  console.log(`Server is running on http://${address}:${port}`);
});
