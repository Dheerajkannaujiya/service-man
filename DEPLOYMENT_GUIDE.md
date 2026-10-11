# 🚀 ServiceMan Deployment & Cloud Portals Guide

This document provides a step-by-step walkthrough to safely push your **ServiceMan** project to GitHub without leaking sensitive credentials, and deploy both the **Client (Frontend)** and **Server (Backend)** to production cloud platforms for free.

---

## 📋 Overview of Deployment Architecture

```
                  ┌────────────────────────────────────────────────────────┐
                  │                      GitHub Repo                       │
                  │   (Safe: .env & node_modules protected by .gitignore)  │
                  └───────────┬────────────────────────────────┬───────────┘
                              │                                │
                              ▼                                ▼
                 ┌───────────────────────────┐    ┌──────────────────────────┐
                 │       Frontend Host       │    │       Backend Host       │
                 │     (Vercel / Netlify)    │    │    (Render / Railway)    │
                 │   Root Directory: client  │    │  Root Directory: server  │
                 └─────────────┬─────────────┘    └────────────┬─────────────┘
                               │                               │
                               │  VITE_API_URL / WebSockets    │
                               └───────────────────────────────┼─────────────────────────┐
                                                               │                         │
                                                               ▼                         ▼
                                                  ┌─────────────────────────┐ ┌─────────────────────┐
                                                  │      Cloud Database     │ │  Payment & Services │
                                                  │     (MongoDB Atlas)     │ │     (Razorpay)      │
                                                  └─────────────────────────┘ └─────────────────────┘
```

---

## 🔒 Part 1: Safe GitHub Upload (Zero Leaks Guaranteed)

The project includes pre-configured `.gitignore` files at the root, inside `client/`, and inside `server/`.
Your actual `.env` files, `node_modules`, and uploaded files are automatically ignored.

### Step 1: Verify Ignored Files Before Staging
Open your terminal at the project root (`final year project`) and run:
```bash
# Check git status
git status
```
> Notice that `server/.env` and `client/.env` will **NOT** appear in the untracked files list. Only `.env.example` templates will be committed.

### Step 2: Commit and Push to GitHub
```bash
# 1. Stage all safe project files
git add .

# 2. Commit the changes
git commit -m "feat: complete fullstack ServiceMan platform with deployment configurations"

# 3. Rename branch to main (if not already main)
git branch -M main

# 4. Link your remote GitHub repository (replace with your GitHub repository URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 5. Push code to GitHub
git push -u origin main
```

---

## 🌐 Part 2: Required Cloud Portals & API Keys

Here is the exact list of portals to visit, which keys to obtain, and whether they are required:

