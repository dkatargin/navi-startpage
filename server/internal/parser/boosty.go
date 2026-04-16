package parser

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/PuerkitoBio/goquery"
	"navi-core/internal/config"
)

type BoostyParser struct{}

func (p *BoostyParser) Type() string { return "boosty" }

type boostyInitialState struct {
	Posts struct {
		PostsList struct {
			Data struct {
				Posts []struct {
					ID          string `json:"id"`
					IntID       int    `json:"intId"`
					Title       string `json:"title"`
					PublishTime int64  `json:"publishTime"`
				} `json:"posts"`
				BlogURL string `json:"blogUrl"`
			} `json:"data"`
		} `json:"postsList"`
	} `json:"posts"`
}

func (p *BoostyParser) Fetch(cfg config.SourceConfig) ([]FeedItem, error) {
	maxItems := cfg.MaxItems
	if maxItems == 0 {
		maxItems = 15
	}

	baseURL := cfg.URL
	if baseURL == "" {
		baseURL = "https://boosty.to"
	}

	url := fmt.Sprintf("%s/%s", baseURL, cfg.Creator)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	if cfg.Cookie != "" {
		req.Header.Set("Cookie", cfg.Cookie)
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")

	resp, err := HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	scriptContent := doc.Find("script#initial-state").Text()
	if scriptContent == "" {
		return nil, fmt.Errorf("boosty: initial-state not found")
	}

	var state boostyInitialState
	if err := json.Unmarshal([]byte(scriptContent), &state); err != nil {
		return nil, fmt.Errorf("boosty: failed to parse initial-state: %w", err)
	}

	posts := state.Posts.PostsList.Data.Posts
	blogURL := state.Posts.PostsList.Data.BlogURL
	if blogURL == "" {
		blogURL = cfg.Creator
	}

	var items []FeedItem
	for i, post := range posts {
		if i >= maxItems {
			break
		}

		postURL := fmt.Sprintf("https://boosty.to/%s/posts/%s", blogURL, post.ID)

		items = append(items, FeedItem{
			Title:      post.Title,
			URL:        postURL,
			Source:     "boosty",
			SourceName: cfg.Creator,
			Date:       time.Unix(post.PublishTime, 0),
		})
	}

	return items, nil
}
