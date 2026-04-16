package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"navi-core/internal/cache"
	"navi-core/internal/config"
	"navi-core/internal/handler"
	"navi-core/internal/parser"
	"navi-core/internal/scheduler"
)

func main() {
	configPath := flag.String("config", "config.yaml", "path to config file")
	flag.Parse()

	cfg, err := config.Load(*configPath)
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	parsers := map[string]parser.Parser{
		"rss":    &parser.RSSParser{},
		"hn":     &parser.HNParser{},
		"reddit": &parser.RedditParser{},
		"boosty": &parser.BoostyParser{},
		"sponsr": &parser.SponsprParser{},
	}

	c := cache.New()

	ctx, cancel := context.WithCancel(context.Background())
	sched := scheduler.New(parsers, cfg.FeedCategories, c, cfg.Server.FeedInterval)
	go sched.Start(ctx)

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(handler.CORSMiddleware())

	feedHandler := handler.NewFeedHandler(c)
	r.GET("/api/health", feedHandler.Health)

	api := r.Group("/api")
	api.Use(handler.AuthMiddleware(cfg.Server.APISecret))
	api.GET("/feed", feedHandler.GetFeed)

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", cfg.Server.Port),
		Handler: r,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	log.Printf("NAVI-Core started on port %d", cfg.Server.Port)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutting down...")
	cancel()

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("server shutdown error: %v", err)
	}

	log.Println("NAVI-Core stopped")
}
