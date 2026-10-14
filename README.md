# 🌾 Kisaan Mithra AI

### An AI-Powered Agricultural Assistant for Indian Farmers

Kisaan Mithra AI is an AI-powered agricultural assistance platform designed to help Indian farmers access agricultural guidance, analyze crop diseases, and receive practical farming recommendations.

The platform aims to make agricultural information more accessible through an easy-to-use interface, helping farmers make informed decisions about crop health and farming practices.

## 🎯 Problem Statement

Indian farmers often face challenges in identifying crop diseases, accessing reliable agricultural information, and obtaining timely recommendations for managing crop-related problems.

Limited access to expert guidance and the complexity of agricultural information can affect crop health, productivity, and farmers' livelihoods.

Kisaan Mithra AI aims to address these challenges by providing an accessible, AI-powered platform for agricultural assistance.

## 💡 Our Solution

Kisaan Mithra AI combines artificial intelligence with a user-friendly web interface to assist farmers with agricultural queries and crop disease analysis.

The platform is designed with the goal of supporting farmers across India and different crop types, rather than focusing on a single crop.

## ✨ Key Features

* **🤖 AI-Powered Agricultural Assistance:** Helps users obtain agricultural guidance and recommendations.
* **🌱 Crop Disease Analysis:** Allows users to submit crop images for AI-assisted disease analysis.
* **💡 Farming Recommendations:** Provides AI-generated suggestions based on the user's agricultural query or crop analysis.
* **🖥️ User-Friendly Interface:** Offers a simple web interface designed to make agricultural assistance accessible.
* **🇮🇳 Designed for Indian Farmers:** Aims to support farmers across different regions and crop types.

*Note: Features and recommendations depend on the current implementation and availability of the AI service. AI-generated disease assessments should be verified with agricultural experts when necessary.*

## 🛠️ Technology Stack

### Frontend

* React
* JavaScript
* HTML and CSS

### Backend

* Node.js
* Express.js
* REST API

### Artificial Intelligence

* Google Gemini API for AI-powered agricultural responses and analysis

## 🏗️ Project Architecture

The application follows a frontend-backend architecture.

1. The user interacts with the React frontend.
2. The frontend sends requests to the Node.js and Express backend.
3. The backend processes the request and communicates with the configured AI service.
4. The backend returns the response to the frontend.
5. The frontend displays the agricultural guidance or disease analysis to the user.

## 📁 Project Structure

```text
kissan-mithra-ai/
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── services/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── docs/
├── .gitignore
└── README.md
```

*The structure above is illustrative. Update it to match the actual files and folders in the repository.*

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

* Node.js and npm
* Git
* A Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/A377548/kissan-mithra-ai.git
cd kissan-mithra-ai
```

### 2. Configure the Backend

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory and add the environment variables required by the application.

For example:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

Use the exact variable names expected by your backend code. Never commit your actual API key to GitHub.

### 3. Start the Backend

From the `backend` directory, run:

```bash
node server.js
```

The backend should start on the configured port, which is `5000` in the example configuration.

### 4. Configure and Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by the frontend development server in your browser.

### 5. Verify the Application

* Confirm that the frontend loads correctly.
* Test an agricultural query.
* Test crop disease analysis using an appropriate crop image.
* Verify that the frontend receives responses from the backend.

*Use the scripts defined in each directory's `package.json` if your project uses different commands.*

## 🔐 Environment Variables and Security

* Store API keys and other secrets in environment variables.
* Do not upload `.env` files containing real credentials.
* Keep `node_modules/` and generated build files out of version control where appropriate.
* Use `.env.example` to document the required environment variable names without including actual secrets.

## 🌍 Sustainable Development Goals

Kisaan Mithra AI aligns with the following United Nations Sustainable Development Goals:

* **SDG 2 – Zero Hunger:** Supports agricultural decision-making and the goal of sustainable food production.
* **SDG 9 – Industry, Innovation and Infrastructure:** Applies AI technology to agricultural challenges.
* **SDG 12 – Responsible Consumption and Production:** Has the potential to support more informed crop management and responsible agricultural practices.

These are intended areas of alignment; the project's actual impact will depend on its implementation and adoption.

## 🚀 Future Enhancements

Potential future improvements include:

* Multilingual support for Indian languages.
* Voice-based interaction for farmers with limited typing ability.
* Spoken responses for improved accessibility.
* Integration with verified agricultural knowledge sources.
* More comprehensive crop and disease coverage.
* Weather-aware and location-specific agricultural recommendations.
* Connections to agricultural experts and relevant government resources.

These are proposed enhancements and may not be available in the current version.

## 👥 Team

**Project:** Kisaan Mithra AI
**Hackathon:** HackNexus'26
**Round:** Round 2

Add your official team name and team member details here if required.

## ⚠️ Disclaimer

Kisaan Mithra AI is intended to provide agricultural assistance and AI-generated guidance. Its outputs may be incomplete or inaccurate and should not be treated as a substitute for professional agricultural advice. Farmers should consult qualified agricultural experts when making important crop treatment or pesticide-use decisions.

## 📄 License

Add an appropriate open-source license if you intend to distribute the project under one. Do not claim a license until you have selected and added it to the repository.
