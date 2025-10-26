import React from 'react'
import { Box, Avatar, Typography } from '@mui/material'
import { AutoAwesome, Person, ContentCopy } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

export default function ChatMessage({ message, isDarkMode = true }) {
  const isUser = message.role === 'user'
  const isStreaming = message.isStreaming || false

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        alignItems: 'flex-start',
        width: '100%'
      }}
    >
      <Avatar
        sx={{
          width: 30,
          height: 30,
          bgcolor: isUser ? (isDarkMode ? '#5436da' : '#ab68ff') : '#10a37f',
          flexShrink: 0,
          fontSize: 16
        }}
      >
        {isUser ? <Person sx={{ fontSize: 16 }} /> : <AutoAwesome sx={{ fontSize: 16 }} />}
      </Avatar>

      <Box
        sx={{
          flex: 1,
          minWidth: 0 // This allows text to wrap properly
        }}
      >
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: isDarkMode ? '#ffffff' : '#000000',
              mb: 1,
              fontSize: '14px'
            }}
          >
            {isUser ? 'You' : 'ChatGPT'}
          </Typography>

          {/* Message Content */}
          {isUser ? (
            <Typography
              variant="body1"
              sx={{
                color: isDarkMode ? '#ffffff' : '#000000',
                lineHeight: 1.6,
                fontSize: '1rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {message.content}
            </Typography>
          ) : (
            <Box>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeString = String(children).replace(/\n$/, '')

                  return !inline && match ? (
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      {/* Code block header */}
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: isDarkMode ? '#2d2d2d' : '#f6f8fa',
                        px: 2,
                        py: 1,
                        borderRadius: '8px 8px 0 0',
                        borderBottom: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`
                      }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: isDarkMode ? '#a0a0a0' : '#666666',
                            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
                          }}
                        >
                          {match[1]}
                        </Typography>
                        <Box
                          onClick={() => copyToClipboard(codeString)}
                          sx={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            p: 0.5,
                            borderRadius: 1,
                            color: isDarkMode ? '#a0a0a0' : '#666666',
                            '&:hover': { 
                              bgcolor: isDarkMode ? '#404040' : '#e8e8e8',
                              color: isDarkMode ? '#ffffff' : '#000000'
                            }
                          }}
                        >
                          <ContentCopy sx={{ fontSize: 14 }} />
                          <Typography variant="caption">Copy code</Typography>
                        </Box>
                      </Box>

                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: '0 0 8px 8px',
                          fontSize: '0.875rem',
                          lineHeight: '1.5',
                          backgroundColor: isDarkMode ? '#1a1a1a' : '#f6f8fa'
                        }}
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </Box>
                  ) : (
                    <code
                      style={{
                        backgroundColor: isDarkMode ? '#404040' : '#f1f3f4',
                        color: isDarkMode ? '#ff6b6b' : '#d73a49',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                        fontSize: '0.85em'
                      }}
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                p: ({ children }) => (
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 1.5,
                      color: isDarkMode ? '#ffffff' : '#000000',
                      lineHeight: 1.6,
                      fontSize: '1rem',
                      '&:last-child': {
                        mb: 0
                      }
                    }}
                  >
                    {children}
                  </Typography>
                ),
                h1: ({ children }) => (
                  <Typography
                    variant="h4"
                    sx={{
                      mb: 3,
                      mt: 2,
                      color: isDarkMode ? '#ffffff' : '#000000',
                      fontWeight: 700
                    }}
                  >
                    {children}
                  </Typography>
                ),
                h2: ({ children }) => (
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2,
                      mt: 2,
                      color: isDarkMode ? '#ffffff' : '#000000',
                      fontWeight: 600
                    }}
                  >
                    {children}
                  </Typography>
                ),
                h3: ({ children }) => (
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      mt: 1,
                      color: isDarkMode ? '#ffffff' : '#000000',
                      fontWeight: 600
                    }}
                  >
                    {children}
                  </Typography>
                ),
                ul: ({ children }) => (
                  <Box
                    component="ul"
                    sx={{
                      pl: 2,
                      mb: 1.5,
                      mt: 0,
                      '& li': {
                        mb: 0.5,
                        color: isDarkMode ? '#ffffff' : '#000000',
                        lineHeight: 1.6,
                        fontSize: '1rem'
                      },
                      '& li::marker': {
                        color: isDarkMode ? '#10a37f' : '#10a37f'
                      }
                    }}
                  >
                    {children}
                  </Box>
                ),
                ol: ({ children }) => (
                  <Box
                    component="ol"
                    sx={{
                      pl: 2,
                      mb: 1.5,
                      mt: 0,
                      '& li': {
                        mb: 0.5,
                        color: isDarkMode ? '#ffffff' : '#000000',
                        lineHeight: 1.6,
                        fontSize: '1rem'
                      },
                      '& li::marker': {
                        color: isDarkMode ? '#10a37f' : '#10a37f'
                      }
                    }}
                  >
                    {children}
                  </Box>
                ),
                blockquote: ({ children }) => (
                  <Box
                    sx={{
                      borderLeft: '4px solid #10a37f',
                      pl: 2,
                      py: 1,
                      my: 2,
                      bgcolor: isDarkMode ? 'rgba(16, 163, 127, 0.1)' : 'rgba(16, 163, 127, 0.05)',
                      borderRadius: '0 4px 4px 0',
                      fontStyle: 'italic',
                      color: isDarkMode ? '#ffffff' : '#000000'
                    }}
                  >
                    {children}
                  </Box>
                ),
                strong: ({ children }) => (
                  <Typography
                    component="strong"
                    sx={{
                      fontWeight: 700,
                      color: isDarkMode ? '#ffffff' : '#000000'
                    }}
                  >
                    {children}
                  </Typography>
                ),
                em: ({ children }) => (
                  <Typography
                    component="em"
                    sx={{
                      fontStyle: 'italic',
                      color: isDarkMode ? '#ffffff' : '#000000'
                    }}
                  >
                    {children}
                  </Typography>
                )
              }}
            >
              {message.content}
            </ReactMarkdown>
            
            {/* Typing cursor for streaming */}
            {isStreaming && (
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  width: '2px',
                  height: '1.2em',
                  bgcolor: isDarkMode ? '#ffffff' : '#000000',
                  ml: 0.5,
                  animation: 'blink 1s infinite',
                  '@keyframes blink': {
                    '0%, 50%': { opacity: 1 },
                    '51%, 100%': { opacity: 0 }
                  }
                }}
              />
            )}
          </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}