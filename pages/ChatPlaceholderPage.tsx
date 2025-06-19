
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { ChatBubbleLeftRightIcon, ArrowUturnLeftIcon, HomeIcon } from '@heroicons/react/24/outline';


const ChatPlaceholderPage: React.FC = () => {
  const { chatId } = useParams<{ chatId?: string }>();

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-250px)] py-10 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 rounded-xl shadow-xl">
      <ChatBubbleLeftRightIcon className="w-28 h-28 text-indigo-500 mb-8 animate-pulse" />
      <h1 className="text-4xl font-extrabold text-gray-800 mb-5">Real-Time Chat is Brewing!</h1>
      <p className="text-gray-600 text-lg mb-10 max-w-lg leading-relaxed">
        We're crafting a seamless communication experience for you. Soon, you'll be able to connect with sellers and customers instantly.
        Thanks for your patience!
      </p>
      {chatId && 
        <p className="text-sm text-gray-500 mb-6 bg-gray-100 px-4 py-2 rounded-md">
            (Debug: Attempted to open chat context: <span className="font-semibold">{chatId}</span>)
        </p>
      }
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <Link to="/">
          <Button variant="secondary" size="lg" leftIcon={<HomeIcon className="w-5 h-5"/>}>
            Go to Homepage
          </Button>
        </Link>
        <Link to={ chatId && chatId.startsWith("seller-") ? "/seller/dashboard" : -1 as any}>
          <Button size="lg" leftIcon={<ArrowUturnLeftIcon className="w-5 h-5"/>}>
            Go Back
          </Button>
        </Link>
      </div>
       <p className="text-xs text-gray-400 mt-12">ShopSphere Chat System - Version 0.1 (Alpha)</p>
    </div>
  );
};

export default ChatPlaceholderPage;