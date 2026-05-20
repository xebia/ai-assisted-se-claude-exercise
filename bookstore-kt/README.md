# BookStore API (Kotlin / JVM)

A deliberately simple Kotlin REST API using only the JDK's built-in HTTP
server (`com.sun.net.httpserver`), JDBC, and a vendored `sqlite-jdbc` JAR.
The project manages books, authors, and reviews. It contains several
intentional issues for participants to discover with AI assistance.

Requires `kotlinc` (Kotlin 1.9+) and `java` (21+) on the PATH.

Run:

```bash
./build.sh        # downloads sqlite-jdbc on first run, compiles main + tests
./run.sh          # starts on :8080, seeds on first run
./run.sh --seed   # wipes and reseeds
./test.sh         # runs the test suite
```

The custom test runner in `src/test/kotlin/TestRunner.kt` discovers `@Test`
annotated methods via reflection and reports pass/fail counts.

Please read [preparation.md](preparation.md)
