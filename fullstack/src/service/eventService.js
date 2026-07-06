// src/services/eventService.js
import { supabase } from './supabaseClient';

/**
 * Registers a new user with email and password using Supabase Auth
 */
export const registerUser = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data.user;
};

/**
 * Logs in an existing user using Supabase Auth
 */
export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data.user;
};

/**
 * Fetches all events matching a zip code.
 * Excludes events the current user has already RSVP'd to.
 */
export const getEventsByZip = async (zipcode, userId) => {
  if (!userId) throw new Error("User authentication session required.");

  // 1. Fetch event IDs the user has already RSVP'd to
  const { data: userRsvps, error: rsvpError } = await supabase
    .from('rsvps')
    .select('event_id')
    .eq('user_id', userId);

  if (rsvpError) throw new Error(rsvpError.message);
  const rsvpedEventIds = userRsvps.map(r => r.event_id);

  // 2. Query events table for matching zip codes
  let query = supabase
    .from('events')
    .select('*')
    .eq('zipcode', zipcode);

  // If user has active RSVPs, filter out those specific event IDs
  if (rsvpedEventIds.length > 0) {
    query = query.not('id', 'in', `(${rsvpedEventIds.join(',')})`);
  }

  const { data: events, error: eventsError } = await query;
  if (eventsError) throw new Error(eventsError.message);

  return events;
};

/**
 * Commits a user to an event (Creates an RSVP record)
 */
export const rsvpToEvent = async (eventId, userId) => {
  if (!eventId || !userId) throw new Error("Invalid event or user configuration.");

  const { data, error } = await supabase
    .from('rsvps')
    .insert([{ event_id: eventId, user_id: userId }])
    .select();

  if (error) throw new Error(error.message);
  return { success: true, data };
};

/**
 * Cancels an existing RSVP
 */
export const cancelRSVP = async (eventId, userId) => {
  if (!eventId || !userId) throw new Error("Invalid session details.");

  const { error } = await supabase
    .from('rsvps')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return { success: true, message: "RSVP successfully cancelled." };
};