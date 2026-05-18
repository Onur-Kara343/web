# API Tester CLI

Ein kleines CLI-Tool zum Testen von HTTP-APIs mit `GET`- und `POST`-Requests.

## Installation

1. `cd api-tester-cli`
2. `npm install`

## Nutzung

### Mit `node`

`node apiTester.js get <url> [--header "Key:Value"]`

`node apiTester.js post <url> [--data '{"key":"value"}'] [--header "Key:Value"]`

### Beispiele

- GET-Request:
  `node apiTester.js get https://jsonplaceholder.typicode.com/posts/1`
- POST-Request:
  `node apiTester.js post https://jsonplaceholder.typicode.com/posts --data '{"title":"Hallo"}'`

## Features

- `GET`-Request mit optionalen Headern
- `POST`-Request mit JSON-Body und Headern
- Nutzt `axios`, `commander` und `chalk`
