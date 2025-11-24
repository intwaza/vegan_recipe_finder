# Vegan Recipe Finder

A simple web application that helps users discover vegan recipes. You can search, filter, and sort recipes to quickly find what you need.

## Purpose

This app helps users:

- Find different vegan recipes
- Search by name or ingredient
- Filter by difficulty level
- Sort results alphabetically or by difficulty
- Explore meal ideas easily

## Features

- Search bar for quick recipe searches
- Load All Recipes button
- Filter by difficulty level
- Sort by relevance, title, or difficulty
- Clear error messages
- Responsive design for all devices

## Requirements

- Modern browser
- RapidAPI account with access to The Vegan Recipes DB API
- Basic web server for hosting

## Local Setup

### Step 1: Get API Key

1. Sign up on RapidAPI
2. Open The Vegan Recipes DB API page
3. Subscribe to the free tier
4. Copy your API key from your RapidAPI dashboard

### Step 2: Configure the App

```bash
cp config.js.example config.js
```

Open `config.js` and add your API key.

### Step 3: Run Locally

**Using Python:**

```bash
python3 -m http.server 8000
```

**Using Node:**

```bash
npm install -g http-server
http-server -p 8000
```

**Visit:**

```
http://localhost:8000
```

## How to Use

1. Search for a recipe using the search bar
2. Load all recipes
3. Filter by difficulty
4. Sort recipes
5. View recipe cards

## Deployment

You will deploy to Web01 and Web02, then configure Lb01 to balance traffic.

### Step 1: Upload to Web01

```bash
ssh username@web01
cd /var/www/html
sudo mkdir recipe-finder
cd recipe-finder
```

**Upload files:**

```bash
scp index.html styles.css app.js config.js.example username@web01:/var/www/html/recipe-finder/
```

Create `config.js` manually and add your API key.

**Set permissions:**

```bash
sudo chown -R www-data:www-data recipe-finder
sudo chmod -R 755 recipe-finder
```

Test the app in the browser.

### Step 2: Upload to Web02

Repeat the same steps as Web01.

### Step 3: Configure Load Balancer (Nginx Example)

```nginx
upstream recipe_backend {
    server web01-address:80;
    server web02-address:80;
}

server {
    listen 80;
    location / {
        proxy_pass http://recipe_backend;
    }
}
```

**Test and reload:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Test Load Balancer

1. Open the app using the load balancer IP
2. Confirm both servers receive requests
3. Test failover by stopping one server temporarily

## Security Notes

- Never upload your API key
- Use HTTPS for production
- Monitor API rate limits

## API Information

The app uses The Vegan Recipes DB API through RapidAPI.

It returns recipe titles, images, and difficulty levels.

## Technologies Used

- HTML
- CSS
- JavaScript
- RapidAPI
- Fetch API

## Challenges Faced

- Rate limits solved by fetching once
- Missing images solved by adding placeholders
- No search parameter solved by local filtering
- Deployment solved by identical setup on both servers

## Demo Video

[video link](https://youtu.be/0iJtqIyfW6A)

## Author

Belyse Intwaza

## Credits

- The Vegan Recipes DB API
- RapidAPI
