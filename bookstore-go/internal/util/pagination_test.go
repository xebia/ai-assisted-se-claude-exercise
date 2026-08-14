package util_test

import (
	"testing"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/util"
)

func TestPaginate(t *testing.T) {
	tests := []struct {
		name       string
		page, size int
		wantLimit  int
		wantOffset int
	}{
		{"first page", 1, 10, 10, 0},
		{"second page", 2, 10, 10, 10},
		{"third page custom size", 3, 5, 5, 10},
		{"large page", 100, 20, 20, 1980},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			limit, offset := util.Paginate(tt.page, tt.size)
			if limit != tt.wantLimit || offset != tt.wantOffset {
				t.Errorf("Paginate(%d, %d) = (%d, %d), want (%d, %d)",
					tt.page, tt.size, limit, offset, tt.wantLimit, tt.wantOffset)
			}
		})
	}
}

// TestPaginateZeroPage asserts that page 0 is treated like page 1 rather than
// producing a negative offset.
func TestPaginateZeroPage(t *testing.T) {
	limit, offset := util.Paginate(0, 10)
	if limit != 10 || offset != 0 {
		t.Errorf("Paginate(0, 10) = (%d, %d), want (10, 0)", limit, offset)
	}
}

// TestPaginateNegativePage asserts that a negative page number is also
// clamped to page 1 instead of producing a negative offset.
func TestPaginateNegativePage(t *testing.T) {
	limit, offset := util.Paginate(-5, 10)
	if limit != 10 || offset != 0 {
		t.Errorf("Paginate(-5, 10) = (%d, %d), want (10, 0)", limit, offset)
	}
}
