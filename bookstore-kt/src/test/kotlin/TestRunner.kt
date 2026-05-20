import kotlin.system.exitProcess
import bookstore.Test

fun main() {
    val testClasses = listOf(
        bookstore.util.PaginationTest::class,
        bookstore.store.AuthorStoreTest::class,
        bookstore.store.BookStoreTest::class,
        bookstore.store.BookSearchTest::class,
        bookstore.store.ReviewStoreTest::class,
        bookstore.handler.BookHandlerTest::class,
        bookstore.handler.ReviewHandlerTest::class,
    )

    var pass = 0
    var fail = 0
    val failures = mutableListOf<String>()

    for (kc in testClasses) {
        val javaClass = kc.java
        val methods = javaClass.declaredMethods
            .filter { it.isAnnotationPresent(Test::class.java) }
            .sortedBy { it.name }
        for (m in methods) {
            val instance = javaClass.getDeclaredConstructor().newInstance()
            val label = "${javaClass.simpleName}.${m.name}"
            try {
                m.invoke(instance)
                println("PASS $label")
                pass++
            } catch (e: Throwable) {
                val cause = e.cause ?: e
                println("FAIL $label: ${cause.javaClass.simpleName}: ${cause.message}")
                failures += label
                fail++
            }
        }
    }

    println()
    println("$pass passed, $fail failed")
    if (failures.isNotEmpty()) {
        println("failures:")
        failures.forEach { println("  - $it") }
    }
    if (fail > 0) exitProcess(1)
}
