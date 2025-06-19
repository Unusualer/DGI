import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    TextField,
    Button,
    Paper,
    Typography,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Divider,
    Avatar,
    IconButton,
    Chip,
    alpha
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

const Chatbot = ({ sidebarOpen }) => {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [abortController, setAbortController] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim() || loading) return;

        const userMessage = { text: question, sender: 'user', timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setQuestion('');
        setLoading(true);

        // Create new AbortController for this request
        const controller = new AbortController();
        setAbortController(controller);

        try {
            const response = await axios.post('/api/chatbot/ask', { question }, {
                signal: controller.signal
            });
            const botMessage = { text: response.data.answer, sender: 'bot', timestamp: new Date() };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            if (error.name === 'AbortError') {
                const cancelMessage = {
                    text: 'Demande annulée par l\'utilisateur.',
                    sender: 'bot',
                    timestamp: new Date(),
                    isCancelled: true
                };
                setMessages((prev) => [...prev, cancelMessage]);
            } else {
                const errorMessage = {
                    text: 'Désolé, je n\'ai pas pu traiter votre demande. Veuillez réessayer.',
                    sender: 'bot',
                    timestamp: new Date(),
                    isError: true
                };
                setMessages((prev) => [...prev, errorMessage]);
            }
        } finally {
            setLoading(false);
            setAbortController(null);
        }
    };

    const handleStopRequest = () => {
        if (abortController) {
            abortController.abort();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const formatTime = (timestamp) => {
        return timestamp.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate left position based on sidebar state
    const leftPosition = sidebarOpen ? '240px' : '73px';

    return (
        <Box sx={{
            position: 'fixed',
            top: '80px',
            left: leftPosition,
            right: 0,
            bottom: 0,
            maxWidth: '900px',
            margin: '0 auto',
            padding: '20px',
            height: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1,
            transition: 'left 0.3s ease-in-out'
        }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
                p: 2,
                borderRadius: 2,
                background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                border: '1px solid',
                borderColor: 'divider',
                flexShrink: 0
            }}>
                <Avatar sx={{
                    bgcolor: 'primary.main',
                    width: 48,
                    height: 48
                }}>
                    <SmartToyIcon />
                </Avatar>
                <Box>
                    <Typography variant="h5" fontWeight="600" color="primary.main">
                        Assistant Virtuel DGI
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Posez vos questions sur nos services et procédures
                    </Typography>
                </Box>
            </Box>

            {/* Messages Container */}
            <Paper elevation={0} sx={{
                flex: 1,
                mb: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                background: (theme) => alpha(theme.palette.background.paper, 0.8),
                minHeight: 0
            }}>
                <Box sx={{
                    p: 2,
                    height: '100%',
                    overflow: 'auto',
                    background: (theme) => `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.5)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`
                }}>
                    {messages.length === 0 ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            textAlign: 'center',
                            color: 'text.secondary'
                        }}>
                            <SmartToyIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6" gutterBottom>
                                Bienvenue !
                            </Typography>
                            <Typography variant="body1">
                                Comment puis-je vous aider aujourd'hui ?
                            </Typography>
                        </Box>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {messages.map((message, index) => (
                                <ListItem
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                                        alignItems: 'flex-start',
                                        px: 0,
                                        py: 1
                                    }}
                                >
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                                        alignItems: 'flex-start',
                                        gap: 1,
                                        maxWidth: '80%'
                                    }}>
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.500'
                                            }}
                                        >
                                            {message.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                                        </Avatar>
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start'
                                        }}>
                                            <Paper elevation={1} sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                backgroundColor: message.sender === 'user'
                                                    ? (theme) => alpha(theme.palette.primary.main, 0.1)
                                                    : message.isCancelled
                                                        ? (theme) => alpha(theme.palette.warning.main, 0.1)
                                                        : (theme) => alpha(theme.palette.grey[100], 0.8),
                                                border: '1px solid',
                                                borderColor: message.sender === 'user'
                                                    ? (theme) => alpha(theme.palette.primary.main, 0.2)
                                                    : message.isCancelled
                                                        ? (theme) => alpha(theme.palette.warning.main, 0.2)
                                                        : 'divider',
                                                maxWidth: '100%',
                                                wordBreak: 'break-word'
                                            }}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: message.sender === 'user'
                                                            ? 'primary.main'
                                                            : message.isCancelled
                                                                ? 'warning.main'
                                                                : 'text.primary',
                                                        fontWeight: (message.isError || message.isCancelled) ? 'bold' : 'normal',
                                                        lineHeight: 1.6
                                                    }}
                                                >
                                                    {message.text}
                                                </Typography>
                                            </Paper>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    mt: 0.5,
                                                    color: 'text.secondary',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                {formatTime(message.timestamp)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </ListItem>
                            ))}
                            {loading && (
                                <ListItem sx={{ px: 0, py: 1 }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 1
                                    }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.500' }}>
                                            <SmartToyIcon />
                                        </Avatar>
                                        <Paper elevation={1} sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            backgroundColor: (theme) => alpha(theme.palette.grey[100], 0.8),
                                            border: '1px solid',
                                            borderColor: 'divider'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CircularProgress size={16} />
                                                <Typography variant="body2" color="text.secondary">
                                                    En train d'écrire...
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    </Box>
                                </ListItem>
                            )}
                            <div ref={messagesEndRef} />
                        </List>
                    )}
                </Box>
            </Paper>

            {/* Input Form */}
            <Paper elevation={2} sx={{
                borderRadius: 3,
                p: 2,
                background: (theme) => alpha(theme.palette.background.paper, 0.95),
                border: '1px solid',
                borderColor: 'divider',
                flexShrink: 0
            }}>
                <Box component="form" onSubmit={handleSubmit} sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-end'
                }}>
                    <TextField
                        fullWidth
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tapez votre question ici..."
                        variant="outlined"
                        disabled={loading}
                        multiline
                        maxRows={4}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: 'background.paper'
                            }
                        }}
                    />
                    {loading ? (
                        <IconButton
                            onClick={handleStopRequest}
                            color="error"
                            sx={{
                                bgcolor: 'error.main',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'error.dark'
                                },
                                width: 48,
                                height: 48
                            }}
                        >
                            <StopIcon />
                        </IconButton>
                    ) : (
                        <IconButton
                            type="submit"
                            color="primary"
                            disabled={!question.trim()}
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'primary.dark'
                                },
                                '&:disabled': {
                                    bgcolor: 'grey.300',
                                    color: 'grey.500'
                                },
                                width: 48,
                                height: 48
                            }}
                        >
                            <SendIcon />
                        </IconButton>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default Chatbot; 