import { supabase } from "@/integrations/supabase/client";
import { Question, Room, Challenge, Score } from "@/types/game";

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


export const createChallenge = async (
  name: string,
  context?: string,
  hintEnabled: boolean = true,
  challengeType: 'standalone' | 'universe' = 'standalone',
  universeId?: string
): Promise<Challenge | null> => {
  const challengeData: any = {
    name,
    context,
    hint_enabled: hintEnabled,
    challenge_type: challengeType
  };

  if (universeId) {
    challengeData.universe_id = universeId;

    try {
      const { data: lastOrderRow, error: orderError } = await supabase
        .from('challenges')
        .select('challenge_order')
        .eq('universe_id', universeId)
        .order('challenge_order', { ascending: false })
        .limit(1)
        .single();

      if (!orderError) {
        const lastOrder = (lastOrderRow?.challenge_order as number | null) ?? 0;
        challengeData.challenge_order = (lastOrder || 0) + 1;
      }
    } catch (e) {
      console.warn('challenge_order not available on challenges; fallback to created_at ordering', e);
    }
  }

  const { data, error } = await supabase
    .from('challenges')
    .insert([challengeData])
    .select()
    .single();

  if (error) {
    console.error('Error creating challenge:', error);
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
    challengeType: (data as any).challenge_type || 'standalone',
    universeId: data.universe_id,
    challengeOrder: (data as any).challenge_order
  } as Challenge;
};

// Challenge utilities

// ---------------------------------------------
// Challenge utilities
// ---------------------------------------------

