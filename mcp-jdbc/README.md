# mcp-jdbc

A Spring AI MCP server that exposes any JDBC-compatible database to AI agents via the Model Context Protocol (MCP). It provides two tools:

- **`get_table_definitions`** — Returns table names, columns, types, and constraints.
- **`execute_query`** — Executes read-only `SELECT` queries and returns results as JSON.

Supports **SQLite**, **PostgreSQL**, and **MySQL** out of the box.

## Build

### Gradle

```bash
cd mcp-jdbc
./gradlew bootJar
```

The fat JAR is produced at `build/libs/mcp-jdbc-0.0.1-SNAPSHOT.jar`.

### Maven

```bash
cd mcp-jdbc
mvn package
```

The fat JAR is produced at `target/mcp-jdbc-0.0.1-SNAPSHOT.jar`.

## Configuration

The server is configured via environment variables:

| Variable           | Description                        | Default          |
|--------------------|------------------------------------|------------------|
| `JDBC_URL`         | JDBC connection URL (**required**) | —                |
| `JDBC_USERNAME`    | Database username (optional)       | empty            |
| `JDBC_PASSWORD`    | Database password (optional)       | empty            |
| `MCP_SERVER_NAME`  | Name advertised to MCP clients     | `jdbc-database`  |
| `MCP_SERVER_VERSION` | Version advertised to MCP clients | `1.0.0`          |

Credentials can either be embedded in `JDBC_URL` (e.g. `?user=me&password=secret`) or supplied
separately via `JDBC_USERNAME` / `JDBC_PASSWORD`. Passing them separately is preferred — it keeps
secrets out of the connection string and out of process listings/logs that might show `JDBC_URL`.
If both are set, `JDBC_USERNAME` / `JDBC_PASSWORD` take precedence, since Spring's DataSource
builder applies them after parsing the URL.

### JDBC URL examples

| Database   | JDBC URL                          |
|------------|------------------------------------|
| SQLite     | `jdbc:sqlite:/path/to/database.db` |
| PostgreSQL | `jdbc:postgresql://localhost:5432/mydb` |
| MySQL      | `jdbc:mysql://localhost:3306/mydb` |

## MCP client configuration

### `.mcp.json` (project-level)

Add this to your project's `.mcp.json` to make the server available in that workspace:

```json
{
  "servers": {
    "jdbc-database": {
      "type": "stdio",
      "command": "java",
      "args": ["-jar", "/absolute/path/to/mcp-jdbc.jar"],
      "env": {
        "JDBC_URL": "jdbc:postgresql://localhost:5432/mydb",
        "JDBC_USERNAME": "me",
        "JDBC_PASSWORD": "secret"
      }
    }
  }
}
```

### Claude Code CLI commands

You can also add the MCP server directly from the command line:

```bash
# Add to the current project (writes to .mcp.json)
claude mcp add jdbc-database \
  -e JDBC_URL="jdbc:postgresql://localhost:5432/mydb" \
  -e JDBC_USERNAME="me" \
  -e JDBC_PASSWORD="secret" \
  -- java -jar /absolute/path/to/mcp-jdbc.jar

# Add globally (available in all projects)
claude mcp add --scope user jdbc-database \
  -e JDBC_URL="jdbc:postgresql://localhost:5432/mydb" \
  -e JDBC_USERNAME="me" \
  -e JDBC_PASSWORD="secret" \
  -- java -jar /absolute/path/to/mcp-jdbc.jar
```

### Verify

```bash
claude mcp list
```
