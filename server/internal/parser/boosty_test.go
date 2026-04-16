package parser

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"navi-core/internal/config"
)

const testBoostyHTML = `<!DOCTYPE html><html><head></head><body>
<script type="text/plain" id="initial-state">{
  "posts": {
    "postsList": {
      "data": {
        "blogUrl": "testauthor",
        "posts": [
          {
            "id": "abc-123",
            "intId": 1001,
            "title": "First Boosty Post",
            "publishTime": 1713264000
          },
          {
            "id": "def-456",
            "intId": 1002,
            "title": "Second Post",
            "publishTime": 1713260400
          }
        ]
      }
    }
  }
}</script>
</body></html>`

func TestBoostyParser_Fetch(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Cookie") != "test-cookie" {
			t.Errorf("expected cookie, got %q", r.Header.Get("Cookie"))
		}
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(testBoostyHTML))
	}))
	defer srv.Close()

	p := &BoostyParser{}
	items, err := p.Fetch(config.SourceConfig{
		URL:     srv.URL,
		Creator: "testauthor",
		Cookie:  "test-cookie",
	})
	if err != nil {
		t.Fatalf("Fetch error: %v", err)
	}

	if len(items) != 2 {
		t.Fatalf("items = %d, want 2", len(items))
	}
	if items[0].Title != "First Boosty Post" {
		t.Errorf("title = %q", items[0].Title)
	}
	if items[0].Source != "boosty" {
		t.Errorf("source = %q, want boosty", items[0].Source)
	}
	if items[0].SourceName != "testauthor" {
		t.Errorf("source_name = %q, want testauthor", items[0].SourceName)
	}
	if items[0].URL != "https://boosty.to/testauthor/posts/abc-123" {
		t.Errorf("url = %q", items[0].URL)
	}
	if items[0].Date.IsZero() {
		t.Error("expected non-zero date")
	}
}

func TestBoostyParser_MaxItems(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(testBoostyHTML))
	}))
	defer srv.Close()

	p := &BoostyParser{}
	items, err := p.Fetch(config.SourceConfig{URL: srv.URL, Creator: "test", MaxItems: 1})
	if err != nil {
		t.Fatalf("Fetch error: %v", err)
	}
	if len(items) != 1 {
		t.Errorf("items = %d, want 1", len(items))
	}
}

func TestBoostyParser_Type(t *testing.T) {
	p := &BoostyParser{}
	if p.Type() != "boosty" {
		t.Errorf("Type() = %q, want boosty", p.Type())
	}
}
