
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
    questions: []
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
    questions: session.questions || []
  }));
};

export const getRoom = async (roomId: string): Promise<Room | null> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching room:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    sessionId: data.session_id,
    name: data.name,
    tokensLeft: data.tokens_left,
    currentDoor: data.current_door,
    score: data.score
  };
};

export const createRoom = async (sessionId: string, roomName: string): Promise<Room | null> => {
  const { data, error } = await supabase
    .from('rooms')
    .insert([{
      session_id: sessionId,
      name: roomName,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating room:', error);
    return null;
  }

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
        image: q.image,
        answer: q.answer,
      }))
    );

  if (error) {
    console.error('Error adding questions:', error);
    return false;
  }

  return true;
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
