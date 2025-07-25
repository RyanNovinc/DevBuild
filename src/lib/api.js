// src/lib/api.js
const API_ENDPOINT = 'https://1rtnxadybk.execute-api.ap-southeast-2.amazonaws.com/prod/feedback';

export const submitFeedback = async (feedbackData) => {
  try {
    console.log('Submitting feedback to Lambda API:', feedbackData);
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });
    
    const data = await response.json();
    console.log('Response from Lambda API:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit feedback');
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting feedback:', error.message);
    return { success: false, error: error.message };
  }
};