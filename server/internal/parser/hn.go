package parser

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"navi-core/internal/config"
)

type HNParser struct{}

func (p *HNParser) Type() string { return "hn" }

type hnItem struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	URL   string `json:"url"`
	Time  int64  `json:"time"`
}

func (p *HNParser) Fetch(cfg config.SourceConfig) ([]FeedItem, error) {
	maxItems := cfg.MaxItems
	if maxItems == 0 {
		maxItems = 15
	}

	baseURL := cfg.URL
	if baseURL == "" {
		baseURL = "https://hacker-news.firebaseio.com/v0"
	}

	resp, err := HTTPClient.Get(baseURL + "/topstories.json")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var ids []int
	if err := json.NewDecoder(resp.Body).Decode(&ids); err != nil {
		return nil, err
	}

	if len(ids) > maxItems {
		ids = ids[:maxItems]
	}

	items := make([]FeedItem, len(ids))
	var wg sync.WaitGroup
	sem := make(chan struct{}, 5)

	for i, id := range ids {
		wg.Add(1)
		go func(i, id int) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			r, err := HTTPClient.Get(fmt.Sprintf("%s/item/%d.json", baseURL, id))
			if err != nil {
				return
			}
			defer r.Body.Close()

			var item hnItem
			if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
				return
			}

			itemURL := item.URL
			if itemURL == "" {
				itemURL = fmt.Sprintf("https://news.ycombinator.com/item?id=%d", item.ID)
			}

			items[i] = FeedItem{
				Title:      item.Title,
				URL:        itemURL,
				Source:     "hn",
				SourceName: "Hacker News",
				Date:       time.Unix(item.Time, 0),
			}
		}(i, id)
	}

	wg.Wait()

	var result []FeedItem
	for _, item := range items {
		if item.Title != "" {
			result = append(result, item)
		}
	}

	return result, nil
}
