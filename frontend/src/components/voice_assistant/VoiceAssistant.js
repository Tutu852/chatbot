import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
const VoiceAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [theme, setTheme] = useState("light");

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
  }, [messages, isLoading]);

  const playAudio = useCallback((audioBase64) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audioSrc = `data:audio/mp3;base64,${audioBase64}`;
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const sendToBackend = useCallback(
    async (text) => {
      if (text.trim()) {
        setIsLoading(true);
        try {
          const res = await fetch("http://127.0.0.1:8000/voice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text + " (Please give a short and clear answer)" }),
          });
          const data = await res.json();
          const botMessage = { sender: "bot", data: data.data };
          setMessages((prevMessages) => [...prevMessages, botMessage]);
          if (data.audio) {
            playAudio(data.audio);
          }
        } catch (error) {
          console.error("Error communicating with chatbot:", error);
          const errorMessage = {
            sender: "bot",
            data: "Error communicating with the chatbot.",
          };
          setMessages((prevMessages) => [...prevMessages, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [playAudio]
  );

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const userMessage = { sender: "user", data: transcript };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        sendToBackend(transcript.trim());
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.error("Speech recognition not supported in this browser.");
    }
  }, [sendToBackend]);

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

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
      "rgba(253, 224, 71, 0.4)", // yellow
      "rgba(134, 239, 172, 0.4)", // green
      "rgba(147, 197, 253, 0.4)", // blue
      "rgba(165, 180, 252, 0.4)", // indigo
      "rgba(216, 180, 254, 0.4)", // purple
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

  const renderMessage = (msg, index) => {
    const isUser = msg.sender === "user";
    const messageClass = isUser
      ? "bg-green-200 dark:bg-green-700 self-end text-gray-800 dark:text-gray-200"
      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 self-start text-gray-800 dark:text-gray-200";

    const renderData = () => {
      if (msg.data && typeof msg.data === 'object' && msg.data.order_status) {
        return (
          <div>
            <p><strong>Order Status:</strong> {msg.data.order_status}</p>
            <p><strong>Estimated Delivery:</strong> {msg.data.estimated_delivery}</p>
            <p><strong>Product:</strong> {msg.data.product}</p>
          </div>
        );
      }
      return msg.data;
    };

    return (
      <div
        key={index}
        className={`rounded-lg p-3 m-2 max-w-[80%] animate-bubble shadow-sm ${messageClass}`}
      >
        {renderData()}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-6 relative overflow-hidden bg-gray-100 dark:bg-gray-900">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      />
      <style>{`
        @keyframes bubble {
          0% { transform: translateY(10px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-bubble {
          animation: bubble 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
      <div className="flex flex-col h-[550px] w-[400px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden relative z-10">
        <div className="bg-blue-200 dark:bg-blue-900 p-4 text-blue-900 dark:text-blue-100 text-center font-bold text-xl shadow-sm z-10 flex justify-between items-center">
          <span>Voice Assistant</span>
          <Link to="/" className="text-sm p-2 rounded-lg bg-blue-300 dark:bg-blue-800 hover:bg-blue-400 dark:hover:bg-blue-700">
            Chatbot
          </Link>
          <button onClick={toggleTheme} className="text-sm p-2 rounded-lg bg-blue-300 dark:bg-blue-800 hover:bg-blue-400 dark:hover:bg-blue-700">
            {theme === "light" ? "Dark" : "Light"} Mode
          </button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto bg-gray-200 dark:bg-gray-700">
          <div className="flex flex-col">
            {messages.map((msg, index) => renderMessage(msg, index))}
            {isLoading && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 self-start text-gray-500 dark:text-gray-400 rounded-lg p-3 m-2 max-w-[80%] shadow-sm flex items-center gap-1">
                <span className="animate-bounce inline-block w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                <span className="animate-bounce inline-block w-1.5 h-1.5 bg-gray-500 rounded-full" style={{ animationDelay: "0.2s" }}></span>
                <span className="animate-bounce inline-block w-1.5 h-1.5 bg-gray-500 rounded-full" style={{ animationDelay: "0.4s" }}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border-t flex flex-col gap-2 justify-center items-center shadow-inner">
          <button
            className={`w-full px-4 py-2 text-white font-bold rounded-lg ${
              isListening ? "bg-red-500" : "bg-blue-500"
            }`}
            onClick={handleToggleListening}
          >
            {isListening ? "Stop Speaking" : "Start Speaking"}
          </button>
          {isPlaying && (
            <button
              className="w-full px-4 py-2 text-white font-bold rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors"
              onClick={stopAudio}
            >
              Stop Audio
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
