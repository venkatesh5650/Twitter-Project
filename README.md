Twitter Clone API

A Node.js + Express + SQLite project that replicates core features of Twitter like user authentication, following, tweeting, liking, and replying. The backend is powered by RESTful APIs and JWT-based authentication.

🚀 Features Implemented
👤 User Management

Register User with validations (unique username, strong password).

Login User with JWT token authentication.

🔐 Authentication

JWT Token validation middleware for secure API access.

Invalid/missing tokens return 401 Invalid JWT Token.

📰 Tweet Feed

Get the latest 4 tweets from people a user follows.

View followers and following lists.

🗨️ Tweet Interactions

View details of tweets (likes, replies, date-time).

Get the list of users who liked a tweet.

Get the list of replies on a tweet.

Restrict access — users can only view tweets of people they follow.

📝 User Tweets

Get all tweets of the logged-in user along with likes & replies count.

Create new tweets.

Delete own tweets only (secure).

🛠️ Tech Stack

Backend: Node.js, Express.js

Database: SQLite (twitterClone.db)

Authentication: JWT (JSON Web Token)

Other Tools: bcrypt (for password hashing), sqlite (for DB queries)

📂 Database Schema
user

| user_id | name | username | password | gender |

follower

| follower_id | follower_user_id | following_user_id |

tweet

| tweet_id | tweet | user_id | date_time |

reply

| reply_id | tweet_id | reply | user_id | date_time |

like

| like_id | tweet_id | user_id | date_time |

📌 API Documentation
Method	Endpoint	Description	Auth Required
POST	/register/	Register a new user	❌
POST	/login/	Login & get JWT token	❌
GET	/user/tweets/feed/	Get latest 4 tweets from people user follows	✅
GET	/user/following/	Get list of people the user is following	✅
GET	/user/followers/	Get list of people following the user	✅
GET	/tweets/:tweetId/	Get details of a tweet (likes, replies, date-time) if following	✅
GET	/tweets/:tweetId/likes/	Get list of users who liked a tweet (if following)	✅
GET	/tweets/:tweetId/replies/	Get list of replies on a tweet (if following)	✅
GET	/user/tweets/	Get all tweets of logged-in user	✅
POST	/user/tweets/	Create a new tweet	✅
DELETE	/tweets/:tweetId/	Delete own tweet only	✅
▶️ How to Run

Clone the repository:

git clone https://github.com/your-username/twitter-clone.git
cd twitter-clone


Install dependencies:

npm install


Start the server:

node app.js


Use tools like Postman / Thunder Client to test APIs.

🔐 Sample Credentials
{
  "username": "JoeBiden",
  "password": "biden@123"
}

🎯 What I Learned

Designing REST APIs for real-world apps.

Implementing JWT authentication middleware.

SQL queries for joins, counts, and nested conditions.

Secure user operations (e.g., cannot delete others’ tweets).

📌 Note for Recruiters / HR

This project demonstrates my ability to:
✔ Build secure, scalable backend APIs.
✔ Work with databases (SQLite) and schema design.
✔ Implement authentication & authorization using JWT.
✔ Apply real-world Twitter-like features in a structured project.
