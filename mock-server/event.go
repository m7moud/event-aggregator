package main

import (
	"fmt"
	"math/rand"
	"time"
)

type Event struct {
	Time     string         `json:"time"`
	Duration float64        `json:"duration"`
	Data     map[string]any `json:"data"`
}

var serialNumbers = []string{
	"a86df671-f3e8-4d01-9ea4-bf3e34b55724",
	"b72e1f52-c123-4cba-9880-8767da90a9b9",
	"c34f5671-3a7e-4d05-bf20-9d2b3e9ef123",
}

func randomEvent(r *rand.Rand) Event {
	serial := serialNumbers[r.Intn(len(serialNumbers))]
	return Event{
		Time:     time.Now().Format(time.RFC3339),
		Duration: 0,
		Data: map[string]any{
			"serialno":    serial,
			"temperature": randomTemperature(r),
		},
	}
}

func randomTemperature(r *rand.Rand) string {
	return fmt.Sprintf("%1.2f", 15+r.Float64()*10)
}
