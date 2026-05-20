#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

SQLITE_JDBC_VERSION=3.50.3.0
SQLITE_JDBC_JAR="libs/sqlite-jdbc-${SQLITE_JDBC_VERSION}.jar"

mkdir -p libs build/main build/test

if [ ! -f "$SQLITE_JDBC_JAR" ]; then
    echo "downloading sqlite-jdbc..."
    curl -fsSL -o "$SQLITE_JDBC_JAR" \
        "https://repo1.maven.org/maven2/org/xerial/sqlite-jdbc/${SQLITE_JDBC_VERSION}/sqlite-jdbc-${SQLITE_JDBC_VERSION}.jar"
fi

echo "compiling main..."
kotlinc -cp "$SQLITE_JDBC_JAR" -d build/main src/main/kotlin

KOTLIN_TEST_JAR=$(realpath "$(dirname "$(which kotlinc)")/../lib/kotlin-test.jar")

echo "compiling tests..."
kotlinc -cp "$SQLITE_JDBC_JAR:build/main:$KOTLIN_TEST_JAR" -d build/test src/test/kotlin

echo "build complete"
