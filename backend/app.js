const Koa = require("koa");
// JSON pretty-printed response middleware. Also converts node object streams to binary.
const json = require("koa-json");

// 错误处理中间件，可以打印详细报错信息
const onerror = require("koa-onerror");
// 用来解析body
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const WebSocket = require("ws");
// 引用Server类:
const WebSocketServer = WebSocket.Server;

// 实例化:
const wss = new WebSocketServer({
  port: 3001
});

const index = require("./routes/index");
const users = require("./routes/users");

const app = new Koa();

// error handler
onerror(app);

// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"]
  })
);
// 总是返回美化了的json数据
app.use(json());
app.use(logger());
// 用于koa的静态文件指定映射路径
app.use(require("koa-static")(__dirname + "/public"));

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());

wss.on("connection", function(ws) {
  console.log(`websocket connected`);
  ws.on("message", function(message) {
    ws.send(`from backend: 前端，您瞧好嘞！`);
    setInterval(() => {
      ws.send(`来自后端的数据块`);
    }, 2000);
  });
});

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app;
