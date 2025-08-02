// src/lib/supabase.js
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vyzsauyekanaxevgxkyh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5enNhdXlla2FuYXhldmd4a3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMjgzOTIsImV4cCI6MjA2MTkwNDM5Mn0.VPs_JhAkoCUediOP4_0flNF9AURcQDH-Hfj8T0vi5_c';

// Initialize Supabase with the right storage adapter for React Native
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Function to create the feedback table if it doesn't exist
export const initializeFeedbackTable = async () => {
  try {
    // Check if the table exists
    const { error: checkError, data } = await supabase
      .from('feedback')
      .select('count')
      .limit(1);
    
    // If the table doesn't exist or there's an error, it might need to be created
    // But only an admin can create tables, so this is more for documentation
    if (checkError) {
      console.log('Feedback table might not exist:', checkError.message);
      console.log('Please create the table in the Supabase dashboard');
    } else {
      console.log('Feedback table exists and is accessible');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing feedback table:', error.message);
    return { success: false, error: error.message };
  }
};

// Function to insert feedback
export const insertFeedback = async (feedbackData) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackData]);
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error inserting feedback:', error.message);
    return { success: false, error: error.message };
  }
};