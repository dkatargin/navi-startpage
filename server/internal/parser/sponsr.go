package parser

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/PuerkitoBio/goquery"
	"navi-core/internal/config"
)

type SponsprParser struct{}

func (p *SponsprParser) Type() string { return "sponsr" }

type sponsrNextData struct {
	Props struct {
		PageProps struct {
			Posts struct {
				List []struct {
					ID    int    `json:"id"`
					Title string `json:"title"`
					Date  string `json:"date"`
				} `json:"list"`
			} `json:"posts"`
			Project struct {
				ProjectURL string `json:"project_url"`
			} `json:"project"`
		} `json:"pageProps"`
	} `json:"props"`
}

func (p *SponsprParser) Fetch(cfg config.SourceConfig) ([]FeedItem, error) {
	maxItems := cfg.MaxItems
	if maxItems == 0 {
		maxItems = 15
	}

	baseURL := cfg.URL
	if baseURL == "" {
		baseURL = "https://sponsr.ru"
	}

	url := fmt.Sprintf("%s/%s/", baseURL, cfg.Creator)

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

	scriptContent := doc.Find("script#__NEXT_DATA__").Text()
	if scriptContent == "" {
		return nil, fmt.Errorf("sponsr: __NEXT_DATA__ not found")
	}

	var nextData sponsrNextData
	if err := json.Unmarshal([]byte(scriptContent), &nextData); err != nil {
		return nil, fmt.Errorf("sponsr: failed to parse __NEXT_DATA__: %w", err)
	}

	projectURL := nextData.Props.PageProps.Project.ProjectURL
	posts := nextData.Props.PageProps.Posts.List

	var items []FeedItem
	for i, post := range posts {
		if i >= maxItems {
			break
		}

		var date time.Time
		if post.Date != "" {
			date, _ = time.Parse(time.RFC3339, post.Date)
		}

		postURL := fmt.Sprintf("https://sponsr.ru/%s/%d/", projectURL, post.ID)

		items = append(items, FeedItem{
			Title:      post.Title,
			URL:        postURL,
			Source:     "sponsr",
			SourceName: cfg.Creator,
			Date:       date,
		})
	}

	return items, nil
}
