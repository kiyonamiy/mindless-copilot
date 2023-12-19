## 命令

### 本地测试（开发过程）

```typescript
// 后端代码生成
npx ts-node -r tsconfig-paths/register ./src/index.ts generate --dir YOUR/DIR/PATH --excel YOUR/EXCEL/PATH --template backend

// 前端代码生成
npx ts-node -r tsconfig-paths/register ./src/index.ts generate --dir ./examples/react

// ddl 生成
npx ts-node -r tsconfig-paths/register ./src/index.ts ddl --excel YOUR/EXCEL/PATH
```

## 项目开发过程

- 项目启动，参考 [How to Setup a TypeScript + Node.js Project](https://khalilstemmler.com/blogs/typescript/node-starter-project/)；
- 构建 CLI，参考 [Building a TypeScript CLI with Node.js and Commander](https://blog.logrocket.com/building-typescript-cli-node-js-commander/#getting-started-configuring-typescript)；

## 依赖介绍

- ts-node: for running TypeScript code directly without having to wait for it be compiled;
- nodemon: to watch for changes to our code and automatically restart when a file is changed;
