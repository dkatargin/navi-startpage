package parser

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"navi-core/internal/config"
)

const testSponsprHTML = `<!DOCTYPE html><html><head></head><body>
<script id="__NEXT_DATA__" type="application/json">{
  "props": {
    "pageProps": {
      "project": {
        "project_url": "testcreator"
      },
      "posts": {
        "total": 2,
        "list": [
          {
            "id": 12345,
            "title": "First Sponsr Post",
            "date": "2026-04-16T10:00:00.000Z"
          },
          {
            "id": 12346,
            "title": "Second Post",
            "date": "2026-04-15T09:00:00.000Z"
          }
        ]
      }
    }
  }
}</script>
</body></html>`

func TestSponsprParser_Fetch(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Cookie") != "test-cookie" {
			t.Errorf("expected cookie, got %q", r.Header.Get("Cookie"))
		}
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(testSponsprHTML))
	}))
	defer srv.Close()

	p := &SponsprParser{}
	items, err := p.Fetch(config.SourceConfig{
		URL:     srv.URL,
		Creator: "testcreator",
		Cookie:  "test-cookie",
	})
	if err != nil {
		t.Fatalf("Fetch error: %v", err)
	}

	if len(items) != 2 {
		t.Fatalf("items = %d, want 2", len(items))
	}
	if items[0].Title != "First Sponsr Post" {
		t.Errorf("title = %q", items[0].Title)
	}
	if items[0].Source != "sponsr" {
		t.Errorf("source = %q, want sponsr", items[0].Source)
	}
	if items[0].URL != "https://sponsr.ru/testcreator/12345/" {
		t.Errorf("url = %q", items[0].URL)
	}
	if items[0].Date.IsZero() {
		t.Error("expected non-zero date")
	}
}

func TestSponsprParser_MaxItems(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(testSponsprHTML))
	}))
	defer srv.Close()

	p := &SponsprParser{}
	items, err := p.Fetch(config.SourceConfig{URL: srv.URL, Creator: "test", Cookie: "c", MaxItems: 1})
	if err != nil {
		t.Fatalf("Fetch error: %v", err)
	}
	if len(items) != 1 {
		t.Errorf("items = %d, want 1", len(items))
	}
}

func TestSponsprParser_Type(t *testing.T) {
	p := &SponsprParser{}
	if p.Type() != "sponsr" {
		t.Errorf("Type() = %q, want sponsr", p.Type())
	}
}
