import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
  Box,
  Container,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Fade,
  CircularProgress,
  Tooltip
} from '@mui/material'
import { Send, AutoAwesome, Clear, LightMode, DarkMode, KeyboardArrowDown } from '@mui/icons-material'
import ChatMessage from './components/ChatMessage'

export default function App() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkScrollPosition = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100
      setIsAtBottom(isNearBottom)
    }
  }

  useEffect(() => {
    // Only auto-scroll if user is at bottom or it's the first message
    if (isAtBottom || messages.length === 1) {
      setTimeout(() => scrollToBottom(), 100)
    }
  }, [messages, isAtBottom])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await axios.post('http://localhost:8000/api/chat', {
        message: userMessage.content,
        conversation_history: messages.slice(-10)
      })

      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const suggestedPrompts = [
    "Write a Python function to reverse a string",
    "Explain machine learning concepts",
    "Create a REST API with FastAPI",
    "Help me with data science in pandas"
  ]

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: isDarkMode
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255,255,255,0.05)',
          p: 2
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  width: 40,
                  height: 40
                }}
              >
                <AutoAwesome />
              </Avatar>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  GenAI Assistant
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Powered by Llama 3.1
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Clear Chat">
                <IconButton onClick={clearChat} sx={{ color: 'white' }}>
                  <Clear />
                </IconButton>
              </Tooltip>
              <Tooltip title="Toggle Theme">
                <IconButton onClick={toggleTheme} sx={{ color: 'white' }}>
                  {isDarkMode ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Container maxWidth="md" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 2, position: 'relative', minHeight: 0 }}>

          {/* Messages */}
          <Box
            ref={chatContainerRef}
            onScroll={checkScrollPosition}
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              minHeight: 0,
              scrollBehavior: 'smooth',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(255,255,255,0.5)',
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: 2,
                minHeight: 'min-content'
              }}
            >
            {messages.length === 0 ? (
              <Fade in timeout={800}>
                <Box sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 4
                }}>
                  <AutoAwesome sx={{ fontSize: 80, color: 'rgba(255,255,255,0.3)' }} />
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      How can I help you today?
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
                      Ask me anything about programming, AI, data science, or technology
                    </Typography>
                  </Box>

                  {/* Suggested Prompts */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                    {suggestedPrompts.map((prompt, index) => (
                      <Box
                        key={index}
                        onClick={() => setInputMessage(prompt)}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          maxWidth: 200,
                          '&:hover': {
                            background: 'rgba(255,255,255,0.15)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          {prompt}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Fade>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {messages.map((message, index) => (
                  <Fade in timeout={300} key={index}>
                    <div className="message-enter">
                      <ChatMessage message={message} />
                    </div>
                  </Fade>
                ))}
              </Box>
            )}

            {isLoading && (
              <Fade in>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 3,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)'
                }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    <AutoAwesome />
                  </Avatar>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} sx={{ color: 'white' }} />
                    <Typography variant="body2" className="typing-indicator" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      AI is thinking...
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            )}

            <div ref={messagesEndRef} />
            </Box>
          </Box>

          {/* Scroll to bottom button */}
          {!isAtBottom && messages.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 100,
                right: 20,
                zIndex: 1000
              }}
            >
              <IconButton
                onClick={scrollToBottom}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <KeyboardArrowDown />
              </IconButton>
            </Box>
          )}

          {/* Input Area */}
          <Box
            sx={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.2)',
              p: 2
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                variant="standard"
                disabled={isLoading}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    color: 'white',
                    fontSize: '1rem',
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255,255,255,0.5)',
                      opacity: 1
                    }
                  }
                }}
              />
              <IconButton
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="send-button"
                sx={{
                  background: inputMessage.trim() && !isLoading
                    ? 'linear-gradient(45deg, #667eea, #764ba2)'
                    : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  width: 48,
                  height: 48,
                  '&:hover': {
                    background: inputMessage.trim() && !isLoading
                      ? 'linear-gradient(45deg, #5a67d8, #6b46c1)'
                      : 'rgba(255,255,255,0.15)'
                  },
                  '&:disabled': {
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
