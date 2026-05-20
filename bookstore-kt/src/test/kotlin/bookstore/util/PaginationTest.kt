package bookstore.util

import bookstore.Test
import kotlin.test.assertEquals

class PaginationTest {
    @Test fun firstPage() {
        val (l, o) = paginate(1, 10); assertEquals(10, l); assertEquals(0, o)
    }
    @Test fun secondPage() {
        val (l, o) = paginate(2, 10); assertEquals(10, l); assertEquals(10, o)
    }
    @Test fun thirdPageCustomSize() {
        val (l, o) = paginate(3, 5); assertEquals(5, l); assertEquals(10, o)
    }
    @Test fun largePage() {
        val (l, o) = paginate(100, 20); assertEquals(20, l); assertEquals(1980, o)
    }
}
