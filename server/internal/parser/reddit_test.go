package parser

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"navi-core/internal/config"
)

const testRedditRSS = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>r/selfhosted</title>
  <entry>
    <title>First post</title>
    <link href="https://www.reddit.com/r/test/comments/abc/first_post/" />
    <updated>2026-04-16T10:00:00+00:00</updated>
    <content type="html">Hello world</content>
  </entry>
  <entry>
    <title>Second post</title>
    <link href="https://www.reddit.com/r/test/comments/def/second_post/" />
    <updated>2026-04-16T09:00:00+00:00</updated>
  </entry>
</feed>`

func TestRedditParser_Fetch(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/atom+xml")
		w.Write([]byte(testRedditRSS))
	}))
	defer srv.Close()

	p := &RedditParser{}
	items, err := p.Fetch(config.SourceConfig{URL: srv.URL, Subreddit: "test", MaxItems: 10})
	if err != nil {
		t.Fatalf("Fetch error: %v", err)
	}

	if len(items) != 2 {
		t.Fatalf("items = %d, want 2", len(items))
	}
	if items[0].Title != "First post" {
		t.Errorf("title = %q", items[0].Title)
	}
	if items[0].Source != "reddit" {
		t.Errorf("source = %q, want reddit", items[0].Source)
	}
}

func TestRedditParser_MaxItems(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(testRedditRSS))
	}))
	defer srv.Close()

	p := &RedditParser{}
	items, err := p.Fetch(config.SourceConfig{URL: srv.URL, Subreddit: "test", MaxItems: 1})
	if err != nil {
		t.Fatalf("Fetch error: %v", err)
	}
	if len(items) != 1 {
		t.Errorf("items = %d, want 1", len(items))
	}
}

func TestRedditParser_Type(t *testing.T) {
	p := &RedditParser{}
	if p.Type() != "reddit" {
		t.Errorf("Type() = %q, want reddit", p.Type())
	}
}
