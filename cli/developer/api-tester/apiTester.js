#!/usr/bin/env node

const { program } = require("commander");
const { sendRequest } = require("./request");

program
  .name("api-tester")
  .description("Simple CLI API Tester")
  .version("1.0.0");

program
  .command("get")
  .argument("<url>", "Request URL")
  .option("-H, --header <headers...>", "Headers key:value")
  .action(async (url, options) => {
    await sendRequest("GET", url, null, options.header);
  });

program
  .command("post")
  .argument("<url>", "Request URL")
  .option("-d, --data <json>", "JSON body")
  .option("-H, --header <headers...>", "Headers key:value")
  .action(async (url, options) => {
    let data = null;

    if (options.data) {
      try {
        data = JSON.parse(options.data);
      } catch (err) {
        console.error("❌ Invalid JSON body");
        process.exit(1);
      }
    }

    await sendRequest("POST", url, data, options.header);
  });

program.parse();