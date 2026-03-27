# Chatbot Application

This is a chatbot application with a React frontend and a Python backend.

## How to run the application

### Backend

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Create a `.env` file in the `backend` directory and add your Groq API key:
    ```
    GROQ_API_KEY=your_api_key
    ```
4.  Run the backend server:
    ```bash
    uvicorn main:app --reload
    ```
    The backend will be running on `http://127.0.0.1:8000`.

### Frontend

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Run the frontend development server:
    ```bash
    npm start
    ```
    The frontend will be running on `http://localhost:3000`.

## How to use the chatbot

Open your browser and go to `http://localhost:3000`.

You can have a normal conversation with the chatbot.

### New Features

- **Product Search:** You can search for products by typing "search for [product name]" or "find [product name]".
  - The available products are:
    - Laptop
    - Smartphone
    - Headphones
  - The chatbot will display the product's image, name, and description.

- **Order Status:** You can ask for the status of an order by providing a 5-digit order ID.
  - Example: "What is the status of my order 12345?"
  - The dummy order IDs are: 12345, 67890, 54321, 99999.
