
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

  return data;
};

export const getSessions = async (): Promise<Session[]> => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*');

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return data || [];
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

  return data;
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
