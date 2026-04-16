package scheduler

import (
	"context"
	"fmt"
	"testing"
	"time"

	"navi-core/internal/cache"
	"navi-core/internal/config"
	"navi-core/internal/parser"
)

type mockParser struct {
	typeName string
	items    []parser.FeedItem
	err      error
}

func (m *mockParser) Type() string                                        { return m.typeName }
func (m *mockParser) Fetch(cfg config.SourceConfig) ([]parser.FeedItem, error) { return m.items, m.err }

func TestFetchAll(t *testing.T) {
	c := cache.New()
	parsers := map[string]parser.Parser{
		"rss": &mockParser{typeName: "rss", items: []parser.FeedItem{
			{Title: "RSS Item", Source: "rss", Date: time.Now()},
		}},
		"hn": &mockParser{typeName: "hn", items: []parser.FeedItem{
			{Title: "HN Item", Source: "hn", Date: time.Now().Add(-1 * time.Hour)},
		}},
	}
	categories := []config.CategoryConfig{
		{Name: "NEWS", Sources: []config.SourceConfig{{Type: "rss", URL: "https://example.com"}, {Type: "hn"}}},
	}

	s := New(parsers, categories, c, time.Hour)
	s.fetchAll()

	items := c.Get("", "")
	if len(items) != 2 {
		t.Fatalf("items = %d, want 2", len(items))
	}
	for _, item := range items {
		if item.Category != "NEWS" {
			t.Errorf("category = %q, want NEWS", item.Category)
		}
	}
	cats := c.Categories()
	if len(cats) != 1 || cats[0] != "NEWS" {
		t.Errorf("categories = %v", cats)
	}
}

func TestFetchAllMultipleCategories(t *testing.T) {
	c := cache.New()
	parsers := map[string]parser.Parser{
		"rss":    &mockParser{typeName: "rss", items: []parser.FeedItem{{Title: "RSS", Source: "rss"}}},
		"reddit": &mockParser{typeName: "reddit", items: []parser.FeedItem{{Title: "Reddit", Source: "reddit"}}},
	}
	categories := []config.CategoryConfig{
		{Name: "NEWS", Sources: []config.SourceConfig{{Type: "rss"}}},
		{Name: "REDDIT", Sources: []config.SourceConfig{{Type: "reddit", Subreddit: "test"}}},
	}

	s := New(parsers, categories, c, time.Hour)
	s.fetchAll()

	news := c.Get("", "NEWS")
	if len(news) != 1 || news[0].Category != "NEWS" {
		t.Errorf("NEWS items = %v", news)
	}
	reddit := c.Get("", "REDDIT")
	if len(reddit) != 1 || reddit[0].Category != "REDDIT" {
		t.Errorf("REDDIT items = %v", reddit)
	}
}

func TestFetchAllParserError(t *testing.T) {
	c := cache.New()
	parsers := map[string]parser.Parser{
		"rss": &mockParser{typeName: "rss", items: []parser.FeedItem{{Title: "OK", Source: "rss"}}},
		"hn":  &mockParser{typeName: "hn", err: fmt.Errorf("network error")},
	}
	categories := []config.CategoryConfig{
		{Name: "NEWS", Sources: []config.SourceConfig{{Type: "rss"}, {Type: "hn"}}},
	}

	s := New(parsers, categories, c, time.Hour)
	s.fetchAll()

	items := c.Get("", "")
	if len(items) != 1 {
		t.Fatalf("items = %d, want 1 (hn should be skipped)", len(items))
	}
}

func TestStartAndStop(t *testing.T) {
	c := cache.New()
	parsers := map[string]parser.Parser{
		"rss": &mockParser{typeName: "rss", items: []parser.FeedItem{{Title: "Item", Source: "rss"}}},
	}
	categories := []config.CategoryConfig{
		{Name: "NEWS", Sources: []config.SourceConfig{{Type: "rss"}}},
	}

	s := New(parsers, categories, c, 50*time.Millisecond)
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan struct{})
	go func() {
		s.Start(ctx)
		close(done)
	}()

	time.Sleep(20 * time.Millisecond)
	if len(c.Get("", "")) != 1 {
		t.Error("expected items after Start")
	}

	cancel()
	select {
	case <-done:
	case <-time.After(time.Second):
		t.Fatal("Start did not return after cancel")
	}
}
