import base64
from io import BytesIO
from gtts import gTTS
from chatbot.service import ChatbotService

class VoiceAssistantService:
    def __init__(self):
        self.chatbot_service = ChatbotService()

    def _generate_audio_base64(self, text: str) -> str:
        try:
            tts = gTTS(text=text, lang='en')
            fp = BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            return base64.b64encode(fp.read()).decode('utf-8')
        except Exception as e:
            print(f"Error generating audio: {e}")
            return None

    def process_message(self, message: str) -> dict:
        response = self.chatbot_service.process_message(message)
        response_type = response.get("type")
        response_data = response.get("data")

        formatted_string = ""

        if response_type == "order_status":
            product = response_data.get("product", {})
            formatted_string = (
                f"Your order status is {response_data.get('order_status', 'N/A')}. "
                f"The estimated delivery is {response_data.get('estimated_delivery', 'N/A')}. "
                f"The product is {product.get('name', 'N/A')}."
            )
        
        elif response_type == "product":
            formatted_string = (
                f"I found {response_data.get('name', 'N/A')}: {response_data.get('description', 'N/A')}."
            )

        elif response_type == "text":
            formatted_string = str(response_data)

        else:
            # Fallback for any other types or if data is not in the expected format
            formatted_string = "I'm sorry, I'm having trouble processing this request right now."

        result = {"data": formatted_string}
        
        # Generate the audio and attach it
        audio_base64 = self._generate_audio_base64(formatted_string)
        if audio_base64:
            result["audio"] = audio_base64
            
        return result
