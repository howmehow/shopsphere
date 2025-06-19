import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import { API_BASE_URL } from '../constants';
import { 
  ChatBubbleLeftRightIcon, 
  ArrowUturnLeftIcon, 
  HomeIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  message: string;
  message_type: string;
  created_at: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  username: string;
  role: string;
}

const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  
  const { token } = useAuth();

  
  const getApiHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  
  const initializeChatRoom = async () => {
    if (!user || !chatId) return;

    try {
      setLoading(true);
      
      
      const productId = chatId;
      
      
      const productResponse = await fetch(`${API_BASE_URL}/products/${productId}`, {
        headers: getApiHeaders(),
      });

      if (!productResponse.ok) {
        throw new Error('Product not found');
      }

      const productData = await productResponse.json();
      const sellerId = productData.sellerId;
      
      
      await createDirectChatRoom(sellerId, productId);
    } catch (error) {
      console.error('Failed to initialize chat room:', error);
      setError('Failed to load chat room. Please make sure the product exists.');
    } finally {
      setLoading(false);
    }
  };

  const createDirectChatRoom = async (sellerId: string, productId: string) => {
    try {
      
      
      const roomsResponse = await fetch(`${API_BASE_URL}/chat/rooms`, {
        headers: getApiHeaders(),
      });

      
      let productName = 'Product';
      try {
        const productResponse = await fetch(`${API_BASE_URL}/products/${productId}`, {
          headers: getApiHeaders(),
        });
        if (productResponse.ok) {
          const productData = await productResponse.json();
          productName = productData.name || 'Product';
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }

      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json();
        const existingRoom = roomsData.chat_rooms?.find((room: ChatRoom) => 
          room.name === `Chat about ${productName}` ||
          room.name.includes(productId)
        );
        
        if (existingRoom) {
          await loadChatRoom(existingRoom.id);
          return; 
        }
      }

      
      const createRoomResponse = await fetch(`${API_BASE_URL}/chat/rooms`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          name: `Chat about ${productName}`,
          type: 'direct',
          participants: [sellerId] 
        }),
      });

      if (!createRoomResponse.ok) {
        throw new Error('Failed to create chat room');
      }

      const newRoom = await createRoomResponse.json();
      
      
      await loadChatRoom(newRoom.id);
    } catch (error) {
      console.error('Error creating direct chat room:', error);
      throw error;
    }
  };

  const loadChatRoom = async (roomId: string) => {
    try {
      
      const roomResponse = await fetch(`${API_BASE_URL}/chat/room/${roomId}`, {
        headers: getApiHeaders(),
      });

      if (!roomResponse.ok) {
        throw new Error('Failed to load chat room');
      }

      const roomData = await roomResponse.json();
      setChatRoom(roomData.chat_room);
      setParticipants(roomData.participants || []);

      
      const messagesResponse = await fetch(`${API_BASE_URL}/chat/room/${roomId}/messages`, {
        headers: getApiHeaders(),
      });

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.messages || []);
      }
    } catch (error) {
      console.error('Error loading chat room:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatRoom || !user || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      
      const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          room_id: chatRoom.id,
          message: messageText,
          message_type: 'text'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const sentMessage = await response.json();
      
      
      setMessages(prev => [...prev, sentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      setNewMessage(messageText);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  
  const refreshMessages = async () => {
    if (!chatRoom) return;

    try {
      const messagesResponse = await fetch(`${API_BASE_URL}/chat/room/${chatRoom.id}/messages`, {
        headers: getApiHeaders(),
      });

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        const newMessages = messagesData.messages || [];
        
        
        if (newMessages.length !== messages.length) {
          setMessages(newMessages);
        }
      }
    } catch (error) {
      console.error('Error refreshing messages:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    initializeChatRoom();
  }, [user, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  
  useEffect(() => {
    if (!chatRoom) return;

    const interval = setInterval(refreshMessages, 3000); 
    return () => clearInterval(interval);
  }, [chatRoom, messages.length]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to access chat</p>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ChatBubbleLeftRightIcon className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <Button variant="secondary" onClick={() => navigate('/')}>
              Go Home
            </Button>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      
      <div className="bg-indigo-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {chatRoom?.type === 'group' ? (
              <UserGroupIcon className="w-6 h-6" />
            ) : (
              <UserIcon className="w-6 h-6" />
            )}
            <div>
              <h1 className="text-lg font-semibold">{chatRoom?.name}</h1>
              <p className="text-indigo-200 text-sm">
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/')}
              leftIcon={<HomeIcon className="w-4 h-4" />}
            >
              Home
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(-1)}
              leftIcon={<ArrowUturnLeftIcon className="w-4 h-4" />}
            >
              Wróć
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 border-b">
        <div className="flex flex-wrap gap-2">
          {participants.map((participant) => (
            <span
              key={participant.id}
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                participant.role === 'seller'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {participant.username} ({participant.role})
            </span>
          ))}
        </div>
      </div>

      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.user_id === user.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.user_id === user.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.user_id !== user.id && (
                <p className="text-xs font-medium mb-1 opacity-75">
                  {message.user_name}
                </p>
              )}
              <p className="text-sm">{message.message}</p>
              <p
                className={`text-xs mt-1 ${
                  message.user_id === user.id
                    ? 'text-indigo-200'
                    : 'text-gray-500'
                }`}
              >
                {formatTime(message.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Twoja wiadomość..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            leftIcon={<PaperAirplaneIcon className="w-4 h-4" />}
          >
            {sending ? 'Wyślij...' : 'Wyślij'}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Naciśnij Enter żeby wysłać wiadomość • Wiadomości są zapisywane
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
