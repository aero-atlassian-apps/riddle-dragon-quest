import { supabase } from "@/integrations/supabase/client";
import { Session, Question, Room, Score } from "@/types/game";

// Universe types
export interface Universe {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UniverseTheme {
  id: string;
  universe_id: string;
  name: string;
  description: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const createSession = async (
  name: string, 
  context?: string, 
  hintEnabled: boolean = true,
  sessionType: 'standalone' | 'universe' = 'standalone',
  universeId?: string
): Promise<Session | null> => {
  const sessionData: any = { 
    name, 
    context, 
    hint_enabled: hintEnabled,
    session_type: sessionType
  };

  // Add universe_id if provided
  if (universeId) {
    sessionData.universe_id = universeId;

    // Try to set session_order automatically to next position within the universe
    try {
      const { data: lastOrderRow, error: orderError } = await supabase
        .from('sessions')
        .select('session_order')
        .eq('universe_id', universeId)
        .order('session_order', { ascending: false })
        .limit(1)
        .single();

      if (!orderError) {
        const lastOrder = (lastOrderRow?.session_order as number | null) ?? 0;
        sessionData.session_order = (lastOrder || 0) + 1;
      }
    } catch (e) {
      console.warn('session_order not available; fallback to created_at ordering', e);
    }
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert([sessionData])
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
    createdAt: data.created_at ? new Date(data.created_at) : undefined,
    questions: [],
    status: data.status,
    context: data.context,
    hintEnabled: data.hint_enabled,
    sessionType: data.session_type || 'standalone',
    universeId: data.universe_id,
    // Optional, present if DB has session_order
    sessionOrder: (data as any).session_order
  };
};

export const getSessions = async (): Promise<Session[]> => {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *, 
      questions(*),
      universes(name, status)
    `)
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
    createdAt: session.created_at ? new Date(session.created_at) : undefined,
    questions: session.questions || [],
    status: session.status,
    context: session.context,
    hintEnabled: session.hint_enabled,
    sessionType: session.session_type || 'standalone',
    universeId: session.universe_id,
    universeName: session.universes?.name,
    universeStatus: session.universes?.status
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
      motto: data.motto,
      universeId: data.universe_id,
      troupeId: (data as any).troupe_id || undefined
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

export const createRoom = async (sessionId: string, roomName: string, roomId?: string, sigil?: string, motto?: string, tokensLeft?: number, initialTokens?: number, universeId?: string): Promise<Room | null> => {
  console.log(`[ROOM DEBUG] Creating room with name: ${roomName}, sessionId: ${sessionId}, roomId: ${roomId || 'auto-generated'}, universeId: ${universeId || 'none'}`);
  
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
    universe_id?: string;
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

  if (universeId) {
    roomData.universe_id = universeId;
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
  try {
    // First, check for existing questions in this session to avoid duplicates
    const { data: existingQuestions, error: fetchError } = await supabase
      .from('questions')
      .select('door_number')
      .eq('session_id', sessionId);

    if (fetchError) {
      console.error('Error fetching existing questions:', fetchError);
      return false;
    }

    const existingDoorNumbers = new Set(existingQuestions?.map(q => q.door_number) || []);
    
    // Find the next available door number starting from the highest existing + 1
    let nextAvailableDoor = Math.max(0, ...Array.from(existingDoorNumbers)) + 1;
    
    // Process questions and assign door numbers
    const processedQuestions = questions.map((question) => {
      let doorNumber = (question as any).door_number;
      
      // If no door number provided or it conflicts, assign the next available
      if (!doorNumber || existingDoorNumbers.has(doorNumber)) {
        doorNumber = nextAvailableDoor;
        nextAvailableDoor++;
      }
      
      // Add to existing set to prevent conflicts within this batch
      existingDoorNumbers.add(doorNumber);
      
      return {
        session_id: sessionId,
        text: question.text,
        answer: question.answer,
        door_number: doorNumber,
        hint: question.hint,
        style: question.style,
        points: question.points || 100,
        prize: question.prize
      };
    });

    const { error } = await supabase
      .from('questions')
      .insert(processedQuestions);

    if (error) {
      console.error('Error adding questions:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error in addQuestionsToSession:', err);
    return false;
  }
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

export const updateSessionName = async (sessionId: string, name: string): Promise<boolean> => {
  const newName = name.trim();
  if (!newName) return false;

  const { error } = await supabase
    .from('sessions')
    .update({ name: newName })
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating session name:', error);
    return false;
  }

  return true;
};

export const getSessionStatus = async (sessionId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('sessions')
    .select('status')
    .eq('id', sessionId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching session status:', error);
    return null;
  }
  
  console.log('Session status fetched (fresh):', data.status);
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
    hintEnabled: data.hint_enabled,
    sessionType: data.session_type || 'standalone',
    universeId: data.universe_id
  };
};

// =====================================================
// UNIVERSE OPERATIONS
// =====================================================

export const getUniverses = async (): Promise<Universe[]> => {
  const { data, error } = await supabase
    .from('universes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching universes:', error);
    return [];
  }

  return data || [];
};

// =====================================================
// ROOM OPERATIONS BY SESSION
// =====================================================

export const getRoomsBySession = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching rooms by session:', error);
    return [];
  }

  return data || [];
};

export const getUniverse = async (universeId: string): Promise<Universe | null> => {
  const { data, error } = await supabase
    .from('universes')
    .select('*')
    .eq('id', universeId)
    .single();

  if (error) {
    console.error('Error fetching universe:', error);
    return null;
  }

  return data;
};

export const createUniverse = async (universe: Omit<Universe, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<Universe | null> => {
  // Get the current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('Error getting authenticated user:', userError);
    return null;
  }

  const { data, error } = await supabase
    .from('universes')
    .insert([{
      ...universe,
      created_by: user.id
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating universe:', error);
    return null;
  }

  return data;
};

export const updateUniverse = async (universeId: string, updates: Partial<Universe>): Promise<Universe | null> => {
  const { data, error } = await supabase
    .from('universes')
    .update(updates)
    .eq('id', universeId)
    .select()
    .single();

  if (error) {
    console.error('Error updating universe:', error);
    return null;
  }

  return data;
};

export const deleteUniverse = async (universeId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('universes')
    .delete()
    .eq('id', universeId);

  if (error) {
    console.error('Error deleting universe:', error);
    return false;
  }

  return true;
};

// =====================================================
// UNIVERSE THEME OPERATIONS
// =====================================================

export const getUniverseThemes = async (universeId: string): Promise<UniverseTheme[]> => {
  const { data, error } = await supabase
    .from('universe_themes')
    .select('*')
    .eq('universe_id', universeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching universe themes:', error);
    return [];
  }

  return data || [];
};

export const createUniverseTheme = async (theme: Omit<UniverseTheme, 'id' | 'created_at' | 'updated_at'>): Promise<UniverseTheme | null> => {
  const { data, error } = await supabase
    .from('universe_themes')
    .insert([theme])
    .select()
    .single();

  if (error) {
    console.error('Error creating universe theme:', error);
    return null;
  }

  return data;
};

export const updateUniverseTheme = async (themeId: string, updates: Partial<UniverseTheme>): Promise<UniverseTheme | null> => {
  const { data, error } = await supabase
    .from('universe_themes')
    .update(updates)
    .eq('id', themeId)
    .select()
    .single();

  if (error) {
    console.error('Error updating universe theme:', error);
    return null;
  }

  return data;
};

export const deleteUniverseTheme = async (themeId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('universe_themes')
    .delete()
    .eq('id', themeId);

  if (error) {
    console.error('Error deleting universe theme:', error);
    return false;
  }

  return true;
};

// =====================================================
// UNIVERSE LEADERBOARD OPERATIONS
// =====================================================

export const getUniverseLeaderboard = async (universeId: string, limit: number = 10) => {
  // Fetch all troupes for the universe
  const { data: troupes, error: troupesError } = await supabase
    .from('universe_troupes')
    .select('*')
    .eq('universe_id', universeId);

  if (troupesError) {
    console.error('Error fetching troupes for universe leaderboard:', troupesError);
    return [];
  }

  // Fetch existing aggregated leaderboard entries
  const { data: leaderboardRows, error: leaderboardError } = await supabase
    .from('universe_leaderboard')
    .select('*')
    .eq('universe_id', universeId);

  if (leaderboardError) {
    console.error('Error fetching universe leaderboard rows:', leaderboardError);
    return [];
  }

  const leaderboardMap = new Map<string, any>();
  (leaderboardRows || []).forEach((row: any) => {
    leaderboardMap.set(row.room_name, row);
  });

  // Combine: ensure every troupe appears with score defaults when missing
  const combined = (troupes || []).map((troupe: any) => {
    const existing = leaderboardMap.get(troupe.name);
    return {
      id: existing?.id ?? troupe.id, // fallback to troupe id for stable key
      universe_id: universeId,
      room_name: troupe.name,
      total_score: existing?.total_score ?? 0,
      completion_time: existing?.completion_time ?? '',
      sessions_completed: existing?.sessions_completed ?? 0,
      last_updated: existing?.last_updated ?? null,
    };
  });

  // Sort by total_score desc, then by troupe_order asc to stabilize order among zero scores
  combined.sort((a: any, b: any) => {
    if (b.total_score !== a.total_score) return b.total_score - a.total_score;
    const troupeA = (troupes || []).find((t: any) => t.name === a.room_name);
    const troupeB = (troupes || []).find((t: any) => t.name === b.room_name);
    const orderA = troupeA?.troupe_order ?? 0;
    const orderB = troupeB?.troupe_order ?? 0;
    return orderA - orderB;
  });

  // Apply limit if provided
  const limited = typeof limit === 'number' && limit > 0 ? combined.slice(0, limit) : combined;

  return limited;
};

// =====================================================
// UNIVERSE TROUPES OPERATIONS
// =====================================================

export interface UniverseTroupe {
  id: string;
  universe_id: string;
  name: string;
  sigil: string;
  motto: string;
  initial_tokens: number;
  troupe_order: number;
  created_at: string;
  updated_at: string;
}

export const createUniverseTroupe = async (
  universeId: string, 
  name: string, 
  sigil: string = '🏰', 
  motto: string = '', 
  initialTokens: number = 3,
  order: number
): Promise<UniverseTroupe | null> => {
  console.log(`[TROUPE DEBUG] Creating troupe with name: ${name}, universeId: ${universeId}, order: ${order}`);
  
  const troupeData = {
    universe_id: universeId,
    name: name,
    sigil: sigil,
    motto: motto,
    initial_tokens: initialTokens,
    troupe_order: order
  };

  const { data, error } = await supabase
    .from('universe_troupes')
    .insert([troupeData])
    .select()
    .single();

  if (error) {
    console.error('[TROUPE DEBUG] Error creating troupe:', error);
    return null;
  }

  console.log('[TROUPE DEBUG] Troupe created successfully:', data);
  
  return data;
};

export const getUniverseTroupes = async (universeId: string): Promise<UniverseTroupe[]> => {
  const { data, error } = await supabase
    .from('universe_troupes')
    .select('*')
    .eq('universe_id', universeId)
    .order('troupe_order', { ascending: true });

  if (error) {
    console.error('Error fetching universe troupes:', error);
    return [];
  }

  return data || [];
};

// Function to automatically generate rooms from universe troupes when creating a session
export const generateRoomsFromTroupes = async (sessionId: string, universeId: string): Promise<Room[]> => {
  console.log(`[TROUPE DEBUG] Generating rooms from troupes for session: ${sessionId}, universe: ${universeId}`);
  
  // Get all troupes for this universe
  const troupes = await getUniverseTroupes(universeId);
  
  if (troupes.length === 0) {
    console.warn('[TROUPE DEBUG] No troupes found for universe:', universeId);
    return [];
  }

  const createdRooms: Room[] = [];

  // Create a room for each troupe
  for (const troupe of troupes) {
    const roomData = {
      session_id: sessionId,
      universe_id: universeId,
      troupe_id: troupe.id,
      name: troupe.name,
      sigil: troupe.sigil || '🏰',
      motto: troupe.motto || '',
      initial_tokens: troupe.initial_tokens || 3,
      tokens_left: troupe.initial_tokens || 3,
      current_door: 1,
      score: 0
    };

    const { data, error } = await supabase
      .from('rooms')
      .insert([roomData])
      .select()
      .single();

    if (error) {
      console.error('[TROUPE DEBUG] Error creating room for troupe:', troupe.name, error);
      continue;
    }

    if (data) {
      createdRooms.push(data);
      console.log(`[TROUPE DEBUG] Created room for troupe: ${troupe.name} with ID: ${data.id}`);
    }
  }

  console.log(`[TROUPE DEBUG] Successfully created ${createdRooms.length} rooms from ${troupes.length} troupes`);
  return createdRooms;
};

// =====================================================
// SCORE OPERATIONS
// =====================================================

export const insertGameScore = async (
  roomId: string,
  sessionId: string,
  roomName: string,
  totalScore: number,
  universeId?: string
): Promise<boolean> => {
  console.log(`[SCORE DEBUG] Starting insertGameScore with parameters:`, {
    roomId,
    sessionId,
    roomName,
    totalScore,
    universeId
  });
  
  // Validate required parameters
  if (!roomId || !sessionId || !roomName) {
    console.error('[SCORE DEBUG] Missing required parameters:', { roomId, sessionId, roomName });
    return false;
  }
  
  const scoreData = {
    room_id: roomId,
    session_id: sessionId,
    universe_id: universeId,
    room_name: roomName,
    total_score: totalScore
  };
  
  const { data, error } = await supabase
    .from('scores')
    .insert([scoreData])
    .select();

  if (error) {
    console.error('[SCORE DEBUG] Error inserting score record:', error);
    console.error('[SCORE DEBUG] Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return false;
  }

  console.log('[SCORE DEBUG] Score record inserted successfully:', data);
  return true;
};
// =====================================================
// UNIVERSE SESSION CHAINING HELPERS
// =====================================================

export const getUniverseSessionsOrdered = async (universeId: string): Promise<Session[]> => {
  // Order strictly by creation time to match "first added is first"
  // Use session_order only as a secondary key when present (nulls last)
  const res = await supabase
    .from('sessions')
    .select('*')
    .eq('universe_id', universeId)
    .order('created_at', { ascending: true })
    .order('session_order', { ascending: true });

  const data = res.data || [];

  return data.map(s => ({
    id: s.id,
    name: s.name,
    startTime: s.start_time ? new Date(s.start_time) : new Date(),
    endTime: s.end_time ? new Date(s.end_time) : undefined,
    createdAt: s.created_at ? new Date(s.created_at) : undefined,
    questions: [],
    status: s.status,
    context: s.context,
    hintEnabled: s.hint_enabled,
    sessionType: s.session_type || 'standalone',
    universeId: s.universe_id,
    universeName: undefined,
    universeStatus: undefined,
    sessionOrder: (s as any).session_order
  }));
};

export const getNextSessionIdInUniverse = async (
  universeId: string,
  currentSessionId: string
): Promise<string | null> => {
  const sessions = await getUniverseSessionsOrdered(universeId);
  const idx = sessions.findIndex(s => s.id === currentSessionId);
  if (idx >= 0 && idx + 1 < sessions.length) {
    return sessions[idx + 1].id;
  }
  return null;
};

export const getRoomBySessionAndTroupe = async (
  sessionId: string,
  troupeId: string
): Promise<Room | null> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('session_id', sessionId)
    .eq('troupe_id', troupeId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    sessionId: data.session_id,
    name: data.name,
    tokensLeft: data.tokens_left,
    initialTokens: data.initial_tokens || data.tokens_left,
    currentDoor: data.current_door,
    score: data.score,
    sigil: data.sigil,
    motto: data.motto,
    universeId: data.universe_id,
    troupeId: (data as any).troupe_id || undefined
  };
};

export const getNextRoomForTroupe = async (
  universeId: string,
  currentSessionId: string,
  troupeId: string
): Promise<string | null> => {
  const nextSessionId = await getNextSessionIdInUniverse(universeId, currentSessionId);
  if (!nextSessionId) return null;
  const nextRoom = await getRoomBySessionAndTroupe(nextSessionId, troupeId);
  return nextRoom?.id || null;
};
