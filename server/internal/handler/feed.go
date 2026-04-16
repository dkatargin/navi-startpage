package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"navi-core/internal/cache"
	"navi-core/internal/parser"
)

type FeedHandler struct {
	cache     *cache.Cache
	startTime time.Time
}

func NewFeedHandler(c *cache.Cache) *FeedHandler {
	return &FeedHandler{
		cache:     c,
		startTime: time.Now(),
	}
}

type FeedResponse struct {
	Items      []parser.FeedItem `json:"items"`
	Categories []string          `json:"categories"`
	UpdatedAt  time.Time         `json:"updated_at"`
}

func (h *FeedHandler) GetFeed(c *gin.Context) {
	source := c.Query("source")
	category := c.Query("category")

	items := h.cache.Get(source, category)
	if items == nil {
		items = []parser.FeedItem{}
	}

	c.JSON(http.StatusOK, FeedResponse{
		Items:      items,
		Categories: h.cache.Categories(),
		UpdatedAt:  h.cache.UpdatedAt(),
	})
}

func (h *FeedHandler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":     "ok",
		"uptime":     time.Since(h.startTime).Round(time.Second).String(),
		"last_fetch": h.cache.UpdatedAt(),
	})
}
