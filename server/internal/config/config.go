package config

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server         ServerConfig     `yaml:"server"`
	FeedCategories []CategoryConfig `yaml:"feed_categories"`
}

type ServerConfig struct {
	Port         int           `yaml:"port"`
	APISecret    string        `yaml:"api_secret"`
	FeedInterval time.Duration `yaml:"feed_interval"`
}

type CategoryConfig struct {
	Name    string         `yaml:"name"`
	Sources []SourceConfig `yaml:"sources"`
}

type SourceConfig struct {
	Type      string `yaml:"type"`
	URL       string `yaml:"url"`
	Subreddit string `yaml:"subreddit"`
	Creator   string `yaml:"creator"`
	Cookie    string `yaml:"cookie"`
	MaxItems  int    `yaml:"max_items"`
}

func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}

	if cfg.Server.APISecret == "" {
		return nil, fmt.Errorf("server.api_secret must not be empty")
	}

	if cfg.Server.Port == 0 {
		cfg.Server.Port = 8080
	}
	if cfg.Server.FeedInterval == 0 {
		cfg.Server.FeedInterval = 10 * time.Minute
	}

	for i := range cfg.FeedCategories {
		for j := range cfg.FeedCategories[i].Sources {
			if cfg.FeedCategories[i].Sources[j].MaxItems == 0 {
				cfg.FeedCategories[i].Sources[j].MaxItems = 15
			}
		}
	}

	return &cfg, nil
}
