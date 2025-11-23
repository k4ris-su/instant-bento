// Test script for the API endpoint
const testPortfolioGeneration = async () => {
  const testData = {
    image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=",
    text: "I'm a software developer with 5 years of experience in React and Node.js. I love building user-friendly applications and have worked at tech startups."
  };

  try {
    const response = await fetch('http://localhost:3000/api/generate-portfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log('API Test Result:', result);
    
    if (response.ok) {
      console.log('✅ API is working correctly!');
      console.log('Generated Portfolio Data:', {
        name: result.name,
        title: result.title,
        bio: result.bio,
        skills: result.skills,
        colorTheme: result.colorTheme
      });
    } else {
      console.log('❌ API Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Network Error:', error);
  }
};

// Run the test
testPortfolioGeneration();