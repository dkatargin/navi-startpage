package parser

import (
	"net/http"
	"time"

	"navi-core/internal/config"
)

var HTTPClient = &http.Client{Timeout: 30 * time.Second}

type FeedItem struct {
	Title      string    `json:"title"`
	URL        string    `json:"url"`
	Source     string    `json:"source"`
	SourceName string    `json:"source_name"`
	Category   string    `json:"category"`
	Date       time.Time `json:"date"`
	Preview    string    `json:"preview"`
}

type Parser interface {
	Type() string
	Fetch(cfg config.SourceConfig) ([]FeedItem, error)
}

func Truncate(s string, max int) string {
	runes := []rune(s)
	if len(runes) <= max {
		return s
	}
	return string(runes[:max]) + "..."
}
