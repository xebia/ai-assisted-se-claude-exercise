def paginate(page: int, size: int) -> tuple[int, int]:
    """Returns (limit, offset) for the given page and size."""
    return size, (page - 1) * size
