const axios = require("axios");
const chalk = require("chalk");

function parseHeaders(headerArray = []) {
  const headers = {};

  headerArray.forEach((h) => {
    const [key, value] = h.split(":");
    if (key && value) {
      headers[key.trim()] = value.trim();
    }
  });

  return headers;
}

async function sendRequest(method, url, data, headerArray) {
  try {
    const headers = parseHeaders(headerArray);

    console.log(chalk.blue(`\n➡️ ${method} ${url}\n`));

    const response = await axios({
      method,
      url,
      data,
      headers,
    });

    console.log(chalk.green("✅ Status:"), response.status);
    console.log(chalk.yellow("\n📦 Response:\n"));
    console.log(JSON.stringify(response.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.log(chalk.red("❌ Error Status:"), err.response.status);
      console.log(err.response.data);
    } else {
      console.log(chalk.red("❌ Request failed:"), err.message);
    }
  }
}

module.exports = { sendRequest };