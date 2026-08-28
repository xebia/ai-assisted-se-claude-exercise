package com.course.mcp.jdbc

import org.springframework.ai.tool.annotation.Tool
import org.springframework.ai.tool.annotation.ToolParam
import org.springframework.stereotype.Component

@Component
class JdbcTools(private val sqlService: SqlService) {

    @Tool(
        name = "get_table_definitions",
        description = "Return the table definitions (name, columns, types, constraints) for every " +
            "table in the database. Call this before writing any SQL query so you know the exact " +
            "column names, types, and foreign-key relationships."
    )
    fun getTableDefinitions(): String = sqlService.tableDefinitions()

    @Tool(
        name = "execute_query",
        description = "Execute a read-only SELECT query against the database. " +
            "Returns results as a JSON array of objects (one object per row). " +
            "Only SELECT statements are permitted."
    )
    fun executeQuery(
        @ToolParam(description = "A valid SQL SELECT statement.") sql: String
    ): String {
        if (!sql.trim().uppercase().startsWith("SELECT")) {
            return """{"error": "only SELECT queries are allowed"}"""
        }
        return sqlService.executeQuery(sql)
    }
}
