import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const canvasRef = useRef(null);
  const [theme, setTheme] = useState("light");
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSize = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const numParticles = 50;

    const mouse = { x: null, y: null, radius: 150 };

    const handleMouseMove = (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    };

    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);

    const colors = [
      "rgba(252, 165, 165, 0.4)", // red
      "rgba(253, 186, 116, 0.4)", // orange
      "rgba(253, 224, 71, 0.4)",  // yellow
      "rgba(134, 239, 172, 0.4)", // green
      "rgba(147, 197, 253, 0.4)", // blue
      "rgba(165, 180, 252, 0.4)", // indigo
      "rgba(216, 180, 254, 0.4)"  // purple
    ];

    class Particle {
      constructor(x, y, radius, dx, dy, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.color = color;
        this.density = Math.random() * 30 + 1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
      }
      update() {
        this.x += this.dx;
        this.y += this.dy;

        // Wrap particles around the screen smoothly
        if (this.x < -this.radius * 2) {
          this.x = canvas.width + this.radius * 2;
        } else if (this.x > canvas.width + this.radius * 2) {
          this.x = -this.radius * 2;
        }

        if (this.y < -this.radius * 2) {
          this.y = canvas.height + this.radius * 2;
          this.x = Math.random() * canvas.width;
        } else if (this.y > canvas.height + this.radius * 2) {
          this.y = -this.radius * 2;
          this.x = Math.random() * canvas.width;
        }

        // Mouse repulsion logic
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius && distance > 0) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;
            this.x -= directionX;
            this.y -= directionY;
          }
        }
        this.draw();
      }
    }

    function init() {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        let radius = Math.random() * 20 + 10;
        let x = Math.random() * (canvas.width - radius * 2) + radius;
        let y = Math.random() * (canvas.height - radius * 2) + radius;
        let dx = (Math.random() - 0.5) * 1;
        let dy = Math.random() * -1 - 0.5; // Drift upwards
        let color = colors[Math.floor(Math.random() * colors.length)];
        particles.push(new Particle(x, y, radius, dx, dy, color));
      }
    }

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
    }

    init();
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSend = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { type: "text", data: input, sender: "user" }];
      setMessages(newMessages);
      setInput("");
      setIsTyping(true);

      try {
        const response = await fetch("http://127.0.0.1:8000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        });
  
        const data = await response.json();
        setMessages([...newMessages, { type: data.type, data: data.data, sender: "bot" }]);
      } catch (error) {
        console.error("Error communicating with chatbot:", error);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const renderMessage = (msg, index) => {
    console.log("Rendering message:", msg); // For debugging
    const isUser = msg.sender === "user";
    const messageClass = isUser
      ? "bg-green-200 dark:bg-green-700 self-end text-gray-800 dark:text-gray-200"
      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 self-start text-gray-800 dark:text-gray-200";

    if (msg.type === "product") {
      return (
        <div key={index} className={`rounded-lg p-3 m-2 max-w-[80%] animate-bubble shadow-sm ${messageClass}`}>
          <div>
            <p className="font-bold mb-1">I found this product for you:</p>
            <div className="flex">
              <img src={msg.data.image_url} alt={msg.data.name} className="w-24 h-24 object-cover mr-2" />
              <div>
                <p className="font-bold">{msg.data.name}</p>
                <p>{msg.data.description}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (msg.type === "order_status") {
      const { order_status, estimated_delivery, product } = msg.data;
      return (
        <div key={index} className={`rounded-lg p-3 m-2 max-w-[80%] animate-bubble shadow-sm ${messageClass}`}>
          <div>
            <p><span className="font-bold">Order Status:</span> {order_status}</p>
            <p><span className="font-bold">Estimated Delivery:</span> {estimated_delivery}</p>
            <div className="flex mt-2">
              <img src={product.image_url} alt={product.name} className="w-24 h-24 object-cover mr-2" />
              <div>
                <p className="font-bold">{product.name}</p>
                <p>{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={index} className={`rounded-lg p-3 m-2 max-w-[80%] animate-bubble shadow-sm ${messageClass}`}>
        {msg.data}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-10 relative overflow-hidden bg-gray-100 dark:bg-gray-900">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none" />
      <style>{`
        @keyframes bubble {
          0% { transform: translateY(10px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-bubble {
          animation: bubble 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .typing-dot {
          animation: typing 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
      <div className={`flex flex-col ${isExpanded ? 'h-[600px] w-[800px]' : 'h-[400px] w-[400px]'} bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden relative z-10`}>
        <div className="bg-blue-200 dark:bg-blue-900 p-4 text-blue-900 dark:text-blue-100 text-center font-bold text-xl shadow-sm z-10 flex justify-between items-center">
          <span>Chatbot</span>
          <Link to="/voice" className="text-sm p-2 rounded-lg bg-blue-300 dark:bg-blue-800 hover:bg-blue-400 dark:hover:bg-blue-700">
            Voice Assistant
          </Link>
          <button onClick={toggleTheme} className="text-sm p-2 rounded-lg bg-blue-300 dark:bg-blue-800 hover:bg-blue-400 dark:hover:bg-blue-700">
            {theme === "light" ? "Dark" : "Light"} Mode
          </button>
          <button onClick={toggleSize} className="text-sm p-2 rounded-lg bg-blue-300 dark:bg-blue-800 hover:bg-blue-400 dark:hover:bg-blue-700">
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto bg-gray-200 dark:bg-gray-700">
          <div className="flex flex-col">
            {messages.map((msg, index) => renderMessage(msg, index))}
            {isTyping && (
              <div className="bg-blue-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 self-start rounded-lg p-3 m-2 flex space-x-1 animate-bubble shadow-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border-t flex shadow-inner">
          <input
            type="text"
            className="flex-grow rounded-full py-2 px-4 border-2 border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none transition-colors"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
          />
          <button
            className="bg-blue-400 text-white rounded-full p-2 px-4 ml-2 hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-semibold"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
