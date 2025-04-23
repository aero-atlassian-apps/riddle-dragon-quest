import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast } from '@/components/ui/use-toast';
import { getRoom, getSessionStatus } from '@/utils/db';
import { supabase } from '@/integrations/supabase/client';
import { Session, Room as RoomType } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton"
import Link from 'next/link';
import { useUser } from '@supabase/auth-helpers-react';
import { Door } from '@/components/Door';
import { calculateDoorStates } from '@/utils/gameLogic';
import { Confetti } from '@/components/Confetti';
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateRoomId } from '@/utils/roomIdGenerator';
import { Copy, Loader2 } from 'lucide-react';
import { useConfettiStore } from '@/store/confettiStore';
import { useModal } from '@/store/modalStore';
import { useGameStore } from '@/store/gameStore';

const Room: React.FC = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const [room, setRoom] = useState<RoomType | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);
  const [doorStates, setDoorStates] = useState<boolean[]>([false, false, false]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isGeneratingRoom, setIsGeneratingRoom] = useState(false);
  const [generatedRoomId, setGeneratedRoomId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDirectlyNavigated, setIsDirectlyNavigated] = useState(false);
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
	const { openModal, closeModal } = useModal();
	const { setRoomId: setStoreRoomId } = useGameStore();
  const confettiRef = useRef(null);
  const user = useUser();
	const { startConfetti, stopConfetti } = useConfettiStore();

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRoomName(e.target.value);
  };

  const handleCreateRoom = async () => {
    if (!room?.sessionId) {
      toast({
        title: "Error",
        description: "Session ID is missing. Cannot create a new room without a session.",
        variant: "destructive",
      });
      return;
    }

    if (!newRoomName.trim()) {
      toast({
        title: "Error",
        description: "Room name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingRoom(true);
    try {
      const newRoomId = generateRoomId();
      setGeneratedRoomId(newRoomId);

      const response = await fetch('/api/createRoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: room.sessionId,
          roomName: newRoomName,
          roomId: newRoomId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `New room "${newRoomName}" created successfully with ID: ${newRoomId}`,
        });
        setStoreRoomId(newRoomId);
        router.push(`/game/room?roomId=${newRoomId}`);
      } else {
        toast({
          title: "Error",
          description: data.message || 'Failed to create room',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create room',
        variant: "destructive",
      });
    } finally {
      setIsGeneratingRoom(false);
      closeModal('newRoomModal');
      setIsNewRoomModalOpen(false);
    }
  };

  const handleCopyRoomId = () => {
    if (generatedRoomId) {
      navigator.clipboard.writeText(generatedRoomId)
        .then(() => {
          setIsCopied(true);
          toast({
            title: "Copied!",
            description: "Room ID copied to clipboard.",
          });
          setTimeout(() => setIsCopied(false), 3000);
        })
        .catch(err => {
          console.error("Could not copy room ID: ", err);
          toast({
            title: "Error",
            description: "Failed to copy room ID to clipboard.",
            variant: "destructive",
          });
        });
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    const fetchRoomData = async () => {
      setIsLoading(true);
      try {
        if (roomId) {
          const currentRoom = await getRoom(roomId as string);
          if (currentRoom) {
            setRoom(currentRoom);
            setStoreRoomId(currentRoom.id);

            if (currentRoom.sessionId) {
              const status = await getSessionStatus(currentRoom.sessionId);
              setSessionStatus(status);
            } else {
              console.warn("Room does not have a session ID.");
              setSessionStatus(null);
            }
          } else {
            toast({
              title: "Error",
              description: "Room not found",
              variant: "destructive",
            });
            router.push('/');
          }
        } else {
          console.warn("Room ID is undefined.");
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
        toast({
          title: "Error",
          description: "Failed to load room data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
    setIsDirectlyNavigated(true);
  }, [router.isReady, roomId, router, setStoreRoomId]);

  useEffect(() => {
    if (sessionStatus) {
      setIsSessionActive(sessionStatus === "active");
      setIsSessionCompleted(sessionStatus === "completed");
    } else {
      setIsSessionActive(false);
      setIsSessionCompleted(false);
    }
  }, [sessionStatus]);

  useEffect(() => {
    if (room) {
      const calculatedDoorStates = calculateDoorStates(room.tokensLeft);
      setDoorStates(calculatedDoorStates);
    }
  }, [room]);

  useEffect(() => {
    if (isSessionCompleted) {
			startConfetti();
      setShowConfetti(true);
    } else {
			stopConfetti();
      setShowConfetti(false);
    }

    return () => {
			stopConfetti();
      setShowConfetti(false);
    };
  }, [isSessionCompleted, stopConfetti, startConfetti]);

  useEffect(() => {
    let channel: any;

    if (roomId && isDirectlyNavigated) {
      channel = supabase
        .channel('room-status-subscription')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
          (payload) => {
            console.log('Change received!', payload)
            if (payload.new) {
              const updatedRoom = payload.new;
              setRoom({
                id: updatedRoom.id,
                sessionId: updatedRoom.session_id,
                name: updatedRoom.name,
                tokensLeft: updatedRoom.tokens_left,
                currentDoor: updatedRoom.current_door,
                score: updatedRoom.score,
                sessionStatus: sessionStatus || null
              });
            }
          })
        .subscribe()

      supabase
        .channel('session-status-subscription')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' },
          (payload) => {
            console.log('Session status changed!', payload)
            if (room?.sessionId && payload.new.id === room?.sessionId) {
              setSessionStatus(payload.new.status);
            }
          })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [roomId, sessionStatus, isDirectlyNavigated, room?.sessionId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Skeleton className="w-[300px] h-[40px] mb-4" />
        <div className="space-y-2">
          <Skeleton className="w-[200px] h-[30px]" />
          <Skeleton className="w-[250px] h-[30px]" />
          <Skeleton className="w-[150px] h-[30px]" />
        </div>
      </div>
    );
  }

  if (!room) {
    return <div className="text-center">Room not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 relative">
      {showConfetti && <Confetti ref={confettiRef} />}

      <h1 className="text-2xl font-bold text-center mb-4 font-medieval">Welcome to {room.name}</h1>

      {sessionStatus === "active" && (
        <div className="mb-4 text-center text-green-500">
          Session is Active!
        </div>
      )}

      {sessionStatus === "pending" && (
        <div className="mb-4 text-center text-yellow-500">
          Session is Pending...
        </div>
      )}

      {sessionStatus === "completed" && (
        <div className="mb-4 text-center text-blue-500">
          Session Completed!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {doorStates.map((isOpen, index) => (
          <Door
            key={index}
            doorNumber={index + 1}
            isOpen={isOpen}
            roomId={room.id}
            currentDoor={room.currentDoor}
            isSessionActive={isSessionActive}
            isSessionCompleted={isSessionCompleted}
          />
        ))}
      </div>

      <div className="mt-4 text-center">
        <p>Tokens Left: {room.tokensLeft}</p>
        <p>Current Score: {room.score}</p>
      </div>

      <div className="mt-6 flex justify-center">
        {user ? (
          <>
            <Button onClick={() => openModal('newRoomModal')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
              Create New Room
            </Button>
            <Link href="/game/sessions" passHref>
              <Button asChild className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Go to Sessions
              </Button>
            </Link>
          </>
        ) : (
          <Link href="/login" passHref>
            <Button asChild className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Login to Create Rooms
            </Button>
          </Link>
        )}
      </div>

      <Modal title="Create a New Room" description="Enter the details for your new room." modalId="newRoomModal">
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="roomName">Room Name</Label>
            <Input
              type="text"
              id="roomName"
              placeholder="Enter room name"
              value={newRoomName}
              onChange={handleRoomNameChange}
            />
          </div>
        </div>
        <Button onClick={handleCreateRoom} disabled={isGeneratingRoom}>
          {isGeneratingRoom ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Room'
          )}
        </Button>
      </Modal>

      {generatedRoomId && (
        <div className="fixed bottom-0 left-0 w-full bg-gray-100 p-4 flex items-center justify-between border-t border-gray-200">
          <span className="text-sm text-gray-700">
            New Room ID: <span className="font-medium">{generatedRoomId}</span>
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyRoomId}
            disabled={isCopied}
          >
            {isCopied ? (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Room ID
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Room;
