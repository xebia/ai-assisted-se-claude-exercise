package util

// Paginate returns (limit, offset) for the given page and size.
func Paginate(page, size int) (limit, offset int) {
	if page < 1 {
		page = 1
	}
	return size, (page - 1) * size
}
