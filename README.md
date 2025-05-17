
# banaNa v2

A server/emulator for an Adobe Flash MMORPG 2D, developed in TypeScript and running on Bun runtime.

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime installed
- MySQL server running
- (Optional) Node.js for some tools, but Bun covers most use cases

---

## 📦 Installation

1. Clone the repository:

```bash
git clone https://your-repo-url.git
cd aqw-server
```

2. Install dependencies with Bun:

```bash
bun install
```

3. Configure your MySQL database credentials (not shown here, usually in a config file).

---

## 🏃‍♂️ Running the server

Start the server:

```bash
bun src/Main.ts
```

Or run with the npm script:

```bash
bun run start
```

### Debug mode

Run the server with debugger enabled:

```bash
bun run debug
```

---

## 📋 Available scripts

| Script       | Description                                 |
|--------------|---------------------------------------------|
| `start`      | Starts the server                           |
| `debug`      | Starts the server in debug mode             |
| `test`       | Runs tests                                 |
| `introspect` | Introspects the database schema with Drizzle ORM |
| `generate`   | Generates database migrations               |
| `push`       | Applies migrations to the database          |
| `build`      | Builds and minifies the project for production |

---

## 📚 Main Dependencies

- **Bun** — Runtime to run TS/JS code
- **Drizzle ORM** — ORM for MySQL
- **fast-xml-parser** — XML parser library
- **mysql2** — MySQL driver
- **node-schedule** — Job scheduler

---

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements.

---

## License

This project is licensed under the MIT License.
