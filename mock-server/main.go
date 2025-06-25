package main

import (
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
)

const (
	defaultAddr = ":9000"
)

var listenAddr = getEnv("WS_ADDR", defaultAddr)

func getEnv(key, fallback string) string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	return val
}

func main() {
	webSocketHandler := webSocketHandler{
		r:        rand.New(rand.NewSource(time.Now().UnixNano())),
		upgrader: websocket.Upgrader{},
	}

	http.Handle("/", webSocketHandler)
	http.HandleFunc("/health", healthCheckHandler)

	log.Printf("WebSocket server listening on %s\n", listenAddr)
	log.Fatal(http.ListenAndServe(listenAddr, nil))
}
