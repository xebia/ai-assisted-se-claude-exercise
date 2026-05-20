// SQLite MCP Server — exposes the bookstore database to Claude Code.
//
// Tools:
//
//	get_table_definitions  — returns CREATE TABLE statements + column info
//	execute_query          — runs a read-only SELECT query, returns JSON rows
package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
	_ "modernc.org/sqlite"
)

var dbPath string

func main() {
	// Default: bookstore-go/store.db relative to this source file.
	// Works with both `go run .` and a compiled binary in the same directory.
	_, src, _, _ := runtime.Caller(0)
	defaultDB := filepath.Join(filepath.Dir(src), "..", "bookstore-go", "store.db")

	flag.StringVar(&dbPath, "db", defaultDB, "path to the SQLite database file")
	flag.Parse()

	s := server.NewMCPServer("sqlite-bookstore", "1.0.0")

	s.AddTool(
		mcp.NewTool("get_table_definitions",
			mcp.WithDescription(
				"Return the CREATE TABLE statement and column list for every table "+
					"in the database. Call this before writing any SQL query so you "+
					"know the exact column names, types, and foreign-key relationships.",
			),
		),
		handleGetTableDefinitions,
	)

	s.AddTool(
		mcp.NewTool("execute_query",
			mcp.WithDescription(
				"Execute a read-only SELECT query against the bookstore database. "+
					"Returns results as a JSON array of objects (one object per row). "+
					"Only SELECT statements are permitted.",
			),
			mcp.WithString("sql",
				mcp.Required(),
				mcp.Description("A valid SQLite SELECT statement."),
			),
		),
		handleExecuteQuery,
	)

	if err := server.ServeStdio(s); err != nil {
		log.Fatal(err)
	}
}

func openDB() (*sql.DB, error) {
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		return nil, fmt.Errorf(
			"database not found at %s — run `go run . --seed` from the bookstore directory first",
			dbPath,
		)
	}
	return sql.Open("sqlite", dbPath)
}

func handleGetTableDefinitions(_ context.Context, _ mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	db, err := openDB()
	if err != nil {
		return mcp.NewToolResultText(fmt.Sprintf("Error: %s", err)), nil
	}
	defer db.Close()

	rows, err := db.Query("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name")
	if err != nil {
		return mcp.NewToolResultText(fmt.Sprintf("Error: %s", err)), nil
	}
	defer rows.Close()

	type tableRow struct {
		name string
		sql  sql.NullString
	}

	var tables []tableRow
	for rows.Next() {
		var t tableRow
		if err := rows.Scan(&t.name, &t.sql); err != nil {
			return mcp.NewToolResultText(fmt.Sprintf("Error: %s", err)), nil
		}
		tables = append(tables, t)
	}

	if len(tables) == 0 {
		return mcp.NewToolResultText("Database is empty — no tables found."), nil
	}

	var sb strings.Builder
	for _, t := range tables {
		fmt.Fprintf(&sb, "-- Table: %s\n", t.name)
		if t.sql.Valid {
			fmt.Fprintf(&sb, "%s\n", t.sql.String)
		} else {
			fmt.Fprintf(&sb, "-- (system table, no CREATE statement)\n")
		}

		// PRAGMA table_info returns: cid, name, type, notnull, dflt_value, pk
		pragmaRows, err := db.Query(fmt.Sprintf("PRAGMA table_info(%s)", t.name))
		if err != nil {
			fmt.Fprintf(&sb, "-- (could not read column info: %s)\n", err)
		} else {
			for pragmaRows.Next() {
				var cid, notnull, pk int
				var colName, colType string
				var dfltValue sql.NullString
				if err := pragmaRows.Scan(&cid, &colName, &colType, &notnull, &dfltValue, &pk); err != nil {
					continue
				}
				suffix := ""
				if pk != 0 {
					suffix += " PRIMARY KEY"
				}
				if notnull != 0 {
					suffix += " NOT NULL"
				}
				if dfltValue.Valid {
					suffix += " DEFAULT " + dfltValue.String
				}
				fmt.Fprintf(&sb, "--   %-20s %s%s\n", colName, colType, suffix)
			}
			pragmaRows.Close()
		}
		sb.WriteString("\n")
	}

	return mcp.NewToolResultText(sb.String()), nil
}

func handleExecuteQuery(_ context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	sqlStr, err := req.RequireString("sql")
	if err != nil {
		return mcp.NewToolResultText(`{"error": "missing required parameter: sql"}`), nil
	}

	if !strings.HasPrefix(strings.TrimSpace(strings.ToUpper(sqlStr)), "SELECT") {
		return mcp.NewToolResultText(`{"error": "only SELECT queries are allowed"}`), nil
	}

	db, err := openDB()
	if err != nil {
		return mcp.NewToolResultText(fmt.Sprintf(`{"error": %q}`, err.Error())), nil
	}
	defer db.Close()

	rows, err := db.Query(sqlStr)
	if err != nil {
		return mcp.NewToolResultText(fmt.Sprintf(`{"error": %q}`, err.Error())), nil
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return mcp.NewToolResultText(fmt.Sprintf(`{"error": %q}`, err.Error())), nil
	}

	var result []map[string]any
	for rows.Next() {
		vals := make([]any, len(columns))
		ptrs := make([]any, len(columns))
		for i := range vals {
			ptrs[i] = &vals[i]
		}
		if err := rows.Scan(ptrs...); err != nil {
			return mcp.NewToolResultText(fmt.Sprintf(`{"error": %q}`, err.Error())), nil
		}
		row := make(map[string]any, len(columns))
		for i, col := range columns {
			// sqlite returns []byte for TEXT — convert to string
			if b, ok := vals[i].([]byte); ok {
				row[col] = string(b)
			} else {
				row[col] = vals[i]
			}
		}
		result = append(result, row)
	}

	out, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		return mcp.NewToolResultText(fmt.Sprintf(`{"error": %q}`, err.Error())), nil
	}
	return mcp.NewToolResultText(string(out)), nil
}
