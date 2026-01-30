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

const AdminChat = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Auth
  const [adminToken] = useState(localStorage.getItem('token'));
  
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

  // Initialize Socket.IO
  useEffect(() => {
    if (!adminToken) {
      navigate('/login');
      return;
    }

    const socketInstance = io('https://api.madadgaar.com.pk', {
      auth: {
        token: adminToken
      },
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('message:received', (data) => {
      if (selectedConversation?._id === data.message.conversationId) {
        setMessages(prev => [...prev, data.message]);
        markMessagesAsRead(data.message.conversationId);
      }
      // Update conversation list
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
      socketInstance.disconnect();
    };
  }, [adminToken, navigate]);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch('https://api.madadgaar.com.pk/api/conversations', {
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
    try {
      const response = await fetch(
        `https://api.madadgaar.com.pk/api/conversations/${conversationId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
        markMessagesAsRead(conversationId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('https://api.madadgaar.com.pk/api/chat/stats', {
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
    try {
      await fetch(
        `https://api.madadgaar.com.pk/api/conversations/${conversationId}/read`,
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
    if (!messageInput.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      if (socket && isConnected) {
        // Send via Socket.IO for real-time delivery
        socket.emit('message:send', {
          conversationId: selectedConversation._id,
          content: messageInput.trim(),
          messageType: 'text'
        });
      } else {
        // Fallback to REST API
        const response = await fetch('https://api.madadgaar.com.pk/api/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conversationId: selectedConversation._id,
            content: messageInput.trim(),
            messageType: 'text'
          })
        });

        const data = await response.json();
        if (data.success) {
          setMessages(prev => [...prev, data.data]);
          fetchConversations();
        }
      }
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
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
    fetchMessages(conversation._id);
    
    if (socket && conversation._id) {
      socket.emit('conversation:join', { conversationId: conversation._id });
    }
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, []);

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Conversation List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Messages</h2>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-blue-50 rounded p-2">
              <div className="font-semibold text-blue-600">{stats.totalConversations}</div>
              <div className="text-gray-600">Chats</div>
            </div>
            <div className="bg-green-50 rounded p-2">
              <div className="font-semibold text-green-600">{stats.totalMessages}</div>
              <div className="text-gray-600">Messages</div>
            </div>
            <div className="bg-purple-50 rounded p-2">
              <div className="font-semibold text-purple-600">{stats.activeUsers}</div>
              <div className="text-gray-600">Active</div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mt-2 flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle className="w-16 h-16 mb-2 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const otherParticipant = conv.participants?.find(p => p.role !== 'admin');
              const unreadCount = conv.myUnreadCount || 0;
              
              return (
                <div
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?._id === conv._id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold mr-3">
                      {otherParticipant?.userId?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {otherParticipant?.userId?.name || 'Unknown User'}
                        </h3>
                        {conv.lastMessage?.timestamp && (
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 truncate">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </p>
                        {unreadCount > 0 && (
                          <span className="ml-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex items-center">
                {(() => {
                  const otherParticipant = selectedConversation.participants?.find(p => p.role !== 'admin');
                  return (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold mr-3">
                        {otherParticipant?.userId?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {otherParticipant?.userId?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {otherParticipant?.userId?.email || ''}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No messages in this conversation</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwnMessage = msg.senderRole === 'admin';
                  const showAvatar = index === 0 || messages[index - 1]?.senderId?._id !== msg.senderId?._id;
                  
                  return (
                    <div
                      key={msg._id}
                      className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwnMessage && showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold mr-2 flex-shrink-0">
                          {msg.senderId?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      {!isOwnMessage && !showAvatar && <div className="w-8 mr-2" />}
                      
                      <div className={`max-w-md ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-900'
                          } shadow-sm`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-xs text-gray-500">
                            {new Date(msg.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {isOwnMessage && (
                            <span>
                              {msg.readBy?.length > 1 ? (
                                <CheckCheck className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Check className="w-4 h-4 text-gray-400" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {typingUsers.size > 0 && (
                <div className="flex items-center text-gray-500 text-sm italic">
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
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ImageIcon className="w-5 h-5 text-gray-600" />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || sending}
                  className={`p-2 rounded-lg transition-colors ${
                    messageInput.trim() && !sending
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
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
            <div className="text-center text-gray-500">
              <MessageCircle className="w-24 h-24 mx-auto mb-4 opacity-50" />
              <p className="text-xl">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
