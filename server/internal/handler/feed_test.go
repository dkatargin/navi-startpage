package handler

import (
	"encoding/json"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"navi-core/internal/cache"
	"navi-core/internal/parser"
)

func TestGetFeed(t *testing.T) {
	c := cache.New()
	c.Set([]parser.FeedItem{
		{Title: "A", Source: "rss", Category: "NEWS", Date: time.Now()},
		{Title: "B", Source: "reddit", Category: "REDDIT", Date: time.Now()},
	}, []string{"NEWS", "REDDIT"})

	h := NewFeedHandler(c)
	r := gin.New()
	r.GET("/api/feed", h.GetFeed)

	req := httptest.NewRequest("GET", "/api/feed", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d", w.Code)
	}

	var resp FeedResponse
	json.NewDecoder(w.Body).Decode(&resp)

	if len(resp.Items) != 2 {
		t.Errorf("items = %d, want 2", len(resp.Items))
	}
	if len(resp.Categories) != 2 {
		t.Errorf("categories = %d, want 2", len(resp.Categories))
	}
}

func TestGetFeedFilterSource(t *testing.T) {
	c := cache.New()
	c.Set([]parser.FeedItem{
		{Title: "A", Source: "rss", Category: "NEWS"},
		{Title: "B", Source: "reddit", Category: "REDDIT"},
	}, []string{"NEWS", "REDDIT"})

	h := NewFeedHandler(c)
	r := gin.New()
	r.GET("/api/feed", h.GetFeed)

	req := httptest.NewRequest("GET", "/api/feed?source=rss", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var resp FeedResponse
	json.NewDecoder(w.Body).Decode(&resp)

	if len(resp.Items) != 1 || resp.Items[0].Source != "rss" {
		t.Errorf("filter failed: %+v", resp.Items)
	}
	if len(resp.Categories) != 2 {
		t.Errorf("categories should be unfiltered: %v", resp.Categories)
	}
}

func TestGetFeedFilterCategory(t *testing.T) {
	c := cache.New()
	c.Set([]parser.FeedItem{
		{Title: "A", Source: "rss", Category: "NEWS"},
		{Title: "B", Source: "reddit", Category: "REDDIT"},
	}, []string{"NEWS", "REDDIT"})

	h := NewFeedHandler(c)
	r := gin.New()
	r.GET("/api/feed", h.GetFeed)

	req := httptest.NewRequest("GET", "/api/feed?category=NEWS", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var resp FeedResponse
	json.NewDecoder(w.Body).Decode(&resp)

	if len(resp.Items) != 1 || resp.Items[0].Category != "NEWS" {
		t.Errorf("filter failed: %+v", resp.Items)
	}
}

func TestHealth(t *testing.T) {
	c := cache.New()
	c.Set(nil, nil)

	h := NewFeedHandler(c)
	r := gin.New()
	r.GET("/api/health", h.Health)

	req := httptest.NewRequest("GET", "/api/health", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d", w.Code)
	}

	var resp map[string]any
	json.NewDecoder(w.Body).Decode(&resp)

	if resp["status"] != "ok" {
		t.Errorf("status = %v", resp["status"])
	}
}
