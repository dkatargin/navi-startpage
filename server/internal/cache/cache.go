package cache

import (
	"sort"
	"strings"
	"sync"
	"time"

	"navi-core/internal/parser"
)

type Cache struct {
	mu         sync.RWMutex
	items      []parser.FeedItem
	categories []string
	updatedAt  time.Time
}

func New() *Cache {
	return &Cache{}
}

func (c *Cache) Set(items []parser.FeedItem, categories []string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items = items
	c.categories = categories
	c.updatedAt = time.Now()
}

func (c *Cache) Get(source, category string) []parser.FeedItem {
	c.mu.RLock()
	defer c.mu.RUnlock()

	sources := splitFilter(source)
	categories := splitFilter(category)

	var result []parser.FeedItem
	for _, item := range c.items {
		if len(sources) > 0 && !contains(sources, item.Source) {
			continue
		}
		if len(categories) > 0 && !contains(categories, item.Category) {
			continue
		}
		result = append(result, item)
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Date.After(result[j].Date)
	})

	return result
}

func (c *Cache) Categories() []string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	result := make([]string, len(c.categories))
	copy(result, c.categories)
	return result
}

func (c *Cache) UpdatedAt() time.Time {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.updatedAt
}

func splitFilter(s string) []string {
	if s == "" {
		return nil
	}
	return strings.Split(s, ",")
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
