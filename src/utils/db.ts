import { supabase } from "@/integrations/supabase/client";
import { Session, Question, Room, Score } from "@/types/game";

export const createSession = async (name: string): Promise<Session | null> => {
  const { data, error } = await supabase
    .from('sessions')
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    startTime: new Date(data.start_time),
    endTime: data.end_time ? new Date(data.end_time) : undefined,
    questions: [],
    status: data.status
  };
};

export const getSessions = async (): Promise<Session[]> => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, questions(*)');

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return (data || []).map(session => ({
    id: session.id,
    name: session.name,
    startTime: new Date(session.start_time),
    endTime: session.end_time ? new Date(session.end_time) : undefined,
    questions: session.questions || [],
    status: session.status
  }));
};

export const getRoom = async (roomId: string): Promise<Room | null> => {
  console.log("Fetching room with ID:", roomId);
  
  if (!roomId) {
    console.error("No room ID provided");
    return null;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(roomId)) {
    console.error("Invalid room ID format:", roomId);
    return null;
  }
  
  try {
    console.log(`[ROOM DEBUG] Attempting to fetch room with ID: ${roomId}`);
    
    const { count, error: countError } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .eq('id', roomId);
    
    if (countError) {
      console.error('[ROOM DEBUG] Error checking if room exists:', countError);
    } else {
      console.log(`[ROOM DEBUG] Room count: ${count}`);
      if (count === 0) {
        console.error(`[ROOM DEBUG] Room ${roomId} definitely does not exist in the database`);
        
        const { data: anyRooms, error: anyRoomsError } = await supabase
          .from('rooms')
          .select('id')
          .limit(5);
          
        if (anyRoomsError) {
          console.error('[ROOM DEBUG] Error checking for any rooms:', anyRoomsError);
        } else {
          console.log(`[ROOM DEBUG] Found ${anyRooms.length} rooms in the database:`, anyRooms.map(r => r.id));
        }
        
        return null;
      }
    }
    
    console.log(`[ROOM DEBUG] Room exists, fetching complete data for ${roomId}`);
    
    const { data, error } = await supabase
      .from('rooms')
      .select('*, sessions(*)')
      .eq('id', roomId)
      .maybeSingle();

    if (error) {
      console.error('[ROOM DEBUG] Error fetching room with session data:', error);
      return null;
    }

    if (!data) {
      console.error(`[ROOM DEBUG] Room with ID ${roomId} exists but returned no data when fetched with sessions`);
      return null;
    }

    console.log("[ROOM DEBUG] Room found with complete data:", data);
    
    return {
      id: data.id,
      sessionId: data.session_id,
      name: data.name,
      tokensLeft: data.tokens_left,
      currentDoor: data.current_door,
      score: data.score,
      sessionStatus: data.sessions?.status
    };
  } catch (err) {
    console.error('[ROOM DEBUG] Unexpected error in getRoom function:', err);
    return null;
  }
};

export const createRoom = async (sessionId: string, roomName: string, roomId?: string): Promise<Room | null> => {
  console.log(`[ROOM DEBUG] Creating room with name: ${roomName}, sessionId: ${sessionId}, roomId: ${roomId || 'auto-generated'}`);
  
  const roomData: {
    session_id: string;
    name: string;
    id?: string;
  } = {
    session_id: sessionId,
    name: roomName,
  };

  if (roomId) {
    roomData.id = roomId;
  }

  const { data, error } = await supabase
    .from('rooms')
    .insert([roomData])
    .select()
    .single();

  if (error) {
    console.error('[ROOM DEBUG] Error creating room:', error);
    return null;
  }

  console.log('[ROOM DEBUG] Room created successfully:', data);
  
  return {
    id: data.id,
    sessionId: data.session_id,
    name: data.name,
    tokensLeft: data.tokens_left,
    currentDoor: data.current_door,
    score: data.score
  };
};

export const addQuestionsToSession = async (sessionId: string, questions: Omit<Question, 'id'>[]): Promise<boolean> => {
  const { error } = await supabase
    .from('questions')
    .insert(
      questions.map(q => ({
        session_id: sessionId,
        text: q.text,
        answer: q.answer,
      }))
    );

  if (error) {
    console.error('Error adding questions:', error);
    return false;
  }

  return true;
};

export const updateQuestionImage = async (questionId: number, imageUrl: string): Promise<boolean> => {
  const { error } = await supabase
    .from('questions')
    .update({ image: imageUrl })
    .eq('id', questionId);

  if (error) {
    console.error('Error updating question image:', error);
    return false;
  }

  return true;
};

export const getSessionQuestions = async (sessionId: string): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error fetching session questions:', error);
    return [];
  }

  return data.map(q => ({
    id: q.id,
    text: q.text,
    answer: q.answer,
    image: q.image
  }));
};

export const uploadQuestionImage = async (file: File, questionId: number): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${questionId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase
    .storage
    .from('question_images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  const { data: urlData } = supabase
    .storage
    .from('question_images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

export const updateGameScore = async (roomId: string, score: number): Promise<boolean> => {
  const { error } = await supabase
    .from('rooms')
    .update({ score })
    .eq('id', roomId);

  if (error) {
    console.error('Error updating score:', error);
    return false;
  }

  return true;
};

export const deleteSession = async (sessionId: string): Promise<boolean> => {
  const { error: roomsError } = await supabase
    .from('rooms')
    .delete()
    .eq('session_id', sessionId);
  
  if (roomsError) {
    console.error('Error deleting rooms:', roomsError);
    return false;
  }

  const { error: questionsError } = await supabase
    .from('questions')
    .delete()
    .eq('session_id', sessionId);
  
  if (questionsError) {
    console.error('Error deleting questions:', questionsError);
    return false;
  }

  const { error: sessionError } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId);
  
  if (sessionError) {
    console.error('Error deleting session:', sessionError);
    return false;
  }

  return true;
};

export const updateSessionStatus = async (sessionId: string, status: 'pending' | 'active' | 'completed'): Promise<boolean> => {
  const { error } = await supabase
    .from('sessions')
    .update({ status })
    .eq('id', sessionId);
  
  if (error) {
    console.error('Error updating session status:', error);
    return false;
  }
  
  return true;
};

export const getSessionStatus = async (sessionId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('sessions')
    .select('status')
    .eq('id', sessionId)
    .maybeSingle();
  
  if (error || !data) {
    console.error('Error fetching session status:', error);
    return null;
  }
  
  return data.status;
};
