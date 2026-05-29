plugins {
    kotlin("jvm") version "2.1.21"
    application
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.xerial:sqlite-jdbc:3.50.3.0")
    implementation(kotlin("reflect"))
    testImplementation(kotlin("test"))
}

application {
    mainClass.set("MainKt")
}

kotlin {
    jvmToolchain(17)
}

// Disable the default JUnit-based test task; this project uses a custom runner.
tasks.test {
    enabled = false
}

tasks.register<JavaExec>("runTests") {
    group = "verification"
    description = "Run tests via the custom TestRunner"
    dependsOn(tasks.testClasses)
    classpath = sourceSets.test.get().runtimeClasspath
    mainClass.set("TestRunnerKt")
}

tasks.named("check") {
    dependsOn("runTests")
}
