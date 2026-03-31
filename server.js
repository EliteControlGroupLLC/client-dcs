const http = require("http");
const next = require("next");

const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number.parseInt(process.env.PORT || "3000", 10);

const app = next({
  dev: false,
  dir: __dirname,
  hostname,
  port,
});

const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => {
        handle(req, res);
      })
      .listen(port, hostname, () => {
        console.log(`> Next.js ready on http://${hostname}:${port}`);
      });
  })
  .catch((error) => {
    console.error("> Failed to start Next.js on GoDaddy/cPanel", error);
    process.exit(1);
  });
