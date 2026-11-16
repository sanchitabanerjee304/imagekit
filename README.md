
# 🖼️ ImageKit – Cloud-Based Image Management System

A full-stack image management application built using the MERN stack, ImageKit, and modern web technologies. Upload, store, view, and manage images through a clean and responsive dashboard.

## 🌐 Live Demo

 **Live Application:** https://imagekit-frontend.onrender.com

⚙️ **Backend API:** https://imagekit-n47h.onrender.com

📂 **GitHub Repository:** [ImageKit Repository](YOUR_GITHUB_REPOSITORY_URL)

## ✨ Features

- **Image Upload:** Upload images directly from your device.
- **Cloud Storage:** Securely store images using ImageKit.
- **Image Gallery:** View all uploaded images in an organized gallery.
- **Image Management:** Retrieve and manage uploaded images.
- **Delete Images:** Remove images from the application and cloud storage.
- **Image Details:** View image name, format, and file size.
- **Responsive Dashboard:** Clean and user-friendly interface.
- **REST API Integration:** React frontend communicates with the Express backend.
- **MongoDB Database:** Store image metadata and manage records.
- **Cloud Deployment:** Frontend and backend deployed separately on Render.

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- ImageKit SDK
- Multer
- CORS

### Deployment & Storage
- Render – Frontend and Backend Hosting
- MongoDB Atlas – Database
- ImageKit – Cloud Image Storage
- Git & GitHub – Version Control

## 📁 Project Structure

```text
imagekit/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── server.js
│
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd imagekit
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

## 🔗 Deployment Links

| Component | URL |
|---|---|
| Live Frontend | https://imagekit-frontend.onrender.com |
| Backend API | https://imagekit-n47h.onrender.com |
| Image Storage | ImageKit |
| Database | MongoDB Atlas |

## 🔐 Environment Variables

Never commit `.env` files or expose private API keys, database credentials, or ImageKit private keys.

Add environment variables directly through the respective hosting platform's dashboard.

## 👩‍💻 Developer

**Sanchita Banerjee**

- GitHub: [@sanchitabanerjee304](https://github.com/sanchitabanerjee304)
- LinkedIn: [Sanchita Banerjee](https://www.linkedin.com/in/sanchita-banerjee-05b477333/)

---

⭐ If you find this project interesting, consider giving the repository a star!

**Built with ❤️ using the MERN Stack.**
