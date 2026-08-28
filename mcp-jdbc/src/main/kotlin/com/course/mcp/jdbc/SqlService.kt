package com.course.mcp.jdbc

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Service
import javax.sql.DataSource

@Service
class SqlService(
    private val dataSource: DataSource,
    private val jdbcClient: JdbcClient
) {
    private val objectMapper = ObjectMapper()

    fun tableDefinitions(): String = try {
        dataSource.connection.use { conn ->
            val meta = conn.metaData
            val tableNames = meta.getTables(null, null, "%", arrayOf("TABLE")).use { rs ->
                generateSequence { if (rs.next()) rs.getString("TABLE_NAME") else null }.toList()
            }

            if (tableNames.isEmpty()) return "Database is empty — no tables found."

            tableNames.sorted().joinToString("\n") { tableName ->
                val pkColumns = meta.getPrimaryKeys(null, null, tableName).use { rs ->
                    generateSequence { if (rs.next()) rs.getString("COLUMN_NAME") else null }.toSet()
                }

                val columns = meta.getColumns(null, null, tableName, "%").use { rs ->
                    generateSequence {
                        if (rs.next()) ColumnInfo(
                            name = rs.getString("COLUMN_NAME"),
                            type = rs.getString("TYPE_NAME"),
                            nullable = rs.getString("IS_NULLABLE"),
                            defaultValue = rs.getString("COLUMN_DEF")
                        ) else null
                    }.toList()
                }

                val header = "-- Table: $tableName"
                val columnLines = columns.joinToString("\n") { col ->
                    val suffix = buildString {
                        if (col.name in pkColumns) append(" PRIMARY KEY")
                        if (col.nullable == "NO") append(" NOT NULL")
                        if (col.defaultValue != null) append(" DEFAULT ${col.defaultValue}")
                    }
                    "--   %-20s %s%s".format(col.name, col.type, suffix)
                }
                "$header\n$columnLines"
            }
        }
    } catch (e: Exception) {
        "Error: ${e.message}"
    }

    fun executeQuery(sql: String): String = try {
        val rows = jdbcClient.sql(sql).query().listOfRows()
        objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(rows)
    } catch (e: Exception) {
        objectMapper.writeValueAsString(mapOf("error" to e.message))
    }

    private data class ColumnInfo(
        val name: String,
        val type: String,
        val nullable: String,
        val defaultValue: String?
    )
}
