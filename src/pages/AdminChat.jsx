import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Image as ImageIcon,
  Paperclip,
  MoreVertical,
  X,
  Phone,
  Video,
  CheckCheck,
  Check
} from 'lucide-react';
import io from 'socket.io-client';
import ApiBaseUrl from '../constants/apiUrl';

const AdminChat = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Auth
  const [adminToken, setAdminToken] = useState(null);
  
  // Socket
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Conversations
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI State
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    activeUsers: 0
  });

  // Get token from localStorage
  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem('adminAuth'));
    if (authData && authData.token) {
      setAdminToken(authData.token);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Initialize Socket.IO
  useEffect(() => {
    if (!adminToken) return;

    const socketInstance = io('https://api.madadgaar.com.pk', {
      auth: {
        token: adminToken
      },
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      // Re-fetch conversations when reconnected
      if (adminToken) {
        fetchConversations();
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('reconnect', () => {
      console.log('Socket reconnected');
      setIsConnected(true);
      // Re-join conversation if one is selected
      if (selectedConversation?._id) {
        socketInstance.emit('conversation:join', { conversationId: selectedConversation._id });
      }
      // Re-fetch conversations
      if (adminToken) {
        fetchConversations();
      }
    });

    socketInstance.on('message:received', (data) => {
      const message = data.message || data;
      const conversationId = message.conversationId || data.conversationId;
      
      // Add message to current conversation if it matches
      if (selectedConversation?._id === conversationId) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          // Add new message and sort by timestamp
          const updated = [...prev, message];
          return updated.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.timestamp || 0);
            const dateB = new Date(b.createdAt || b.timestamp || 0);
            return dateA - dateB;
          });
        });
        // Auto-scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        // Mark as read if message is from user (not admin)
        if (message.senderRole !== 'admin' && message.senderRole !== 'Admin') {
          markMessagesAsRead(conversationId);
        }
      }
      // Always update conversation list to show latest message
      fetchConversations();
    });

    // Listen for notification of new messages
    socketInstance.on('notification:new', (data) => {
      // Update conversation list when new message arrives
      fetchConversations();
    });

    socketInstance.on('typing:user', (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
      } else {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    socketInstance.on('messages:read:update', (data) => {
      if (selectedConversation?._id === data.conversationId) {
        setMessages(prev => prev.map(msg => 
          data.messageIds.includes(msg._id)
            ? { ...msg, readBy: [...(msg.readBy || []), data.readBy] }
            : msg
        ));
      }
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      if (selectedConversation?._id) {
        socketInstance.emit('conversation:leave', { conversationId: selectedConversation._id });
      }
      socketInstance.disconnect();
    };
  }, [adminToken, selectedConversation?._id]);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!adminToken) return;
    try {
      const response = await fetch(`${ApiBaseUrl}/conversations`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages
  const fetchMessages = async (conversationId) => {
    if (!adminToken || !conversationId) return;
    try {
      setLoading(true);
      const response = await fetch(
        `${ApiBaseUrl}/conversations/${conversationId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        // Sort messages by createdAt (oldest first)
        const sortedMessages = Array.isArray(data.data) 
          ? data.data.sort((a, b) => {
              const dateA = new Date(a.createdAt || a.timestamp || 0);
              const dateB = new Date(b.createdAt || b.timestamp || 0);
              return dateA - dateB;
            })
          : [];
        setMessages(sortedMessages);
        // Mark messages as read (only user messages, not admin's own)
        markMessagesAsRead(conversationId);
        // Scroll to bottom after messages load
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 200);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    if (!adminToken) return;
    try {
      const response = await fetch(`${ApiBaseUrl}/chat/stats`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId) => {
    if (!adminToken) return;
    try {
      await fetch(
        `${ApiBaseUrl}/conversations/${conversationId}/read`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sending || !adminToken) return;

    const messageContent = messageInput.trim();
    setMessageInput('');
    setSending(true);
    
    try {
      if (socket && isConnected) {
        // Send via Socket.IO for real-time delivery
        socket.emit('message:send', {
          conversationId: selectedConversation._id,
          content: messageContent,
          messageType: 'text'
        });
        // Optimistically add message to UI (will be confirmed by socket response)
        const tempMessage = {
          _id: `temp-${Date.now()}`,
          content: messageContent,
          senderRole: 'admin',
          senderId: { _id: 'admin', name: 'Admin' },
          conversationId: selectedConversation._id,
          createdAt: new Date().toISOString(),
          isSending: true
        };
        setMessages(prev => [...prev, tempMessage]);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        // Fallback to REST API
        const response = await fetch(`${ApiBaseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conversationId: selectedConversation._id,
            content: messageContent,
            messageType: 'text'
          })
        });

        const data = await response.json();
        if (data.success) {
          setMessages(prev => {
            // Remove temp message if exists
            const filtered = prev.filter(m => !m.isSending);
            return [...filtered, data.data];
          });
          fetchConversations();
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          // Restore message input on error
          setMessageInput(messageContent);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message input on error
      setMessageInput(messageContent);
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping && socket && selectedConversation) {
      setIsTyping(true);
      socket.emit('typing:start', { conversationId: selectedConversation._id });
      
      setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing:stop', { conversationId: selectedConversation._id });
      }, 3000);
    }
  };

  // Select conversation
  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]); // Clear previous messages
    fetchMessages(conversation._id);
    
    if (socket && conversation._id) {
      // Join the conversation room
      socket.emit('conversation:join', { conversationId: conversation._id });
    }
  };

  // Join conversation room when selected conversation changes
  useEffect(() => {
    if (socket && selectedConversation?._id) {
      const conversationId = selectedConversation._id;
      socket.emit('conversation:join', { conversationId });
      
      // Cleanup: leave room when component unmounts or conversation changes
      return () => {
        socket.emit('conversation:leave', { conversationId });
      };
    }
  }, [socket, selectedConversation?._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages.length]);

  // Auto-refresh conversations periodically to catch new messages
  useEffect(() => {
    if (!adminToken) return;
    
    const interval = setInterval(() => {
      fetchConversations();
      // Also refresh messages if a conversation is selected
      if (selectedConversation?._id) {
        fetchMessages(selectedConversation._id);
      }
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, [adminToken, selectedConversation?._id]);

  // Refresh messages when page regains focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (selectedConversation?._id && adminToken) {
        fetchMessages(selectedConversation._id);
        fetchConversations();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedConversation?._id, adminToken]);

  // Initial fetch
  useEffect(() => {
    if (adminToken) {
      fetchConversations();
      fetchStats();
    }
  }, [adminToken]);

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants?.find(p => p.role !== 'admin');
    const participantName = otherParticipant?.userId?.name || '';
    return participantName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!adminToken) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      {/* Sidebar - Conversation List */}
      <div className="w-full lg:w-1/3 xl:w-1/4 bg-white border-r border-gray-200 flex flex-col h-full lg:h-screen">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-black text-gray-800 mb-3 sm:mb-4">Messages</h2>
          
          {/* Search */}
          <div className="relative mb-3 sm:mb-4">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3 sm:mb-4">
            <div className="bg-blue-50 rounded-lg sm:rounded-xl p-2 sm:p-2.5">
              <div className="font-black text-blue-600 text-sm sm:text-base">{stats.totalConversations}</div>
              <div className="text-gray-600 text-xs">Chats</div>
            </div>
            <div className="bg-green-50 rounded-lg sm:rounded-xl p-2 sm:p-2.5">
              <div className="font-black text-green-600 text-sm sm:text-base">{stats.totalMessages}</div>
              <div className="text-gray-600 text-xs">Messages</div>
            </div>
            <div className="bg-purple-50 rounded-lg sm:rounded-xl p-2 sm:p-2.5">
              <div className="font-black text-purple-600 text-sm sm:text-base">{stats.activeUsers}</div>
              <div className="text-gray-600 text-xs">Active</div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs font-bold text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mb-2 opacity-50" />
              <p className="text-sm sm:text-base">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const otherParticipant = conv.participants?.find(p => p.role !== 'admin');
              const unreadCount = conv.myUnreadCount || 0;
              
              return (
                <div
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`p-3 sm:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?._id === conv._id ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                      {otherParticipant?.userId?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1 gap-2">
                        <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">
                          {otherParticipant?.userId?.name || 'Unknown User'}
                        </h3>
                        {conv.lastMessage?.timestamp && (
                          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                            {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-xs sm:text-sm text-gray-600 truncate flex-1">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </p>
                        {unreadCount > 0 && (
                          <span className="bg-red-600 text-white text-xs font-black rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center flex-shrink-0">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full lg:h-screen">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {(() => {
                  const otherParticipant = selectedConversation.participants?.find(p => p.role !== 'admin');
                  return (
                    <>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                        {otherParticipant?.userId?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">
                          {otherParticipant?.userId?.name || 'Unknown User'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {otherParticipant?.userId?.email || ''}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
                  <Video className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-sm sm:text-base">No messages in this conversation</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  // Check if message is from admin (sent by admin)
                  const isOwnMessage = msg.senderRole === 'admin' || msg.senderRole === 'Admin';
                  
                  // Show avatar only for received messages (user messages) and when sender changes
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  const showAvatar = !isOwnMessage && (
                    index === 0 || 
                    prevMessage?.senderId?._id !== msg.senderId?._id ||
                    prevMessage?.senderRole === 'admin'
                  );
                  
                  // Check if next message is from same sender (to group messages)
                  const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
                  const isLastInGroup = !nextMessage || 
                    nextMessage?.senderId?._id !== msg.senderId?._id ||
                    nextMessage?.senderRole !== msg.senderRole;
                  
                  return (
                    <div
                      key={msg._id || `msg-${index}`}
                      className={`flex mb-1 sm:mb-2 ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end`}
                    >
                      {/* Avatar for received messages (left side) */}
                      {!isOwnMessage && (
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-2 flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                          {showAvatar ? (msg.senderId?.name?.charAt(0).toUpperCase() || 'U') : ''}
                        </div>
                      )}
                      
                      {/* Message bubble container */}
                      <div className={`max-w-[75%] sm:max-w-md flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        {/* Message bubble */}
                        <div
                          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-tr-sm'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-tl-sm'
                          } shadow-sm ${msg.isSending ? 'opacity-70' : ''}`}
                        >
                          <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        
                        {/* Timestamp and read receipt */}
                        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.createdAt || msg.timestamp || Date.now()).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {isOwnMessage && (
                            <span className="flex items-center">
                              {msg.readBy && Array.isArray(msg.readBy) && msg.readBy.length > 0 ? (
                                <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                              ) : (
                                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white/70" />
                              )}
                            </span>
                          )}
                          {msg.isSending && (
                            <span className="text-xs text-gray-400 italic">Sending...</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Spacer for sent messages (right side) */}
                      {isOwnMessage && <div className="w-2 sm:w-4 flex-shrink-0" />}
                    </div>
                  );
                })
              )}
              {typingUsers.size > 0 && (
                <div className="flex items-center text-gray-500 text-xs sm:text-sm italic">
                  <div className="flex gap-1 mr-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-3 sm:p-4 flex-shrink-0">
              <div className="flex items-end gap-1.5 sm:gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 hidden sm:block">
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm sm:text-base"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || sending}
                  className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors flex-shrink-0 ${
                    messageInput.trim() && !sending
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500 p-4">
              <MessageCircle className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-base sm:text-xl font-bold">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
