Here is your **full `README.md`** file tailored to your project structure, architecture, and technologies — including MongoDB for the comment service and AI assistant capabilities:

---

````md
# 🏨 Hotel Booking & AI Assistant Platform

A modern full-stack hotel booking system with user reviews, admin control, and an AI-powered chat assistant. Built on microservices architecture and enhanced with Redis, RabbitMQ, and LLM-based conversation flow.

---

## 🚀 Project Overview

- 🔍 Hotel search and booking with role-based access
- ✍️ User reviews with star ratings
- 🧑‍💼 Admin panel for room management
- ⚡ Redis for caching and availability
- 📬 Real-time notifications via RabbitMQ
- 🤖 AI assistant for natural language queries
- 🧱 Microservice-based backend
- 🖼️ Modern UI built with React + TypeScript
- 🔐 JWT authentication and authorization

---

## 🧱 Microservices Architecture

| Service            | Description                                       |
|--------------------|---------------------------------------------------|
| `hotel-admin`      | Admin room CRUD (PostgreSQL)                      |
| `hotel-user`       | Booking, hotel info, auth                         |
| `hotel-search`     | Hotel search via Redis                            |
| `booking-service`  | Handles bookings and room capacity                |
| `notification`     | Publishes booking notifications to admins         |
| `ai-agent`         | Chat assistant powered by LLM                     |
| `comment-service`  | ⭐ Hotel reviews & comments (MongoDB)              |
| `api-gateway`      | Routes frontend calls to services                 |
| `Redis`            | Caching, pub/sub for hotel data                   |
| `RabbitMQ`         | Event broker for notification service             |
| `PostgreSQL`       | Main relational database                          |
| `MongoDB`          | Document DB for flexible comment storage          |

---

## 🖥️ Frontend Features

- **Welcome Page**  
  → Search hotels & read reviews without login

- **Hotel Detail Page**  
  → View availability, leave comments, and make bookings (auth required)

- **Admin Panel**  
  → Add/edit/delete rooms with real-time notification feed

- **Review System**  
  → Star ratings and scrollable comment history

- **AI Assistant Chat UI**  
  → Smart chatbot to guide user interactions (LLM-based)

---

## 🤖 AI Assistant Flow

LLM-based `ai-agent` supports:

1. **Intent Detection**  
   > “I want a hotel in Izmir” → `search_hotel`

2. **Parameter Extraction**  
   > Dates, guest count, room ID, etc.

3. **Routing & Execution**  
   > API call via gateway to target microservice

4. **Response Generation**  
   > Conversational replies with contextual booking info

### 🧠 Example

```txt
User: Book a hotel in Istanbul for 2 guests between August 10–12.
AI: ✅ Found 3 hotels. Lord Hotel: $300 total. Want to proceed with booking?
````

---

## 🔐 Authentication

* JWT-based access with `Authorization: Bearer <token>`
* Login returns a token; stored in browser `localStorage`
* Role-based permissions:

  * `admin`: Room management
  * `user`: Bookings & comments

---

## 🐳 Docker Compose Setup

The entire platform can be run locally using Docker Compose.

### ✅ Startup

```bash
docker-compose up --build
```

### 📦 Included Containers

* `api-gateway`: Reverse proxy to route requests
* `hotel-admin`: Admin operations
* `hotel-user`: Auth, hotel details, reservations
* `hotel-search`: Availability via Redis
* `booking-service`: Capacity management and booking
* `notification`: Pushes booking alerts to admin
* `comment-service`: ⭐ Handles hotel comments via MongoDB
* `ai-agent`: FastAPI-based LLM interface
* `postgres`: Stores users, rooms, bookings
* `redis`: Hotel caching and pub/sub
* `rabbitmq`: Messaging between services
* `mongo`: Document DB for comment storage

---

## 🧪 Example Scenarios

### ✅ Hotel Search

```txt
User: Find a hotel in Izmir for 2 guests from August 10 to 12.
AI: Found 2 options: Lord Hotel - $300, Bella Hotel - $270. Want to book?
```

### ✅ Booking

```txt
User: Book room 1 from August 10 to 12 for 2 people.
AI: Your booking has been confirmed for $300.
```

### ❌ Missing Info

```txt
User: I want to book a room
AI: Missing required fields: start_date, end_date, guest_count
```

### ❌ Availability Error

```txt
User: Book room 3 from August 21 to 22
AI: Sorry, no availability for room 3 on 2025-08-21.
```

---

## 📁 Environment Variables

Ensure the `.env` files are configured.

---

## 📚 Tech Stack

* **Frontend**: React, TypeScript, CSS Modules
* **Backend**: FastAPI, PostgreSQL, Redis, MongoDB
* **Messaging**: RabbitMQ
* **LLM**: OpenAI GPT-3.5
* **Infrastructure**: Docker Compose

---

## 🧠 Contributors & Ideas

* AI Assistant
* Search optimization with Redis caching
* Chat-driven booking workflows
* Modular & scalable service separation

---

