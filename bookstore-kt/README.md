# BookStore API (Kotlin / JVM)

A deliberately simple Kotlin REST API using only the JDK's built-in HTTP
server (`com.sun.net.httpserver`), JDBC, and a vendored `sqlite-jdbc` JAR.
The project manages books, authors, and reviews. It contains several
intentional issues for participants to discover with AI assistance.

Requires Java 17+ on the PATH. Use either Gradle or Maven to build and run.

**Gradle** (wrapper included, no installation needed):

```bash
./gradlew build             # compile main + tests
./gradlew run               # starts on :8080, seeds on first run
./gradlew run --args="--seed"  # wipes and reseeds
./gradlew runTests          # runs the test suite
```

**Maven** (requires `mvn` on the PATH):

```bash
mvn compile                                          # compile
mvn exec:java -Dexec.mainClass=MainKt               # starts on :8080
mvn exec:java -Dexec.mainClass=MainKt -Dexec.args="--seed"  # wipes and reseeds
mvn test                                             # runs the test suite
```

The custom test runner in `src/test/kotlin/TestRunner.kt` discovers `@Test`
annotated methods via reflection and reports pass/fail counts.

Please read [preparation.md](preparation.md)
