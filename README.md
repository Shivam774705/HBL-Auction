# 🏸 HBL Auction: Premium Sports Bidding System

A production-ready, real-time auction platform designed for the **Hostel Badminton League (HBL)**. This system transforms traditional, manual sports auctions into a high-stakes, mobile-native digital experience with live data synchronization and automated team management.

---

## ⚡ The Problem & Solution

### The Problem
Traditional hostel sports auctions are often managed on paper or static spreadsheets. This leads to:
*   **Slow Pacing**: Manually updating purses and squad counts delays the event.
*   **Human Error**: Accidental overspending or exceeding squad limits.
*   **Low Engagement**: Participants (Captains) have no real-time visual of the auction progress or competitors' status.

### The Solution
**HBL Auction** provides a real-time, digital command center for the entire league:
*   **Live Synchronization**: Every bid is instantly visible to all participants via WebSockets.
*   **Automated Validation**: The system prevents overbidding and enforces squad size limits automatically.
*   **Mobile-Native Design**: A premium UI optimized for one-handed use on mobile devices, making it feel like a professional sports application.

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15/16](https://nextjs.org/) (App Router)
*   **Real-time**: [Socket.IO](https://socket.io/) (Custom Node.js Server integration)
*   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Styling**: Vanilla CSS & [Tailwind CSS](https://tailwindcss.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)

---

## 🌟 Core Features

### 👑 Admin Command Center
*   **Auction Control**: Live start/pause/resume functionality.
*   **Player Management**: Detailed player profiles with stats, category, and base price.
*   **Auction Logic**: Mark players as Sold/Unsold with automated purse deduction.
*   **History Logs**: Full audit trail of every bid and transaction.

### 🏸 Captain's Portal (Mobile Native)
*   **Global Navigation**: Persistent bottom bar for Dashboard, Bidding, Team View, and Standings.
*   **Live Bidding Hall**: Dual-layer navigation stacked for one-handed bidding control.
*   **Smart Purse Tracking**: Real-time visualization of remaining budget and "Safe Bid" limits.
*   **Squad Visualization**: High-impact cards showing current roster and spent budget.

### 📺 Live Big Screen
*   **Broadcasting Mode**: Optimized for TV/Projector display with high-contrast player cards and pulsing live indicators for the audience.

---

## 🚀 Deployment (Render Guide)

This project is optimized for deployment on **Render** as a **Web Service**.

1.  **Create New Web Service**: Connect your GitHub repo.
2.  **Build Command**: `npm install && npm run build`
3.  **Start Command**: `npm run start`
4.  **Environment Variables**:
    *   `MONGO_URI`: Your MongoDB Atlas connection string.
    *   `JWT_SECRET`: Random string for authentication.
    *   `NEXT_PUBLIC_APP_URL`: Your live Render URL (e.g., `https://hbl-auction.onrender.com`).
    *   `NODE_ENV`: `production`

---

## 💻 Local Setup

1.  **Clone the Repo**
    ```bash
    git clone https://github.com/Shivam774705/HBL-Auction.git
    cd HBL-Auction
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment**
    Create a `.env.local` file and fill in the values from `.env.example`.

4.  **Seed the Database**
    Initialize default admin, pricing rules, and demo teams:
    ```bash
    npm run seed
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    *Open [http://localhost:3000](http://localhost:3000) to view the app.*

---

## 📝 Environment Variables (.env)

| Variable | Description |
| :--- | :--- |
| `MONGO_URI` | MongoDB Connection String |
| `JWT_SECRET` | Secret key for access tokens |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens |
| `NEXT_PUBLIC_APP_URL` | Application base URL |
| `ADMIN_DEFAULT_EMAIL` | Default login for Admin |
| `ADMIN_DEFAULT_PASSWORD` | Default password for Admin |

---

## 🔗 Live Demo
Check out the live application here: **[HBL Auction Hall](https://hbl-auction.onrender.com)**

---

## 👨‍💻 Author
**Shivam** - [GitHub](https://github.com/Shivam774705)

---
*Created for the Hostel Badminton League community.*
