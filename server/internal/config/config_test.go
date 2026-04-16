package config

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestLoad(t *testing.T) {
	yaml := `
server:
  port: 9090
  api_secret: "test-secret"
  feed_interval: 5m

feed_categories:
  - name: NEWS
    sources:
      - type: rss
        url: https://example.com/feed.xml
        max_items: 10
      - type: hn
        max_items: 20
  - name: REDDIT
    sources:
      - type: reddit
        subreddit: golang
`
	path := filepath.Join(t.TempDir(), "config.yaml")
	if err := os.WriteFile(path, []byte(yaml), 0644); err != nil {
		t.Fatal(err)
	}

	cfg, err := Load(path)
	if err != nil {
		t.Fatalf("Load failed: %v", err)
	}

	if cfg.Server.Port != 9090 {
		t.Errorf("port = %d, want 9090", cfg.Server.Port)
	}
	if cfg.Server.APISecret != "test-secret" {
		t.Errorf("api_secret = %q, want test-secret", cfg.Server.APISecret)
	}
	if cfg.Server.FeedInterval != 5*time.Minute {
		t.Errorf("feed_interval = %v, want 5m", cfg.Server.FeedInterval)
	}
	if len(cfg.FeedCategories) != 2 {
		t.Fatalf("categories = %d, want 2", len(cfg.FeedCategories))
	}
	if cfg.FeedCategories[0].Name != "NEWS" {
		t.Errorf("category[0].name = %q, want NEWS", cfg.FeedCategories[0].Name)
	}
	if len(cfg.FeedCategories[0].Sources) != 2 {
		t.Fatalf("category[0].sources = %d, want 2", len(cfg.FeedCategories[0].Sources))
	}
	if cfg.FeedCategories[0].Sources[0].URL != "https://example.com/feed.xml" {
		t.Errorf("source url = %q", cfg.FeedCategories[0].Sources[0].URL)
	}
}

func TestLoadMissingSecret(t *testing.T) {
	yaml := `
server: {}
feed_categories:
  - name: TEST
    sources:
      - type: rss
        url: https://example.com/feed.xml
`
	path := filepath.Join(t.TempDir(), "config.yaml")
	if err := os.WriteFile(path, []byte(yaml), 0644); err != nil {
		t.Fatal(err)
	}

	_, err := Load(path)
	if err == nil {
		t.Fatal("expected error for missing api_secret")
	}
}

func TestLoadDefaults(t *testing.T) {
	yaml := `
server:
  api_secret: "test"
feed_categories:
  - name: TEST
    sources:
      - type: rss
        url: https://example.com/feed.xml
`
	path := filepath.Join(t.TempDir(), "config.yaml")
	if err := os.WriteFile(path, []byte(yaml), 0644); err != nil {
		t.Fatal(err)
	}

	cfg, err := Load(path)
	if err != nil {
		t.Fatalf("Load failed: %v", err)
	}

	if cfg.Server.Port != 8080 {
		t.Errorf("default port = %d, want 8080", cfg.Server.Port)
	}
	if cfg.Server.FeedInterval != 10*time.Minute {
		t.Errorf("default interval = %v, want 10m", cfg.Server.FeedInterval)
	}
	if cfg.FeedCategories[0].Sources[0].MaxItems != 15 {
		t.Errorf("default max_items = %d, want 15", cfg.FeedCategories[0].Sources[0].MaxItems)
	}
}
