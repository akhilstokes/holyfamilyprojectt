import React, { useState, useRef, useEffect } from 'react';
import './AIDoubtResolver.css';

const AIDoubtResolver = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: "Hello! I'm your AI assistant for rubber-related questions. I can help you with:\n\n• Rubber properties and characteristics\n• Manufacturing processes\n• Quality standards and testing\n• Market trends and pricing\n• Technical specifications\n• Troubleshooting common issues\n\nWhat would you like to know about rubber?",
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/doubt-resolver', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ question: inputMessage })
            });

            const data = await response.json();

            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: data.answer || "I'm sorry, I couldn't process your question at the moment. Please try again.",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: "I'm experiencing technical difficulties. Please try again in a moment.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTimestamp = (timestamp) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const suggestedQuestions = [
        "What are the different types of rubber?",
        "How do I test rubber quality?",
        "What affects rubber pricing?",
        "How to prevent rubber degradation?",
        "What are rubber processing methods?"
    ];

    const handleSuggestedQuestion = (question) => {
        setInputMessage(question);
    };

    return (
        <div className="ai-doubt-resolver">
            <div className="ai-header">
                <div className="ai-title">
                    <i className="fas fa-robot"></i>
                    <h2>AI Rubber Expert</h2>
                </div>
                <p className="ai-subtitle">Ask me anything about rubber, manufacturing, or industry standards</p>
            </div>

            <div className="chat-container">
                <div className="messages-container">
                    {messages.map((message) => (
                        <div key={message.id} className={`message ${message.type}`}>
                            <div className="message-content">
                                <div className="message-text">
                                    {message.content.split('\n').map((line, index) => (
                                        <p key={index}>{line}</p>
                                    ))}
                                </div>
                                <div className="message-time">
                                    {formatTimestamp(message.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message ai">
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {messages.length === 1 && (
                    <div className="suggested-questions">
                        <h4>Popular Questions:</h4>
                        <div className="suggestions-grid">
                            {suggestedQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    className="suggestion-chip"
                                    onClick={() => handleSuggestedQuestion(question)}
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="input-container">
                    <div className="input-wrapper">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything about rubber..."
                            className="message-input"
                            rows="1"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className="send-button"
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIDoubtResolver;

