package parser

import (
	"fmt"
	"time"

	"github.com/mmcdole/gofeed"
	"navi-core/internal/config"
)

type RedditParser struct{}

func (p *RedditParser) Type() string { return "reddit" }

func (p *RedditParser) Fetch(cfg config.SourceConfig) ([]FeedItem, error) {
	maxItems := cfg.MaxItems
	if maxItems == 0 {
		maxItems = 15
	}

	baseURL := cfg.URL
	if baseURL == "" {
		baseURL = "https://www.reddit.com"
	}

	url := fmt.Sprintf("%s/r/%s/.rss", baseURL, cfg.Subreddit)

	fp := gofeed.NewParser()
	feed, err := fp.ParseURL(url)
	if err != nil {
		return nil, err
	}

	var items []FeedItem
	for i, entry := range feed.Items {
		if i >= maxItems {
			break
		}

		var date time.Time
		if entry.PublishedParsed != nil {
			date = *entry.PublishedParsed
		} else if entry.UpdatedParsed != nil {
			date = *entry.UpdatedParsed
		}

		items = append(items, FeedItem{
			Title:      entry.Title,
			URL:        entry.Link,
			Source:     "reddit",
			SourceName: "r/" + cfg.Subreddit,
			Date:       date,
			Preview:    Truncate(entry.Content, 200),
		})
	}

	return items, nil
}
