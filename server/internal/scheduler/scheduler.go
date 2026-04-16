package scheduler

import (
	"context"
	"log"
	"sort"
	"sync"
	"time"

	"navi-core/internal/cache"
	"navi-core/internal/config"
	"navi-core/internal/parser"
)

type Scheduler struct {
	parsers    map[string]parser.Parser
	categories []config.CategoryConfig
	cache      *cache.Cache
	interval   time.Duration
}

func New(parsers map[string]parser.Parser, categories []config.CategoryConfig, c *cache.Cache, interval time.Duration) *Scheduler {
	return &Scheduler{
		parsers:    parsers,
		categories: categories,
		cache:      c,
		interval:   interval,
	}
}

func (s *Scheduler) Start(ctx context.Context) {
	s.fetchAll()

	ticker := time.NewTicker(s.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			s.fetchAll()
		}
	}
}

func (s *Scheduler) fetchAll() {
	var mu sync.Mutex
	var wg sync.WaitGroup
	var allItems []parser.FeedItem
	var categoryNames []string

	for _, cat := range s.categories {
		categoryNames = append(categoryNames, cat.Name)
		for _, src := range cat.Sources {
			p, ok := s.parsers[src.Type]
			if !ok {
				log.Printf("unknown parser type: %s", src.Type)
				continue
			}

			wg.Add(1)
			go func(p parser.Parser, src config.SourceConfig, category string) {
				defer wg.Done()

				items, err := p.Fetch(src)
				if err != nil {
					log.Printf("error fetching %s: %v", src.Type, err)
					return
				}

				for i := range items {
					items[i].Category = category
				}

				mu.Lock()
				allItems = append(allItems, items...)
				mu.Unlock()
			}(p, src, cat.Name)
		}
	}

	wg.Wait()

	sort.Slice(allItems, func(i, j int) bool {
		return allItems[i].Date.After(allItems[j].Date)
	})

	s.cache.Set(allItems, categoryNames)
	log.Printf("fetched %d items across %d categories", len(allItems), len(categoryNames))
}
