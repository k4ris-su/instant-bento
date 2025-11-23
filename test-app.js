// Quick test to verify the application is working
console.log("🧪 Testing Instant Bento Application...");

// Test the API endpoint
fetch('http://localhost:3000/api/generate-portfolio', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=",
    text: "I'm a software developer with 5 years experience in React and Node.js. I love building user-friendly applications."
  }),
})
.then(response => response.json())
.then(data => {
  console.log("✅ API Response:", {
    name: data.name,
    title: data.title,
    skills: data.skills,
    colorTheme: data.colorTheme
  });
  console.log("🎉 Application is working correctly!");
})
.catch(error => {
  console.error("❌ API Error:", error);
});