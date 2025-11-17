# ft_transcendence
42 Common Core - ft_transcendence

### Overview
[ft_transcendence](https://github.com/luis-prates/ft_transcendence) consists of creating a website with chat, ping-pong match making, profiles, leaderboard. Using the **TypeScript** language, **Vue3** was used for the frontend, **NestJS** for the backend, communication using **Sockets**, we used **Prisma** to communicate with the database, we used two **Rest APIs** for login with the school platform 42, and with Google Authentication , and all embedded in containers using **Docker**.
**Extras** were created, such as creating an RPG giving more dynamics and interaction, a store with skins, NPCs, playing against the bot, and more.

## Video (Sound ON)

https://github.com/RubenTeles/ft_transcendence/assets/75394884/df3cf962-d25f-49f4-9a7f-b85a39521d2b

## Project Features:

* Backend: NestJS
* Frontend: TypeScript framework of your choice
* Database: PostgreSQL
* Website: Single-page application with browser Back and Forward button functionality
* Browser Compatibility: Latest stable versions of Google Chrome and Edge
* Deployment: Launch via docker-compose up --build
* API: Rest API 42
Note: For Linux clusters, Docker rootless mode is required for security.

## Security Concerns
#### To ensure a fully functional and secure RPG experience, address the following security concerns:

* Passwords: Must be hashed before storage
* SQL Injections: Implement safeguards against SQL injections
* Server-Side Validation: Implement server-side validation for forms and user input
* Credentials: Store credentials, API keys, etc., locally in a .env file (ignored by Git)

## Extra: Virtual City, Economy, and Game System
#### Exploration, Economy, and Gameplay:

* Explore a virtual city and interact with the authentic 42 Lisboa
* Gain experience by engaging in various activities
* Introduce a virtual economy with currency creation
Customize your avatar with unique skins for paddle and Pong tables
Develop and evolve your own Pong game within 42 Lisboa
Challenge other players or Marvin (Bot) in strategic matches
Earn experience and money for victories and enter in LeaderBoard
Unlock exclusive skins for paddle and tables in shop

## Technologies Used:
* Docker
* Prisma
* Vue3
* NestJS
* TypeScript
* Socket.io
* REST
