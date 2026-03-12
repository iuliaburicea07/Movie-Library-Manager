# Movie Library Manager

Movie Library Manager is a web app for browsing, searching, and keeping track of your favorite movies and TV shows. Built with Next.js and React, it uses data from The Movie Database (TMDB).

## Features

- Search and browse movies and TV shows
- Add items to your watched list or blacklist
- Rate what you've seen
- See details, ratings, and overviews for each title
- Fast and responsive interface

## How it works

The app uses a serverless API route to securely fetch data from TMDB. You can search, filter, and manage your personal lists. All your data is stored locally in your browser.

## API Proxy

The `/api/tmdb` route forwards requests to the TMDB API and handles authentication. You can use it to fetch trending, discover, or search results from TMDB.