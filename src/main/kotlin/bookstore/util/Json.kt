package bookstore.util

import kotlin.reflect.full.memberProperties

object Json {
    fun encode(v: Any?): String {
        val sb = StringBuilder()
        write(sb, v)
        return sb.toString()
    }

    private fun write(sb: StringBuilder, v: Any?) {
        when (v) {
            null -> sb.append("null")
            is Boolean -> sb.append(v.toString())
            is Number -> sb.append(v.toString())
            is String -> writeString(sb, v)
            is Map<*, *> -> {
                sb.append('{')
                var first = true
                for ((k, value) in v) {
                    if (!first) sb.append(',')
                    first = false
                    writeString(sb, k.toString())
                    sb.append(':')
                    write(sb, value)
                }
                sb.append('}')
            }
            is Iterable<*> -> {
                sb.append('[')
                var first = true
                for (item in v) {
                    if (!first) sb.append(',')
                    first = false
                    write(sb, item)
                }
                sb.append(']')
            }
            else -> {
                val kc = v::class
                if (kc.isData) {
                    sb.append('{')
                    var first = true
                    for (p in kc.memberProperties) {
                        if (!first) sb.append(',')
                        first = false
                        writeString(sb, p.name)
                        sb.append(':')
                        @Suppress("UNCHECKED_CAST")
                        write(sb, (p as kotlin.reflect.KProperty1<Any, *>).get(v))
                    }
                    sb.append('}')
                } else {
                    writeString(sb, v.toString())
                }
            }
        }
    }

    private fun writeString(sb: StringBuilder, s: String) {
        sb.append('"')
        for (c in s) {
            when (c) {
                '\\' -> sb.append("\\\\")
                '"' -> sb.append("\\\"")
                '\n' -> sb.append("\\n")
                '\r' -> sb.append("\\r")
                '\t' -> sb.append("\\t")
                '\b' -> sb.append("\\b")
                '\u000C' -> sb.append("\\f")
                else -> if (c < ' ') sb.append("\\u%04x".format(c.code)) else sb.append(c)
            }
        }
        sb.append('"')
    }

    fun decode(s: String): Any? = Parser(s).parseValue()

    private class Parser(val s: String) {
        var i = 0

        fun parseValue(): Any? {
            skip()
            return when (val c = peek()) {
                '{' -> parseObject()
                '[' -> parseArray()
                '"' -> parseString()
                't', 'f' -> parseBool()
                'n' -> parseNull()
                else -> if (c == '-' || c.isDigit()) parseNumber()
                else throw IllegalArgumentException("unexpected '$c' at $i")
            }
        }

        private fun parseObject(): Map<String, Any?> {
            consume('{')
            val out = LinkedHashMap<String, Any?>()
            skip()
            if (peek() == '}') { i++; return out }
            while (true) {
                skip()
                val k = parseString()
                skip(); consume(':')
                out[k] = parseValue()
                skip()
                if (peek() == ',') { i++; continue }
                consume('}'); return out
            }
        }

        private fun parseArray(): List<Any?> {
            consume('[')
            val out = mutableListOf<Any?>()
            skip()
            if (peek() == ']') { i++; return out }
            while (true) {
                out += parseValue()
                skip()
                if (peek() == ',') { i++; continue }
                consume(']'); return out
            }
        }

        private fun parseString(): String {
            consume('"')
            val sb = StringBuilder()
            while (i < s.length) {
                val c = s[i++]
                if (c == '"') return sb.toString()
                if (c == '\\') {
                    when (val esc = s[i++]) {
                        '"' -> sb.append('"')
                        '\\' -> sb.append('\\')
                        '/' -> sb.append('/')
                        'n' -> sb.append('\n')
                        'r' -> sb.append('\r')
                        't' -> sb.append('\t')
                        'b' -> sb.append('\b')
                        'f' -> sb.append('\u000C')
                        'u' -> {
                            val hex = s.substring(i, i + 4); i += 4
                            sb.append(hex.toInt(16).toChar())
                        }
                        else -> throw IllegalArgumentException("bad escape \\$esc")
                    }
                } else {
                    sb.append(c)
                }
            }
            throw IllegalArgumentException("unterminated string")
        }

        private fun parseBool(): Boolean {
            if (s.startsWith("true", i)) { i += 4; return true }
            if (s.startsWith("false", i)) { i += 5; return false }
            throw IllegalArgumentException("bad literal at $i")
        }

        private fun parseNull(): Any? {
            if (s.startsWith("null", i)) { i += 4; return null }
            throw IllegalArgumentException("bad literal at $i")
        }

        private fun parseNumber(): Number {
            val start = i
            if (peek() == '-') i++
            while (i < s.length && s[i].isDigit()) i++
            var isDouble = false
            if (i < s.length && s[i] == '.') { isDouble = true; i++
                while (i < s.length && s[i].isDigit()) i++
            }
            if (i < s.length && (s[i] == 'e' || s[i] == 'E')) {
                isDouble = true; i++
                if (s[i] == '+' || s[i] == '-') i++
                while (i < s.length && s[i].isDigit()) i++
            }
            val text = s.substring(start, i)
            return if (isDouble) text.toDouble() else text.toLong()
        }

        private fun peek(): Char {
            if (i >= s.length) throw IllegalArgumentException("unexpected EOF")
            return s[i]
        }
        private fun consume(c: Char) {
            if (i >= s.length || s[i] != c) throw IllegalArgumentException("expected '$c' at $i")
            i++
        }
        private fun skip() {
            while (i < s.length && s[i].isWhitespace()) i++
        }
    }
}
