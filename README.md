# BusEase
Bus ticket reservation system with seat locking and payment simulation
BusEase – Bus Ticket Reservation System

BusEase is a full-stack bus ticket booking system built using Spring Boot and React. It simulates real-world booking platforms with features like seat selection, payment flow, and booking management.

Features

User

Register and login using JWT authentication
Search buses by source, destination, and date
Select and lock seats
Simulated payment (success and failure)
Ticket generation after booking
View booking history

Admin

Manage buses, routes, and schedules
Role-based access control
Tech Stack

Backend

Java, Spring Boot
Spring Security with JWT
MySQL
Redis for seat locking
WebSockets

Frontend

React (Vite)
Axios
CSS and Tailwind
Architecture

Modular monolith with separate modules for auth, bus, route, schedule, booking, payment, redis, and websocket.

Booking Flow
User searches buses
Selects seat
Seat is locked in Redis
Payment is processed
On success, booking is confirmed
On failure, booking is not created