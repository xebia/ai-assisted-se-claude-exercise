package com.course.mcp.jdbc

import com.fasterxml.jackson.databind.ObjectMapper
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import javax.sql.DataSource

@SpringBootTest(properties = ["spring.datasource.url=jdbc:sqlite::memory:"])
class JdbcToolsTest(
    @Autowired val jdbcTools: JdbcTools,
    @Autowired val dataSource: DataSource
) {
    private val objectMapper = ObjectMapper()

    @BeforeEach
    fun setUp() {
        dataSource.connection.use { conn ->
            listOf("books", "authors", "items").forEach { table ->
                conn.createStatement().execute("DROP TABLE IF EXISTS $table")
            }
        }
    }

    @Test
    fun `getTableDefinitions on empty database`() {
        jdbcTools.getTableDefinitions() shouldBe "Database is empty — no tables found."
    }

    @Test
    fun `getTableDefinitions with tables`() {
        createTestTables()

        val result = jdbcTools.getTableDefinitions()
        result shouldContain "authors"
        result shouldContain "books"
        result shouldContain "id"
        result shouldContain "name"
        result shouldContain "title"
    }

    @Test
    fun `executeQuery with valid SELECT`() {
        createItemsWithData()

        val result = jdbcTools.executeQuery("SELECT * FROM items ORDER BY id")
        val parsed = parseJsonList(result)
        parsed shouldHaveSize 2
        @Suppress("UNCHECKED_CAST")
        (parsed[0] as Map<String, Any>)["name"] shouldBe "Alice"
    }

    @Test
    fun `executeQuery rejects non-SELECT`() {
        jdbcTools.executeQuery("INSERT INTO items VALUES (1, 'Alice')") shouldContain "only SELECT queries are allowed"
    }

    @Test
    fun `executeQuery rejects DELETE`() {
        jdbcTools.executeQuery("DELETE FROM items") shouldContain "only SELECT queries are allowed"
    }

    @Test
    fun `executeQuery with invalid SQL returns error`() {
        jdbcTools.executeQuery("SELECT * FROM nonexistent_table_xyz") shouldContain "error"
    }

    @Test
    fun `executeQuery handles lowercase select`() {
        createItemsWithData()

        val result = jdbcTools.executeQuery("select * from items")
        parseJsonList(result) shouldHaveSize 2
    }

    @Test
    fun `executeQuery handles leading whitespace`() {
        createItemsWithData()

        val result = jdbcTools.executeQuery("   SELECT * FROM items")
        parseJsonList(result) shouldHaveSize 2
    }

    private fun createTestTables() {
        dataSource.connection.use { conn ->
            conn.createStatement().execute(
                """CREATE TABLE authors (
                    id INTEGER PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL,
                    bio TEXT DEFAULT 'Unknown'
                )"""
            )
            conn.createStatement().execute(
                "CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, author_id INTEGER)"
            )
        }
    }

    private fun createItemsWithData() {
        dataSource.connection.use { conn ->
            conn.createStatement().execute("CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT)")
            conn.createStatement().execute("INSERT INTO items VALUES (1, 'Alice')")
            conn.createStatement().execute("INSERT INTO items VALUES (2, 'Bob')")
        }
    }

    private fun parseJsonList(json: String): List<*> =
        objectMapper.readValue(json, List::class.java)
}
