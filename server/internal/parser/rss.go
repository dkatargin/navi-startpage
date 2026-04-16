package parser

import (
	"time"

	"github.com/mmcdole/gofeed"
	"navi-core/internal/config"
)

type RSSParser struct{}

func (p *RSSParser) Type() string { return "rss" }

func (p *RSSParser) Fetch(cfg config.SourceConfig) ([]FeedItem, error) {
	fp := gofeed.NewParser()
	feed, err := fp.ParseURL(cfg.URL)
	if err != nil {
		return nil, err
	}

	maxItems := cfg.MaxItems
	if maxItems == 0 {
		maxItems = 15
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
			Source:     "rss",
			SourceName: feed.Title,
			Date:       date,
			Preview:    Truncate(entry.Description, 200),
		})
	}

	return items, nil
}