| Portal & Service | Website URL | What You Need From It | Status | Cost |
| :--- | :--- | :--- | :--- | :--- |
| **MongoDB Atlas** | [cloud.mongodb.com](https://cloud.mongodb.com) | Connection String (`MONGODB_URI`) | **REQUIRED** | Free Tier (M0 Sandbox) |
| **Render** | [render.com](https://render.com) | Backend Hosting Web Service | **REQUIRED** (Backend) | Free Tier |
| **Vercel** | [vercel.com](https://vercel.com) | Frontend Hosting Static/SPA | **REQUIRED** (Frontend) | Free Tier |
| **Razorpay** | [dashboard.razorpay.com](https://dashboard.razorpay.com) | Test Key ID & Key Secret | **OPTIONAL** (Mock fallback included) | Free Test Mode |
| **Google Cloud** | [console.cloud.google.com](https://console.cloud.google.com) | Google Maps API Key | **OPTIONAL** (Leaflet OpenStreetMap built-in) | $200 Free Monthly Credit |
| **AWS S3** | [aws.amazon.com](https://aws.amazon.com) | Access Key, Secret Key, Bucket Name | **OPTIONAL** (Local filesystem storage built-in) | Free Tier (5 GB) |
| **Firebase** | [console.firebase.google.com](https://console.firebase.google.com) | FCM Web Push Credentials | **OPTIONAL** (In-app real-time alerts built-in) | Free Tier (Spark Plan) |

---

## 🗄️ Part 3: Database Setup (MongoDB Atlas)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign in/register.
2. Click **Build a Database** and select **M0 Free (Shared Cluster)**.
3. Choose your closest region (e.g., `AWS / ap-south-1 (Mumbai)`).
4. Under **Security Quickstart**:
   - Create a Database User (e.g. Username: `serviceman_admin`, Password: `YourStrongPassword123!`). **Save this password!**
5. Under **Network Access**:
   - Click **Add IP Address** → Choose **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**. *(Crucial so Render/Railway servers can connect without IP blocks)*.
6. Click **Connect** → Choose **Drivers** (Node.js):
   - Copy your connection string:
     ```text
     mongodb+srv://serviceman_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<password>` with your actual database user password.
   - Add the database name `/serviceman` before the `?` query string:
     ```text
     mongodb+srv://serviceman_admin:YourStrongPassword123!@cluster0.xxxxx.mongodb.net/serviceman?retryWrites=true&w=majority
     ```
   This is your **`MONGODB_URI`**.

---

## 🖥️ Part 4: Backend Deployment (Render.com)

1. Sign up/log in at [https://render.com](https://render.com) using your GitHub account.
2. In the dashboard, click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** → Connect your `final year project` repository.
4. Configure the settings:
   - **Name**: `serviceman-backend` (or your preferred name)
   - **Region**: Choose closest to India/MongoDB Atlas (e.g., `Singapore` or `Frankfurt`)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Scroll down to **Environment Variables** and click **Add Environment Variable** for each:

| Environment Variable | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `10000` | Port used by Render (or leave Render auto-assign) |
| `MONGODB_URI` | `mongodb+srv://...` | Your Atlas connection string from Part 3 |
| `JWT_SECRET` | `a_super_secret_random_string_min_32_chars_1234567` | Secret for user authentication tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `JWT_REFRESH_SECRET` | `another_super_secret_random_string_987654321` | Secret for refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Refresh token duration |
| `CLIENT_URL` | `*` (or your Vercel URL once created) | Allows CORS communication from frontend |
| `RAZORPAY_KEY_ID` | `rzp_test_serviceman2026` | Test key or from Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | `rzp_secret_serviceman2026` | Test secret or from Razorpay dashboard |

6. Click **Create Web Service**.
7. Render will build and deploy your backend. Once complete, copy the live URL:
   `https://serviceman-backend.onrender.com`
8. Verify it works in your browser:
   Visit `https://serviceman-backend.onrender.com/api/health`
   Expected response:
   ```json
   {
     "status": "online",
     "service": "ServiceMan API",
     "environment": "production"
   }
   ```

---

## 🎨 Part 5: Frontend Deployment (Vercel.com)

1. Sign up/log in at [https://vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Expand the **Environment Variables** section and add:

| Environment Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://serviceman-backend.onrender.com` | Live backend URL from Render |
| `VITE_SOCKET_URL` | `https://serviceman-backend.onrender.com` | Live Socket.io URL from Render |

6. Click **Deploy**.
7. Vercel will install dependencies, build the Vite app, and deploy it.
8. Once finished, you will receive your live domain, for example:
   `https://serviceman-client.vercel.app`

### Step 5.1: Update Backend CORS on Render
Now that you have your live frontend URL (`https://serviceman-client.vercel.app`):
1. Return to [Render Dashboard](https://dashboard.render.com).
2. Go to your `serviceman-backend` service → **Environment**.
3. Update `CLIENT_URL` to `https://serviceman-client.vercel.app`.
4. Click **Save Changes** (Render will automatically redeploy).

---

## 💳 Part 6: Optional Third-Party Services Setup

### 1. Razorpay Payment Gateway (Live or Test)
1. Register at [https://dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Ensure you are in **Test Mode** (toggle on top left).
3. Go to **Settings** → **API Keys** → Click **Generate Test Key**.
4. Copy `Key Id` and `Key Secret`.
5. Add them to Render Environment Variables:
   - `RAZORPAY_KEY_ID=rzp_test_...`
   - `RAZORPAY_KEY_SECRET=...`

### 2. Google Maps API (Optional)
> Note: The platform already uses Leaflet and OpenStreetMap by default, which works out of the box with zero cost!
1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a project and enable **Maps JavaScript API** and **Geocoding API**.
3. Go to **Credentials** → **Create Credentials** → **API Key**.
4. Set in backend environment variables: `GOOGLE_MAPS_API_KEY=...`

### 3. AWS S3 Storage (Optional)
> Note: Local Multer disk storage in `server/uploads/` is enabled by default.
1. Sign in to [AWS Console](https://console.aws.amazon.com).
2. Create an S3 Bucket named `serviceman-kyc-vault` in region `ap-south-1`.
3. In IAM, create a user with `AmazonS3FullAccess` and generate Access Keys.
4. Set in backend environment variables:
   - `AWS_ACCESS_KEY_ID=...`
   - `AWS_SECRET_ACCESS_KEY=...`
   - `AWS_REGION=ap-south-1`
   - `AWS_BUCKET_NAME=serviceman-kyc-vault`

---

## 🌱 Part 7: Seeding the Production Database with Demo Accounts

To populate your cloud MongoDB Atlas database with the ready-to-test customer, verified provider, electrician, and admin accounts:

From your local machine terminal:
1. Temporarily point your local `server/.env` to your MongoDB Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://serviceman_admin:YourPassword@cluster0.xxxxx.mongodb.net/serviceman?retryWrites=true&w=majority
   ```
2. Run the seed script:
   ```bash
   cd server
   npm run seed
   ```
3. You will see:
   ```text
   [Seed Complete] Successfully populated 5 users, 3 providers, services, bookings, KYC docs, reviews, complaints, and ledger entries!
   ```
4. Now you can log into your deployed Vercel site immediately using any demo account:
   - **Customer**: `customer@serviceman.com` / `Password123!`
   - **Provider**: `provider@serviceman.com` / `Password123!`
   - **Admin**: `admin@serviceman.com` / `Admin123!`