export const getChallenges = async (): Promise<Challenge[]> => {
  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      questions(*),
      universes(name, status)
    `)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error fetching challenges:', error);
    return [];
  }

  return (data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    startTime: new Date(c.start_time),
    endTime: c.end_time ? new Date(c.end_time) : undefined,
    createdAt: c.created_at ? new Date(c.created_at) : undefined,
    questions: c.questions || [],
    status: c.status,
    context: c.context,
    hintEnabled: c.hint_enabled,
    challengeType: (c as any).challenge_type || 'standalone',
    universeId: c.universe_id,
    universeName: c.universes?.name,
    universeStatus: c.universes?.status,
    challengeOrder: (c as any).challenge_order
  })) as Challenge[];
};

export const deleteChallenge = async (challengeId: string): Promise<boolean> => {
  const { error: roomsError } = await supabase
    .from('rooms')
    .delete()
    .eq('challenge_id', challengeId);

  if (roomsError) {
    console.error('Error deleting rooms:', roomsError);
    return false;
  }

  const { error: questionsError } = await supabase
    .from('questions')
    .delete()
    .eq('challenge_id', challengeId);

  if (questionsError) {
    console.error('Error deleting questions:', questionsError);
    return false;
  }

  const { error: challengeError } = await supabase
    .from('challenges')
    .delete()
    .eq('id', challengeId);

  if (challengeError) {
    console.error('Error deleting challenge:', challengeError);
    return false;
  }

  return true;
};

export const updateChallengeStatus = async (
  challengeId: string,
  status: 'en attente' | 'active' | 'terminée'
): Promise<boolean> => {
  const { error } = await supabase
    .from('challenges')
    .update({ status })
    .eq('id', challengeId);
  if (error) {
    console.error('Error updating challenge status:', error);
    return false;
  }
  return true;
};

export const updateChallengeName = async (challengeId: string, name: string): Promise<boolean> => {
  const newName = name.trim();
  if (!newName) return false;
  const { error } = await supabase
    .from('challenges')
    .update({ name: newName })
    .eq('id', challengeId);
  if (error) {
    console.error('Error updating challenge name:', error);
    return false;
  }
  return true;
};

export const getChallengeStatus = async (challengeId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('challenges')
    .select('status')
    .eq('id', challengeId)
    .single();
  if (error || !data) {
    console.error('Error fetching challenge status:', error);
    return null;
  }
  return data.status;
};

export const getChallenge = async (challengeId: string): Promise<Challenge | null> => {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .single();
  if (error || !data) {
    console.error('Error fetching challenge:', error);
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
    challengeType: (data as any).challenge_type || 'standalone',
    universeId: data.universe_id,
  } as Challenge;
};

export const getRoomsByChallenge = async (challengeId: string) => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching rooms by challenge:', error);
    return [];
  }
  return data || [];
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
    
    let challengeStatus = null;
    const challengeRefId = (data as any).challenge_id;
    if (challengeRefId) {
      // Fetch status from challenges using the referenced challenge id
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('status')
        .eq('id', challengeRefId)
        .single();

      if (!challengeError && challengeData) {
        challengeStatus = challengeData.status;
        console.log('Challenge status fetched (fresh):', challengeStatus);
      }
    }
    
    return {
      id: data.id,
      challengeId: (data as any).challenge_id,
      name: data.name,
      tokensLeft: data.tokens_left,
      initialTokens: data.initial_tokens || data.tokens_left, // Fallback for existing rooms
      currentDoor: data.current_door,
      score: data.score,
      challengeStatus: challengeStatus,
      sigil: data.sigil,
      motto: data.motto,
      universeId: data.universe_id,
      troupeId: (data as any).troupe_id || undefined,
      troupeStartTime: data.troupe_start_time ? new Date(data.troupe_start_time) : undefined,
      troupeEndTime: data.troupe_end_time ? new Date(data.troupe_end_time) : undefined
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

export const createRoom = async (challengeId: string, roomName: string, roomId?: string, sigil?: string, motto?: string, tokensLeft?: number, initialTokens?: number, universeId?: string): Promise<Room | null> => {
  console.log(`[ROOM DEBUG] Creating room with name: ${roomName}, challengeId: ${challengeId}, roomId: ${roomId || 'auto-generated'}, universeId: ${universeId || 'none'}`);
  
  // Initial tokens are set once at room creation and never change
  const roomInitialTokens = initialTokens !== undefined ? initialTokens : 0;
  // Tokens left start at the same value as initial tokens but will decrease with usage
  const roomTokensLeft = tokensLeft !== undefined ? tokensLeft : roomInitialTokens;
  
  const roomData: {
    challenge_id?: string;
    name: string;
    id?: string;
    sigil: string;
    motto: string;
    tokens_left?: number;
    initial_tokens?: number;
    universe_id?: string;
  } = {
    challenge_id: challengeId,
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
    challengeId: (data as any).challenge_id,
    name: data.name,
    tokensLeft: data.tokens_left,
    currentDoor: data.current_door,
    score: data.score,
    sigil: data.sigil,
    motto: data.motto
  };
};

export const addQuestionsToChallenge = async (challengeId: string, questions: Omit<Question, 'id'>[]): Promise<boolean> => {
  try {
    // First, check for existing questions in this challenge to avoid duplicates
    const { data: existingQuestions, error: fetchError } = await supabase
      .from('questions')
      .select('door_number')
      .eq('challenge_id', challengeId);

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
        challenge_id: challengeId,
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
    console.error('Unexpected error in addQuestionsToChallenge:', err);
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

export const getChallengeQuestions = async (challengeId: string): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('challenge_id', challengeId);

  if (error) {
    console.error('Error fetching challenge questions:', error);
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

export const getChallengeQuestionCount = async (challengeId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('challenge_id', challengeId);

  if (error) {
    console.error('Error fetching challenge question count:', error);
    return 1; // Default fallback to 1 doors
  }

  return count || 1; // Default fallback to 1 doors if count is null
};

export const getMaxDoorNumberForChallenge = async (challengeId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('questions')
    .select('door_number')
    .eq('challenge_id', challengeId)
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
      challenges_completed: existing?.challenges_completed ?? 0,
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

// Function to automatically generate rooms from universe troupes when creating a challenge
export const generateRoomsFromTroupes = async (challengeId: string, universeId: string): Promise<Room[]> => {
  console.log(`[TROUPE DEBUG] Generating rooms from troupes for challenge: ${challengeId}, universe: ${universeId}`);
  
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
      challenge_id: challengeId,
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
  challengeId: string,
  roomName: string,
  totalScore: number,
  universeId?: string
): Promise<boolean> => {
  console.log(`[SCORE DEBUG] Starting insertGameScore with parameters:`, {
    roomId,
    challengeId,
    roomName,
    totalScore,
    universeId
  });
  
  // Validate required parameters
  if (!roomId || !challengeId || !roomName) {
    console.error('[SCORE DEBUG] Missing required parameters:', { roomId, challengeId, roomName });
    return false;
  }
  
  const scoreData = {
    room_id: roomId,
    challenge_id: challengeId,
    universe_id: universeId,
    room_name: roomName,
    total_score: totalScore
  };
  
  console.log('[SCORE DEBUG] Attempting to upsert score data:', scoreData);
  
  // Use Supabase's upsert functionality with the unique constraint
  // This will insert if no record exists, or update if it does exist
  const { data, error } = await supabase
    .from('scores')
    .upsert(scoreData, {
      onConflict: 'room_id,challenge_id',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    console.error('[SCORE DEBUG] Error upserting score record:', error);
    console.error('[SCORE DEBUG] Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    console.error('[SCORE DEBUG] Score data that failed:', scoreData);
    return false;
  }

  console.log('[SCORE DEBUG] Score record upserted successfully:', data);
  console.log('[SCORE DEBUG] Number of records affected:', data?.length || 0);
  
  // Update universe leaderboard if universeId is provided
  if (universeId) {
    const leaderboardUpdated = await updateUniverseLeaderboard(universeId, roomName);
    if (leaderboardUpdated) {
      console.log('[SCORE DEBUG] Universe leaderboard updated successfully for:', roomName);
    } else {
      console.error('[SCORE DEBUG] Failed to update universe leaderboard for:', roomName);
    }
  }
  
  return true;
};

// Function to update universe leaderboard for a specific troupe
export const updateUniverseLeaderboard = async (
  universeId: string,
  roomName: string
): Promise<boolean> => {
  console.log(`[UNIVERSE LEADERBOARD DEBUG] Updating leaderboard for universe: ${universeId}, troupe: ${roomName}`);
  
  try {
    // Get all scores for this troupe in this universe
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('*')
      .eq('universe_id', universeId)
      .eq('room_name', roomName);

    if (scoresError) {
      console.error('[UNIVERSE LEADERBOARD DEBUG] Error fetching scores:', scoresError);
      return false;
    }

    if (!scores || scores.length === 0) {
      console.log('[UNIVERSE LEADERBOARD DEBUG] No scores found for troupe:', roomName);
      return true; // Not an error, just no scores yet
    }

    // Calculate aggregated data
    const totalScore = scores.reduce((sum, score) => sum + (score.total_score || 0), 0);
    const challengesCompleted = scores.length;
    
    // Find the best challenge (highest score)
    const bestChallenge = scores.reduce((best, current) => 
      (current.total_score || 0) > (best.total_score || 0) ? current : best
    );

    // Calculate total completion time (sum of all completion times)
    let totalCompletionTime = null;
    const completionTimes = scores
      .map(score => score.completion_time)
      .filter(time => time !== null && time !== undefined);
    
    if (completionTimes.length > 0) {
      // For PostgreSQL interval type, we need to sum them properly
      // This is a simplified approach - in a real scenario you might want to handle this differently
      totalCompletionTime = completionTimes[0]; // For now, just use the first one
    }

    const leaderboardData = {
      universe_id: universeId,
      room_name: roomName,
      best_challenge_id: bestChallenge.challenge_id,
      total_score: totalScore,
      completion_time: totalCompletionTime,
      challenges_completed: challengesCompleted,
      last_updated: new Date().toISOString()
    };

    // Try to update existing record first
    const { data: existingData, error: selectError } = await supabase
      .from('universe_leaderboard')
      .select('id')
      .eq('universe_id', universeId)
      .eq('room_name', roomName)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[UNIVERSE LEADERBOARD DEBUG] Error checking existing record:', selectError);
      return false;
    }

    if (existingData) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('universe_leaderboard')
        .update(leaderboardData)
        .eq('id', existingData.id);

      if (updateError) {
        console.error('[UNIVERSE LEADERBOARD DEBUG] Error updating leaderboard record:', updateError);
        return false;
      }

      console.log('[UNIVERSE LEADERBOARD DEBUG] Updated existing leaderboard record for:', roomName);
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('universe_leaderboard')
        .insert([leaderboardData]);

      if (insertError) {
        console.error('[UNIVERSE LEADERBOARD DEBUG] Error inserting leaderboard record:', insertError);
        return false;
      }

      console.log('[UNIVERSE LEADERBOARD DEBUG] Inserted new leaderboard record for:', roomName);
    }

    return true;
  } catch (error) {
    console.error('[UNIVERSE LEADERBOARD DEBUG] Unexpected error:', error);
    return false;
  }
};
// =====================================================
// UNIVERSE CHALLENGE CHAINING HELPERS
// =====================================================

export const getUniverseChallengesOrdered = async (universeId: string): Promise<Challenge[]> => {
  const res = await supabase
    .from('challenges')
    .select('*')
    .eq('universe_id', universeId)
    .order('created_at', { ascending: true })
    .order('challenge_order', { ascending: true });

  const data = res.data || [];

  return data.map((s: any) => ({
    id: s.id,
    name: s.name,
    startTime: s.start_time ? new Date(s.start_time) : new Date(),
    endTime: s.end_time ? new Date(s.end_time) : undefined,
    createdAt: s.created_at ? new Date(s.created_at) : undefined,
    questions: [],
    status: s.status,
    context: s.context,
    hintEnabled: s.hint_enabled,
    challengeType: (s as any).challenge_type || 'standalone',
    universeId: s.universe_id,
    universeName: undefined,
    universeStatus: undefined,
    challengeOrder: (s as any).challenge_order
  })) as Challenge[];
};

export const getNextChallengeIdInUniverse = async (
  universeId: string,
  currentChallengeId: string
): Promise<string | null> => {
  const challenges = await getUniverseChallengesOrdered(universeId);
  const idx = challenges.findIndex(s => s.id === currentChallengeId);
  if (idx >= 0 && idx + 1 < challenges.length) {
    return challenges[idx + 1].id;
  }
  return null;
};

export const getRoomByChallengeAndTroupe = async (
  challengeId: string,
  troupeId: string
): Promise<Room | null> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('challenge_id', challengeId)
    .eq('troupe_id', troupeId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    challengeId: (data as any).challenge_id,
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

export const getNextRoomForTroupeByChallenge = async (
  universeId: string,
  currentChallengeId: string,
  troupeId: string
): Promise<string | null> => {
  const nextChallengeId = await getNextChallengeIdInUniverse(universeId, currentChallengeId);
  if (!nextChallengeId) return null;
  const nextRoom = await getRoomByChallengeAndTroupe(nextChallengeId, troupeId);
  return nextRoom?.id || null;
};

export const updateRoomTroupeStartTime = async (roomId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('rooms')
      .update({ troupe_start_time: new Date().toISOString() })
      .eq('id', roomId);

    if (error) {
      console.error('Error updating troupe start time:', error);
      return false;
    }

    console.log('Troupe start time updated successfully for room:', roomId);
    return true;
  } catch (err) {
    console.error('Unexpected error updating troupe start time:', err);
    return false;
  }
};

export const updateRoomTroupeEndTime = async (roomId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('rooms')
      .update({ troupe_end_time: new Date().toISOString() })
      .eq('id', roomId);

    if (error) {
      console.error('Error updating troupe end time:', error);
      return false;
    }

    console.log('Troupe end time updated successfully for room:', roomId);
    return true;
  } catch (err) {
    console.error('Unexpected error updating troupe end time:', err);
    return false;
  }
};

// =====================================================
// CHALLENGE ALIASES FOR UNIVERSE CHAINING AND QUESTIONS
// =====================================================
