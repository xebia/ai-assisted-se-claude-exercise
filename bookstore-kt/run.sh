#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

./build.sh >/dev/null

SQLITE_JDBC_JAR=$(ls libs/sqlite-jdbc-*.jar | head -1)
KOTLIN_STDLIB=$(kotlinc -version 2>&1 >/dev/null; echo "$KOTLIN_HOME")
KOTLIN_STDLIB_JAR=$(realpath "$(dirname "$(which kotlinc)")/../lib/kotlin-stdlib.jar")
KOTLIN_REFLECT_JAR=$(realpath "$(dirname "$(which kotlinc)")/../lib/kotlin-reflect.jar")

exec java -cp "build/main:$SQLITE_JDBC_JAR:$KOTLIN_STDLIB_JAR:$KOTLIN_REFLECT_JAR" MainKt "$@"
