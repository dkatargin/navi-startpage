package parser

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"navi-core/internal/config"
)

func TestHNParser_Fetch(t *testing.T) {
	mux := http.NewServeMux()
	mux.HandleFunc("/v0/topstories.json", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode([]int{1, 2})
	})
	mux.HandleFunc("/v0/item/1.json", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]any{
			"id": 1, "title": "First Story", "url": "https://example.com/1", "time": 1713264000,
		})
	})
	mux.HandleFunc("/v0/item/2.json", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]any{
			"id": 2, "title": "Ask HN: Something", "url": "", "time": 1713260400,
		})
	})
	srv := httptest.NewServer(mux)
	defer srv.Close()

	p := &HNParser{}
	items, err := p.Fetch(config.SourceConfig{URL: srv.URL + "/v0", MaxItems: 5})
	if err != nil {
		t.Fatalf("Fetch error: %v", err)
	}

	if len(items) != 2 {
		t.Fatalf("items = %d, want 2", len(items))
	}
	if items[0].Title != "First Story" {
		t.Errorf("title = %q", items[0].Title)
	}
	if items[0].Source != "hn" {
		t.Errorf("source = %q, want hn", items[0].Source)
	}
	if !strings.Contains(items[1].URL, "news.ycombinator.com") {
		t.Errorf("expected HN fallback URL, got %q", items[1].URL)
	}
}

func TestHNParser_Type(t *testing.T) {
	p := &HNParser{}
	if p.Type() != "hn" {
		t.Errorf("Type() = %q, want hn", p.Type())
	}
}
