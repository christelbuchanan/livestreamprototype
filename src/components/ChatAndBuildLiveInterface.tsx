import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Video, Mic, MicOff, X, Users, ChevronDown, ChevronUp, Settings, Send, Smile, Maximize2, Volume2 } from 'lucide-react';

const ChatAndBuildLiveInterface = () => {
  const [isLive, setIsLive] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showCameraPreview, setShowCameraPreview] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, user: 'John D.', text: 'This is looking great! Could you add dark mode support?', time: new Date().toISOString() },
    { id: 2, user: 'Sarah L.', text: 'How would you handle local storage to persist tasks?', time: new Date().toISOString() },
    { id: 3, user: 'Mike T.', text: '👍 Love the clean UI!', time: new Date().toISOString() }
  ]);
  
  const videoRef = useRef(null);
  const pipVideoRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // Initialize speech recognition (mock implementation for prototype)
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          setChatInput(transcript);
        }
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  // Toggle speech recognition
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };
  
  // Mock function for text-to-speech
  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Handle auto-speak for new messages
  useEffect(() => {
    if (autoSpeakEnabled && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      speakResponse(`${latestMessage.user} says: ${latestMessage.text}`);
    }
  }, [messages, autoSpeakEnabled]);
  
  // Initialize camera for PiP
  useEffect(() => {
    if (isLive && showCameraPreview) {
      // In a real implementation, this would access the user's camera
      // For prototype, we'll simulate with a placeholder
      if (videoRef.current) {
        // Mock video stream setup
        // In a real app, this would be: navigator.mediaDevices.getUserMedia({video: true})
        console.log('Camera would be initialized here');
      }
    }
  }, [isLive, showCameraPreview]);
  
  // Handle Picture-in-Picture
  const togglePiP = async () => {
    if (!videoRef.current) return;
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      } else if (document.pictureInPictureEnabled) {
        // In a real implementation with actual video:
        // await videoRef.current.requestPictureInPicture();
        
        // For prototype, we'll use the PiP video element
        if (pipVideoRef.current) {
          await pipVideoRef.current.requestPictureInPicture();
          setIsPiPActive(true);
        }
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  };
  
  const toggleLive = () => {
    setIsLive(!isLive);
    if (!isLive) {
      // Would start the stream in a real implementation
    }
  };
  
  const sendMessage = () => {
    if (chatInput.trim()) {
      const newMessage = {
        id: Date.now(),
        user: 'You',
        text: chatInput,
        time: new Date().toISOString()
      };
      
      setMessages([...messages, newMessage]);
      setChatInput('');
      
      // Simulate response (in a real app, this might come from a server)
      setTimeout(() => {
        const responseMessage = {
          id: Date.now() + 1,
          user: 'AI Assistant',
          text: `I've noted your message: "${chatInput}"`,
          time: new Date().toISOString()
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 1000);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background font-sans overflow-hidden">
      {/* Hidden PiP video element (would contain actual camera feed in real implementation) */}
      <video 
        ref={pipVideoRef}
        className="hidden"
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        muted
        autoPlay
        loop
      />
      
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-soft py-3 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">ChatAndBuild</div>
        </div>
        
        <div className="flex items-center space-x-4">
          {isLive ? (
            <div className="flex items-center">
              <div className="flex items-center bg-red-50 rounded-full px-3 py-1 text-sm transition-all duration-300 hover:bg-red-100">
                <div className="h-2 w-2 rounded-full bg-red-600 mr-2 animate-pulse"></div>
                <span className="font-semibold text-red-600 mr-2">LIVE</span>
                <Users size={14} className="text-gray-600 mr-1" />
                <span className="text-gray-600">42</span>
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
                  className="ml-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  {isSettingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              
              {/* Stream Settings Dropdown */}
              {isSettingsOpen && (
                <div className="absolute top-12 right-4 bg-white shadow-soft rounded-md p-2 w-48 z-30 animate-fadeIn">
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={() => setShowCameraPreview(!showCameraPreview)}
                      className="flex items-center text-sm p-2 hover:bg-gray-100 rounded transition-colors duration-150"
                    >
                      <Video size={14} className="mr-2" />
                      {showCameraPreview ? 'Hide Camera' : 'Show Camera'}
                    </button>
                    <button 
                      onClick={toggleListening}
                      className="flex items-center text-sm p-2 hover:bg-gray-100 rounded transition-colors duration-150"
                    >
                      {isListening ? <MicOff size={14} className="mr-2" /> : <Mic size={14} className="mr-2" />}
                      {isListening ? 'Disable Voice Input' : 'Enable Voice Input'}
                    </button>
                    <button 
                      onClick={() => setAutoSpeakEnabled(!autoSpeakEnabled)}
                      className="flex items-center text-sm p-2 hover:bg-gray-100 rounded transition-colors duration-150"
                    >
                      <Volume2 size={14} className="mr-2" />
                      {autoSpeakEnabled ? 'Disable Auto-Speak' : 'Enable Auto-Speak'}
                    </button>
                    <button className="flex items-center text-sm p-2 hover:bg-gray-100 rounded transition-colors duration-150">
                      <Settings size={14} className="mr-2" />
                      Advanced Settings
                    </button>
                    <hr className="my-1" />
                    <button 
                      onClick={toggleLive}
                      className="flex items-center text-sm p-2 text-red-600 hover:bg-red-50 rounded transition-colors duration-150"
                    >
                      <X size={14} className="mr-2" />
                      End Stream
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={toggleLive}
              className="bg-primary-600 hover:bg-primary-700 text-white py-1.5 px-4 rounded-md flex items-center transition-colors duration-200 transform hover:scale-105"
            >
              <Video size={16} className="mr-1.5" />
              Go Live
            </button>
          )}
          
          <div className="h-8 w-8 bg-primary-500 rounded-full overflow-hidden ring-2 ring-primary-200 hover:ring-primary-300 transition-all duration-200">
            <img 
              src="https://via.placeholder.com/32"
              alt="User Profile"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel - Chat with AI */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-background">
            <div className="bg-white rounded-lg p-3 shadow-soft mb-4 transform transition-all duration-200 hover:shadow-md">
              <p className="text-sm text-gray-800">I'd like to create a todo app with React and Tailwind CSS. It should have task creation, completion toggling, and deletion functionality.</p>
            </div>
            <div className="bg-primary-50 rounded-lg p-3 shadow-soft transform transition-all duration-200 hover:shadow-md">
              <p className="text-sm text-gray-800">I'll create a React Todo app with Tailwind CSS styling. This will include task creation, completion toggling, and deletion functionality.</p>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-primary-300 focus-within:border-primary-300 transition-all duration-200">
              <input 
                type="text"
                placeholder="Let's chat and build..."
                className="flex-1 outline-none text-sm"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button className="ml-2 text-primary-500 hover:text-primary-600 transition-colors duration-150">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Build Environment */}
        <div className="flex-1 flex flex-col">
          <div className="flex border-b border-gray-200 bg-white">
            <div className="px-4 py-2 font-medium text-sm border-b-2 border-primary-600 text-primary-700 transition-colors duration-200 hover:bg-primary-50">Code</div>
            <div className="px-4 py-2 font-medium text-sm text-gray-500 transition-colors duration-200 hover:bg-gray-50">Preview</div>
          </div>
          <div className="flex-1 bg-gray-900 overflow-y-auto p-4 font-mono text-sm">
            <pre className="text-gray-300">
{`import React, { useState } from 'react';

function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  
  const addTask = () => {
    if (input) {
      setTasks([...tasks, { 
        id: Date.now(), 
        text: input, 
        completed: false 
      }]);
      setInput('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, completed: !task.completed } 
        : task
    ));
  };
  
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">My Todo List</h1>
      
      <div className="flex mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 p-2 rounded-l"
          placeholder="Add a new task"
        />
        <button 
          onClick={addTask}
          className="bg-primary-500 text-white px-4 rounded-r"
        >
          Add
        </button>
      </div>
      
      <ul>
        {tasks.map(task => (
          <li 
            key={task.id}
            className="flex items-center justify-between p-3 border-b"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="mr-2"
              />
              <span className={task.completed ? 'line-through text-gray-400' : ''}>
                {task.text}
              </span>
            </div>
            <button 
              onClick={() => deleteTask(task.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;`}
            </pre>
          </div>
        </div>

        {/* Camera Preview (Floating) */}
        {isLive && showCameraPreview && (
          <div className="absolute bottom-4 right-4 w-64 rounded-lg overflow-hidden shadow-lg z-20 bg-black animate-slideUp">
            <div className="relative">
              <video 
                ref={videoRef}
                poster="https://via.placeholder.com/256x144"
                className="w-full h-auto"
              />
              <div className="absolute bottom-2 right-2 flex space-x-2">
                <button 
                  onClick={toggleListening}
                  className="bg-gray-800 bg-opacity-70 hover:bg-opacity-90 p-1 rounded transition-colors duration-150"
                >
                  {isListening ? 
                    <MicOff size={16} className="text-red-400" /> : 
                    <Mic size={16} className="text-white" />
                  }
                </button>
                <button 
                  onClick={togglePiP}
                  className="bg-gray-800 bg-opacity-70 hover:bg-opacity-90 p-1 rounded transition-colors duration-150"
                >
                  <Maximize2 size={16} className={isPiPActive ? "text-primary-400" : "text-white"} />
                </button>
                <button 
                  onClick={() => setShowCameraPreview(false)}
                  className="bg-gray-800 bg-opacity-70 hover:bg-opacity-90 p-1 rounded transition-colors duration-150"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
              
              {/* PiP Status Indicator */}
              {isPiPActive && (
                <div className="absolute top-2 left-2 bg-primary-600 bg-opacity-80 text-white text-xs px-2 py-1 rounded-full">
                  PiP Active
                </div>
              )}
              
              {/* Voice Recognition Status */}
              {isListening && (
                <div className="absolute top-2 right-2 flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                  <span className="text-white text-xs">Listening</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Sidebar Toggle */}
        {isLive && (
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`absolute top-4 right-4 z-20 rounded-full p-2 shadow-soft transition-all duration-200 hover:shadow-md ${isChatOpen ? 'bg-primary-100' : 'bg-white'}`}
          >
            <MessageCircle size={20} className={isChatOpen ? 'text-primary-600' : 'text-gray-600'} />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-pulse">
              {messages.length}
            </div>
          </button>
        )}

        {/* Viewer Chat Sidebar */}
        {isLive && isChatOpen && (
          <div className="absolute top-0 right-0 h-full w-64 bg-white shadow-soft z-10 flex flex-col border-l border-gray-200 animate-slideIn">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium">Live Chat</h3>
              <div className="flex items-center">
                <button 
                  onClick={() => setAutoSpeakEnabled(!autoSpeakEnabled)}
                  className={`mr-2 p-1 rounded-full transition-colors duration-150 ${autoSpeakEnabled ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-500'}`}
                  title={autoSpeakEnabled ? "Auto-speak enabled" : "Enable auto-speak"}
                >
                  <Volume2 size={16} />
                </button>
                <button 
                  onClick={() => setIsChatOpen(false)} 
                  className="hover:bg-gray-100 p-1 rounded-full transition-colors duration-150"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3">
              {messages.map((message, index) => (
                <div key={message.id} className="mb-3 animate-fadeIn" style={{ animationDelay: `${0.1 * index}s` }}>
                  <div className="font-medium text-xs text-gray-500 mb-1">{message.user}</div>
                  <div className="bg-gray-100 rounded-lg p-2 text-sm hover:bg-gray-200 transition-colors duration-200">
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-3 border-t border-gray-200">
              <div className="flex">
                <button 
                  onClick={toggleListening}
                  className={`p-2 rounded-l-md border border-gray-300 border-r-0 transition-colors duration-150 ${isListening ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    placeholder="Send a message or press mic to speak"
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-300 focus:border-primary-300 transition-all duration-200"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button className="absolute right-1 top-1/2 transform -translate-y-1/2 hover:text-gray-700 transition-colors duration-150">
                    <Smile size={16} className="text-gray-400" />
                  </button>
                </div>
                <button 
                  onClick={sendMessage}
                  className="bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-r-md transition-colors duration-150"
                >
                  <Send size={14} />
                </button>
              </div>
              
              {/* Voice Recognition Active Indicator */}
              {isListening && (
                <div className="mt-2 bg-primary-50 rounded-md p-2 text-xs flex items-center animate-pulse">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-primary-700 font-medium">Listening...</span>
                  <span className="ml-2 text-gray-500">Speak your message</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAndBuildLiveInterface;
