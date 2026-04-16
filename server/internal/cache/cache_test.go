package cache

import (
	"testing"
	"time"

	"navi-core/internal/parser"
)

func TestSetAndGet(t *testing.T) {
	c := New()
	items := []parser.FeedItem{
		{Title: "A", Source: "rss", Category: "NEWS", Date: time.Now().Add(-1 * time.Hour)},
		{Title: "B", Source: "hn", Category: "NEWS", Date: time.Now()},
		{Title: "C", Source: "reddit", Category: "REDDIT", Date: time.Now().Add(-30 * time.Minute)},
	}
	c.Set(items, []string{"NEWS", "REDDIT"})

	all := c.Get("", "")
	if len(all) != 3 {
		t.Fatalf("Get all = %d, want 3", len(all))
	}
	if all[0].Title != "B" {
		t.Errorf("first item = %q, want B (newest)", all[0].Title)
	}
}

func TestGetFilterBySource(t *testing.T) {
	c := New()
	items := []parser.FeedItem{
		{Title: "A", Source: "rss", Category: "NEWS"},
		{Title: "B", Source: "hn", Category: "NEWS"},
		{Title: "C", Source: "reddit", Category: "REDDIT"},
	}
	c.Set(items, []string{"NEWS", "REDDIT"})

	result := c.Get("rss", "")
	if len(result) != 1 || result[0].Title != "A" {
		t.Errorf("filter by source=rss: got %d items", len(result))
	}
}

func TestGetFilterByCategory(t *testing.T) {
	c := New()
	items := []parser.FeedItem{
		{Title: "A", Source: "rss", Category: "NEWS"},
		{Title: "B", Source: "hn", Category: "NEWS"},
		{Title: "C", Source: "reddit", Category: "REDDIT"},
	}
	c.Set(items, []string{"NEWS", "REDDIT"})

	result := c.Get("", "REDDIT")
	if len(result) != 1 || result[0].Title != "C" {
		t.Errorf("filter by category=REDDIT: got %d items", len(result))
	}
}

func TestGetFilterMultiple(t *testing.T) {
	c := New()
	items := []parser.FeedItem{
		{Title: "A", Source: "rss", Category: "NEWS"},
		{Title: "B", Source: "hn", Category: "NEWS"},
		{Title: "C", Source: "reddit", Category: "REDDIT"},
	}
	c.Set(items, []string{"NEWS", "REDDIT"})

	result := c.Get("rss,hn", "")
	if len(result) != 2 {
		t.Errorf("filter by source=rss,hn: got %d items, want 2", len(result))
	}
}

func TestCategories(t *testing.T) {
	c := New()
	c.Set(nil, []string{"NEWS", "REDDIT"})

	cats := c.Categories()
	if len(cats) != 2 || cats[0] != "NEWS" || cats[1] != "REDDIT" {
		t.Errorf("categories = %v", cats)
	}
}

func TestUpdatedAt(t *testing.T) {
	c := New()
	before := time.Now()
	c.Set(nil, nil)
	after := time.Now()

	ua := c.UpdatedAt()
	if ua.Before(before) || ua.After(after) {
		t.Errorf("updatedAt not in expected range")
	}
}
