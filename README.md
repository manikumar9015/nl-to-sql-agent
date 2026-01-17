# How to Start and Stop the Application

It's essential to have a clear and simple guide for starting and stopping your work.

## How to Stop Everything

You can do this in any order.

### Stop the Frontend Server
1. Go to the terminal running your React app (the one in the `frontend` folder).
2. Press `Ctrl + C`.

### Stop the Backend Server
1. Go to the terminal running your Node.js app (the one in the `backend` folder).
2. Press `Ctrl + C`.

### Stop the Database Containers
1. Go to a terminal and navigate to your `deploy` folder.
2. Run the following command:
   ```bash
   docker-compose down
   ```
   *(This command safely stops and removes the containers. Your data is safe because we use Docker volumes).*

---

## How to Start Everything

The order is important here: **Databases → Backend → Frontend**.

### 1. (Terminal 1) Start the Databases
1. Navigate to your `deploy` folder.
2. Run the following command to start PostgreSQL and MongoDB in the background:
   ```bash
   docker-compose up -d
   ```
   *(The `-d` means "detached", so it won't lock up your terminal).*

### 2. (Terminal 2) Start the Backend Server
1. Navigate to your `backend` folder.
2. Run the development script:
   ```bash
   npm run dev
   ```
3. Wait until you see the success messages `✅ Connected to PostgreSQL successfully...` and `✅ Connected to MongoDB successfully` before moving to the next step.

### 3. (Terminal 3) Start the Frontend Application
1. Navigate to your `frontend` folder.
2. Run the development script:
   ```bash
   npm run dev
   ```
3. Your browser should open to `http://localhost:5173`, where you'll see the login screen.

---

## Quick Reference Summary

You can save this as a quick reminder.

### To Stop:
- **Frontend Terminal:** `Ctrl + C`
- **Backend Terminal:** `Ctrl + C`
- **deploy Folder Terminal:** `docker-compose down`

### To Start:
1. **deploy Folder Terminal:** `docker-compose up -d`
2. **backend Folder Terminal:** `npm run dev` *(wait for DB connections)*
3. **frontend Folder Terminal:** `npm run dev`
