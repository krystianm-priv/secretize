import "@secretized/sdk-typescript";

const env = (await import("./sample-node-app.secretized")).createInstance();

console.log(env);
