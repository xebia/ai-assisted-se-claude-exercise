package com.course.mcp

import org.springframework.ai.tool.ToolCallbackProvider
import org.springframework.ai.tool.method.MethodToolCallbackProvider
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean

@SpringBootApplication
class Application {
    @Bean
    fun toolProvider(tools: com.course.mcp.jdbc.JdbcTools): ToolCallbackProvider =
        MethodToolCallbackProvider.builder().toolObjects(tools).build()
}

fun main(args: Array<String>) {
    runApplication<Application>(*args)
}
