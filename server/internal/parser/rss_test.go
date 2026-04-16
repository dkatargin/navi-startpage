package parser

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"navi-core/internal/config"
)

const testRSSFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Blog</title>
    <item>
      <title>First Post</title>
      <link>https://example.com/first</link>
      <description>This is the first post description</description>
      <pubDate>Wed, 16 Apr 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Second Post</title>
      <link>https://example.com/second</link>
      <pubDate>Wed, 16 Apr 2026 09:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`

func TestRSSParser_Fetch(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/xml")
		w.Write([]byte(testRSSFeed))
	}))
	defer srv.Close()

	p := &RSSParser{}
	items, err := p.Fetch(config.SourceConfig{URL: srv.URL, MaxItems: 10})
	if err != nil {
		t.Fatalf("Fetch error: %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("items = %d, want 2", len(items))
	}
	if items[0].Title != "First Post" {
		t.Errorf("title = %q, want First Post", items[0].Title)
	}
	if items[0].URL != "https://example.com/first" {
		t.Errorf("url = %q", items[0].URL)
	}
	if items[0].Source != "rss" {
		t.Errorf("source = %q, want rss", items[0].Source)
	}
	if items[0].Preview == "" {
		t.Error("preview should not be empty")
	}
}

func TestRSSParser_MaxItems(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(testRSSFeed))
	}))
	defer srv.Close()

	p := &RSSParser{}
	items, err := p.Fetch(config.SourceConfig{URL: srv.URL, MaxItems: 1})
	if err != nil {
		t.Fatalf("Fetch error: %v", err)
	}
	if len(items) != 1 {
		t.Errorf("items = %d, want 1", len(items))
	}
}

func TestRSSParser_Type(t *testing.T) {
	p := &RSSParser{}
	if p.Type() != "rss" {
		t.Errorf("Type() = %q, want rss", p.Type())
	}
}
