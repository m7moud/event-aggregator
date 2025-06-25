package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

const (
	eventInterval = 1 * time.Second
)

type webSocketHandler struct {
	r        *rand.Rand
	upgrader websocket.Upgrader
}

func (wsh webSocketHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := wsh.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade failed:", err)
		return
	}

	log.Println("Client connected:", conn.RemoteAddr())

	defer func() {
		conn.Close()
		log.Println("Client disconnected:", conn.RemoteAddr())
	}()

	done := make(chan struct{})
	go func() {
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				log.Println("Read error (client disconnected):", err)
				defer close(done)
				return
			}
		}
	}()

	ticker := time.NewTicker(eventInterval)
	defer ticker.Stop()

	for {
		select {
		case <-done:
			log.Println("Client disconnected, stopping event sends.")
			return
		case t := <-ticker.C:
			event := randomEvent(wsh.r)
			msg, err := json.Marshal(event)
			if err != nil {
				log.Println("JSON marshal error:", err)
				continue
			}
			if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				log.Printf("Write failed: %v", err)
				return
			}

			log.Printf("Sent event to %s at %s\n", conn.RemoteAddr(), t.Format(time.RFC3339))
		}
	}
}
