import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, Button, Badge, Progress, Modal } from '@/components/ui';
import { useFocusFuelStore } from '@/store';

export interface FocusRoomParticipant {
  id: string;
  name: string;
  avatar?: string;
  status: 'active' | 'break' | 'away' | 'completed';
  focusTime: number; // in minutes
  currentTask?: string;
  joinedAt: string;
  lastActivity: string;
}

export interface FocusRoom {
  id: string;
  name: string;
  description?: string;
  hostId: string;
  participants: FocusRoomParticipant[];
  maxParticipants: number;
  sessionDuration: number; // in minutes
  breakDuration: number; // in minutes
  isActive: boolean;
  startedAt?: string;
  endsAt?: string;
  currentPhase: 'waiting' | 'focus' | 'break' | 'completed';
  settings: {
    allowChat: boolean;
    showParticipantStatus: boolean;
    enableGamification: boolean;
    autoStart: boolean;
  };
}

export interface FocusRoomProps {
  roomId?: string; // If provided, join existing room
  onJoin?: (roomId: string) => void;
  onLeave?: () => void;
  className?: string;
}

const FocusRoom: React.FC<FocusRoomProps> = ({
  roomId,
  onJoin,
  onLeave,
  className
}) => {
  const [isHost, setIsHost] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<FocusRoom | null>(null);
  const [localParticipant, setLocalParticipant] = useState<FocusRoomParticipant | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const store = useFocusFuelStore();

  // Mock data for demonstration
  const mockRooms = useMemo(() => [
    {
      id: 'room_1',
      name: 'Morning Focus Session',
      description: 'Early morning deep work session',
      hostId: 'user_1',
      participants: [
        {
          id: 'user_1',
          name: 'Alex Chen',
          status: 'active' as const,
          focusTime: 45,
          currentTask: 'Review quarterly reports',
          joinedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          lastActivity: new Date().toISOString()
        },
        {
          id: 'user_2',
          name: 'Sarah Johnson',
          status: 'active' as const,
          focusTime: 42,
          currentTask: 'Write blog post',
          joinedAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
          lastActivity: new Date().toISOString()
        }
      ],
      maxParticipants: 8,
      sessionDuration: 90,
      breakDuration: 15,
      isActive: true,
      startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      endsAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      currentPhase: 'focus' as const,
      settings: {
        allowChat: true,
        showParticipantStatus: true,
        enableGamification: true,
        autoStart: false
      }
    }
  ], []);

  useEffect(() => {
    if (roomId) {
      const room = mockRooms.find(r => r.id === roomId);
      if (room) {
        setCurrentRoom(room);
        setIsHost(room.hostId === 'current_user');
        
        // Join as participant
        const participant: FocusRoomParticipant = {
          id: 'current_user',
          name: 'You',
          status: 'active',
          focusTime: 0,
          joinedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        };
        setLocalParticipant(participant);
      }
    }
  }, [roomId, mockRooms]);

  const handleCreateRoom = (roomData: any) => {
    const newRoom: FocusRoom = {
      id: `room_${Date.now()}`,
      name: roomData.name,
      description: roomData.description,
      hostId: 'current_user',
      participants: [],
      maxParticipants: roomData.maxParticipants || 8,
      sessionDuration: roomData.sessionDuration || 90,
      breakDuration: roomData.breakDuration || 15,
      isActive: false,
      currentPhase: 'waiting',
      settings: {
        allowChat: roomData.allowChat !== false,
        showParticipantStatus: roomData.showParticipantStatus !== false,
        enableGamification: roomData.enableGamification !== false,
        autoStart: roomData.autoStart || false
      }
    };
    
    setCurrentRoom(newRoom);
    setIsHost(true);
    setShowCreateModal(false);
    onJoin?.(newRoom.id);
  };

  const handleJoinRoom = (roomId: string) => {
    const room = mockRooms.find(r => r.id === roomId);
    if (room && room.participants.length < room.maxParticipants) {
      setCurrentRoom(room);
      setIsHost(false);
      setShowJoinModal(false);
      onJoin?.(roomId);
    }
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setLocalParticipant(null);
    setIsHost(false);
    onLeave?.();
  };

  const handleStartSession = () => {
    if (currentRoom && isHost) {
      setCurrentRoom(prev => prev ? {
        ...prev,
        isActive: true,
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + prev.sessionDuration * 60 * 1000).toISOString(),
        currentPhase: 'focus'
      } : null);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && currentRoom) {
      const message = {
        id: `msg_${Date.now()}`,
        senderId: 'current_user',
        senderName: 'You',
        content: newMessage,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'focus':
        return 'bg-green-100 text-green-800';
      case 'break':
        return 'bg-blue-100 text-blue-800';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'break':
        return 'bg-blue-500';
      case 'away':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateSessionProgress = () => {
    if (!currentRoom || !currentRoom.startedAt || !currentRoom.endsAt) return 0;
    
    const now = new Date().getTime();
    const start = new Date(currentRoom.startedAt).getTime();
    const end = new Date(currentRoom.endsAt).getTime();
    
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  };

  const renderCreateRoomModal = () => (
    <Modal
      isOpen={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      title="Create Focus Room"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Name *
          </label>
          <input
            type="text"
            placeholder="Enter room name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            id="roomName"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            placeholder="Enter room description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            id="roomDescription"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Duration (min)
            </label>
            <input
              type="number"
              defaultValue={90}
              min={15}
              max={240}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              id="sessionDuration"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Break Duration (min)
            </label>
            <input
              type="number"
              defaultValue={15}
              min={5}
              max={30}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              id="breakDuration"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Participants
            </label>
            <input
              type="number"
              defaultValue={8}
              min={2}
              max={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              id="maxParticipants"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked={true}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              id="allowChat"
            />
            <span className="ml-2 text-sm text-gray-700">Allow chat</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked={true}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              id="showParticipantStatus"
            />
            <span className="ml-2 text-sm text-gray-700">Show participant status</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked={true}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              id="enableGamification"
            />
            <span className="ml-2 text-sm text-gray-700">Enable gamification</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked={false}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              id="autoStart"
            />
            <span className="ml-2 text-sm text-gray-700">Auto-start when full</span>
          </label>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setShowCreateModal(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const name = (document.getElementById('roomName') as HTMLInputElement)?.value;
              const description = (document.getElementById('roomDescription') as HTMLTextAreaElement)?.value;
              const sessionDuration = parseInt((document.getElementById('sessionDuration') as HTMLInputElement)?.value || '90');
              const breakDuration = parseInt((document.getElementById('breakDuration') as HTMLInputElement)?.value || '15');
              const maxParticipants = parseInt((document.getElementById('maxParticipants') as HTMLInputElement)?.value || '8');
              const allowChat = (document.getElementById('allowChat') as HTMLInputElement)?.checked;
              const showParticipantStatus = (document.getElementById('showParticipantStatus') as HTMLInputElement)?.checked;
              const enableGamification = (document.getElementById('enableGamification') as HTMLInputElement)?.checked;
              const autoStart = (document.getElementById('autoStart') as HTMLInputElement)?.checked;
              
              if (name) {
                handleCreateRoom({
                  name,
                  description,
                  sessionDuration,
                  breakDuration,
                  maxParticipants,
                  allowChat,
                  showParticipantStatus,
                  enableGamification,
                  autoStart
                });
              }
            }}
          >
            Create Room
          </Button>
        </div>
      </div>
    </Modal>
  );

  const renderJoinRoomModal = () => (
    <Modal
      isOpen={showJoinModal}
      onClose={() => setShowJoinModal(false)}
      title="Join Focus Room"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Code
          </label>
          <input
            type="text"
            placeholder="Enter room code"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            id="roomCode"
          />
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Available Rooms</h4>
          {mockRooms.map(room => (
            <div
              key={room.id}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => handleJoinRoom(room.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">{room.name}</h5>
                  <p className="text-sm text-gray-600">{room.description}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={getPhaseColor(room.currentPhase)}>
                    {room.currentPhase}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {room.participants.length}/{room.maxParticipants} participants
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setShowJoinModal(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );

  const renderRoomContent = () => {
    if (!currentRoom) return null;

    return (
      <div className="space-y-6">
        {/* Room Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentRoom.name}</h2>
            {currentRoom.description && (
              <p className="text-gray-600">{currentRoom.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className={getPhaseColor(currentRoom.currentPhase)}>
              {currentRoom.currentPhase}
            </Badge>
            {isHost && !currentRoom.isActive && (
              <Button onClick={handleStartSession}>
                Start Session
              </Button>
            )}
            <Button variant="outline" onClick={handleLeaveRoom}>
              Leave Room
            </Button>
          </div>
        </div>

        {/* Session Progress */}
        {currentRoom.isActive && (
          <Card>
            <CardHeader title="Session Progress" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Session Progress</span>
                    <span className="text-gray-900 font-medium">
                      {Math.round(calculateSessionProgress())}%
                    </span>
                  </div>
                  <Progress
                    value={calculateSessionProgress()}
                    variant="default"
                    className="h-3"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Session Duration:</span>
                    <span className="ml-2 font-medium">{formatTime(currentRoom.sessionDuration)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Break Duration:</span>
                    <span className="ml-2 font-medium">{formatTime(currentRoom.breakDuration)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Participants" />
            <CardContent>
              <div className="space-y-3">
                {currentRoom.participants.map(participant => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {participant.name.charAt(0)}
                          </span>
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(participant.status)}`}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{participant.name}</h4>
                        {participant.currentTask && (
                          <p className="text-sm text-gray-600">{participant.currentTask}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatTime(participant.focusTime)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {participant.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
          {currentRoom.settings.allowChat && (
            <Card>
              <CardHeader title="Chat" />
              <CardContent>
                <div className="space-y-3">
                  <div className="h-64 overflow-y-auto space-y-2">
                    {chatMessages.map(message => (
                      <div
                        key={message.id}
                        className={`p-2 rounded-lg ${
                          message.senderId === 'current_user'
                            ? 'bg-primary-100 ml-8'
                            : 'bg-gray-100 mr-8'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {message.senderName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{message.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Button onClick={handleSendMessage} size="sm">
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {!currentRoom ? (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Focus Rooms</h2>
            <p className="text-gray-600">Join collaborative focus sessions with others</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Room</h3>
                <p className="text-gray-600 mb-4">Start a new focus session and invite others to join</p>
                <Button onClick={() => setShowCreateModal(true)} fullWidth>
                  Create Focus Room
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Join Room</h3>
                <p className="text-gray-600 mb-4">Join an existing focus session with a room code</p>
                <Button onClick={() => setShowJoinModal(true)} fullWidth>
                  Join Focus Room
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        renderRoomContent()
      )}

      {renderCreateRoomModal()}
      {renderJoinRoomModal()}
    </div>
  );
};

export default FocusRoom; 