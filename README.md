Mini Project Management System

A full-stack project management tool built with Laravel 12 (API) and Vue 3 + Vite (Frontend).

Tech Stack

Backend  :Laravel, Sanctum (Auth)
Frontend: Vue 3, Vite, Vue Router, Axios, Bootstrap 5

 Features

-  User Auth (Sanctum)
-  Project & Task CRUD
-  Task assignment
-  Invite users via email
-  Comments on tasks
-  Filter/sort tasks
-  Authorization with Laravel Policies

 Setup

Backend

composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve

frontend

https://github.com/muhammed-jishad/vuejsmachine.git

npm install
npm run dev

version

"php": "^8.2",
"laravel/framework": "^12.13",
"vue": "^3.5.13",
"axios": "^1.9.0"
