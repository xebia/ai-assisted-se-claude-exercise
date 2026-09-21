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
