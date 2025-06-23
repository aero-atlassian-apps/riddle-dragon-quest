import { supabase } from "@/integrations/supabase/client";
import { Session, Question, Room, Score } from "@/types/game";

export const createSession = async (name: string, context?: string, hintEnabled: boolean = true): Promise<Session | null> => {
  const { data, error } = await supabase
    .from('sessions')
    .insert([{ name, context, hint_enabled: hintEnabled }])
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
    status: data.status,
    context: data.context,
    hintEnabled: data.hint_enabled
  };
};

export const getSessions = async (): Promise<Session[]> => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, questions(*)')
    .order('start_time', { ascending: false });

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
    status: session.status,
    context: session.context,
    hintEnabled: session.hint_enabled
  }));
};

export const getRoom = async (roomId: string): Promise<Room | null> => {
  console.log("Fetching room with ID:", roomId);
  
  if (!roomId) {
    console.error("No room ID provided");
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      return null;
    }

    if (!data) {
      console.error(`Room with ID ${roomId} not found`);
      return null;
    }
    
    console.log('Room found successfully:', data);
    
    let sessionStatus = null;
    if (data.session_id) {
      // Use cache control headers to always get fresh data
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('status')
        .eq('id', data.session_id)
        .single();
        
      if (!sessionError && sessionData) {
        sessionStatus = sessionData.status;
        console.log('Session status fetched (fresh):', sessionStatus);
      }
    }
    
    return {
      id: data.id,
      sessionId: data.session_id,
      name: data.name,
      tokensLeft: data.tokens_left,
      initialTokens: data.initial_tokens || data.tokens_left, // Fallback for existing rooms
      currentDoor: data.current_door,
      score: data.score,
      sessionStatus: sessionStatus,
      sigil: data.sigil,
      motto: data.motto
    };
  } catch (err) {
    console.error('Unexpected error in getRoom function:', err);
    return null;
  }
};

export const getRoomDirectCheck = async (roomId: string): Promise<{exists: boolean, data?: any}> => {
  if (!roomId) {
    console.error("Missing room ID");
    return { exists: false };
  }

  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();
      
    if (error) {
      console.error("Direct room check error:", error);
      return { exists: false };
    }
    
    console.log("Room found successfully via direct check:", data);
    
    return { 
      exists: true, 
      data: data 
    };
  } catch (err) {
    console.error("Error in direct room check:", err);
    return { exists: false };
  }
};

export const createRoom = async (sessionId: string, roomName: string, roomId?: string, sigil?: string, motto?: string, tokensLeft?: number, initialTokens?: number): Promise<Room | null> => {
  console.log(`[ROOM DEBUG] Creating room with name: ${roomName}, sessionId: ${sessionId}, roomId: ${roomId || 'auto-generated'}`);
  
  // Initial tokens are set once at room creation and never change
  const roomInitialTokens = initialTokens !== undefined ? initialTokens : 0;
  // Tokens left start at the same value as initial tokens but will decrease with usage
  const roomTokensLeft = tokensLeft !== undefined ? tokensLeft : roomInitialTokens;
  
  const roomData: {
    session_id: string;
    name: string;
    id?: string;
    sigil: string;
    motto: string;
    tokens_left?: number;
    initial_tokens?: number;
  } = {
    session_id: sessionId,
    name: roomName,
    sigil: sigil || '🏰', // Default sigil if none provided
    motto: motto || '', // Default motto if none provided
    tokens_left: roomTokensLeft, // Current tokens available (will decrease with usage)
    initial_tokens: roomInitialTokens // Fixed value set at room creation (never changes)
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
    score: data.score,
    sigil: data.sigil,
    motto: data.motto
  };
};

export const addQuestionsToSession = async (sessionId: string, questions: Omit<Question, 'id'>[]): Promise<boolean> => {
  const { error } = await supabase
    .from('questions')
    .insert(
      questions.map((q, index) => ({
        session_id: sessionId,
        text: q.text,
        answer: q.answer,
        door_number: index + 1,
        hint: q.hint,
        points: q.points || 100,
        style: q.style,
        prize: q.prize,
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
    image: q.image,
    hint: q.hint,
    doorNumber: q.door_number,
    points: q.points,
    style: q.style,
    prize: q.prize
  }));
};

export const getSessionQuestionCount = async (sessionId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error fetching session question count:', error);
    return 1; // Default fallback to 1 doors
  }

  return count || 1; // Default fallback to 1 doors if count is null
};

export const getMaxDoorNumber = async (sessionId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('questions')
    .select('door_number')
    .eq('session_id', sessionId)
    .order('door_number', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching max door number:', error);
    return 6; // Default fallback to 6 doors
  }

  return data?.door_number || 6; // Default fallback to 6 doors
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

export const updateRoomTokens = async (roomId: string, tokensLeft: number): Promise<boolean> => {
  const { error } = await supabase
    .from('rooms')
    .update({ tokens_left: tokensLeft })
    .eq('id', roomId);

  if (error) {
    console.error('Error updating room tokens:', error);
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

export const updateSessionStatus = async (sessionId: string, status: 'en attente' | 'active' | 'terminée'): Promise<boolean> => {
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
  console.log('🔍 Fetching session status for ID:', sessionId);
  
  const { data, error } = await supabase
    .from('sessions')
    .select('status')
    .eq('id', sessionId)
    .single();
  
  if (error) {
    console.error('❌ Error fetching session status:', error);
    console.error('❌ Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return null;
  }
  
  if (!data) {
    console.warn('⚠️ No session data found for ID:', sessionId);
    return null;
  }
  
  console.log('✅ Session status fetched successfully:', data.status);
  return data.status;
};

export const getSession = async (sessionId: string): Promise<Session | null> => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching session:', error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    startTime: new Date(data.start_time),
    endTime: data.end_time ? new Date(data.end_time) : undefined,
    questions: [],
    status: data.status,
    context: data.context,
    hintEnabled: data.hint_enabled
  };
};
