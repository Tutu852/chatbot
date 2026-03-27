import os
import re
from groq import Groq
from dotenv import load_dotenv
from chatbot.data import products, orders

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

class Service:
    def process_message(self, message: str) -> dict:
        raise NotImplementedError

class ChatbotService(Service):
    def __init__(self):
        self.products = products
        self.orders = orders

    def handle_order_inquiry(self, message: str):
        order_id_match = re.search(r"\b\d{5}\b", message)
        if not order_id_match:
            order_id_match = re.search(r"\b\d+\b", message)

        if order_id_match:
            order_id = order_id_match.group(0)
            if order_id in self.orders:
                order_details = self.orders[order_id]
                product = next((p for p in self.products if p["id"] == order_details["product_id"]), None)
                if product:
                    response_data = {
                        "order_status": order_details["status"],
                        "estimated_delivery": order_details["estimated_delivery"],
                        "product": product
                    }
                    return {"type": "order_status", "data": response_data}
                else:
                    return {"type": "text", "data": "Could not find product details for your order."}
            else:
                return {"type": "text", "data": f"You entered '{order_id}', but I couldn't find an order with that number. Our order IDs are 5 digits long. Please double-check and try again."}
        else:
            return {"type": "text", "data": "I can help with that. What is your 5-digit order ID?"}

    def process_message(self, message: str) -> dict:
        if re.fullmatch(r"\d+", message):
            return self.handle_order_inquiry(message)

        if re.search(r"order status|status of my order|where is my order|delivery order|track my order|order id|my status|orderid|ordre id", message, re.IGNORECASE):
            return self.handle_order_inquiry(message)

        search_match = re.search(r"search for (.+)|find (.+)", message, re.IGNORECASE)
        if search_match:
            product_name = search_match.group(1) or search_match.group(2)
            found_products = [p for p in self.products if product_name.lower() in p['name'].lower()]
            if found_products:
                return {"type": "product", "data": found_products[0]}
            else:
                return {"type": "text", "data": f"Sorry, I couldn't find any products matching '{product_name}'."}

        try:
            client = Groq(api_key=api_key)
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": message,
                    }
                ],
                model="llama-3.1-8b-instant",
            )
            return {"type": "text", "data": chat_completion.choices[0].message.content}
        except Exception as e:
            return {"type": "text", "data": f"An error occurred: {e}"}

def get_groq_response(message: str):
    chatbot_service = ChatbotService()
    return chatbot_service.process_message(message)
