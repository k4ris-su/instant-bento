# 🚀 Setup Guide for Instant Bento

## ⚠️ IMPORTANT: API Configuration

### Step 1: Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the generated key

### Step 2: Create `.env.local` File

```bash
# In the project root directory (instant-bento/)
cp .env.local.example .env.local
```

Then edit `.env.local` and replace with your actual key:

```
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

### Step 3: Install Dependencies

```bash
pnpm install
```

### Step 4: Run Development Server

```bash
pnpm dev
```

### Step 5: Test the Application

Open [http://localhost:3000](http://localhost:3000)

---

## 🔧 API Models Used

According to [Gemini API Documentation](https://ai.google.dev/gemini-api/docs):

### Text Generation
- **Model:** `gemini-2.5-flash`
- **Purpose:** Generate portfolio data (name, bio, skills, etc.)

### Image Generation  
- **Model:** `gemini-2.5-flash-image`
- **Purpose:** Generate a new professional portrait based on input image
- **Note:** Gemini generates a NEW image, not edit the original

---

## 📝 How It Works

1. **Input:** User uploads a photo + provides text information
2. **Text Processing:** Gemini analyzes text and creates portfolio content
3. **Image Processing:** Gemini **EDITS** the input photo using "Image + Text-to-Image" approach:
   - Enhances background to professional studio quality
   - Adjusts lighting and atmosphere
   - Preserves the person's face and identity
   - Uses semantic masking/inpainting technique
4. **Output:** Bento grid layout with all generated content

---

## ⚠️ Known Limitations

### Image Editing Reality Check

According to Gemini API docs, Nano Banana **CAN** edit images:

✅ **What Gemini CAN do:**
- **Image + Text-to-Image Editing:** Modify background, lighting, and style
- **Semantic Masking (Inpainting):** Change specific elements while preserving others
- **Style Transfer:** Transform photos into different artistic styles
- **Multi-turn Editing:** Iteratively refine images through conversation
- **Advanced Composition:** Combine elements from multiple images

⚠️ **Limitations:**
- Results may vary - AI editing is not pixel-perfect like Photoshop
- Complex edits might not always work as expected
- Best results with clear, specific instructions
- May occasionally return original image if editing fails

### What This App Does

The app uses **"Image + Text-to-Image (Editing)"** mode:
- Provides input photo + text instructions to Gemini
- Gemini modifies the background and lighting
- Preserves the person's face and features
- Falls back to original photo if editing fails

---

## 🐛 Troubleshooting

### Error: "Invalid API key"
- Check `.env.local` file exists
- Verify API key is correct
- Restart dev server after adding key

### Error: "API quota exceeded"
- Check your usage at [Google AI Studio](https://aistudio.google.com/)
- Free tier has rate limits

### Image not generating
- This is EXPECTED behavior currently
- Gemini may not always generate an image that looks "better"
- Fallback to original image is working correctly

---

## 💡 Next Steps

To improve image quality:

1. **Keep it simple:** Use original photo (already implemented as fallback)
2. **Add client-side enhancements:** CSS filters, blur effects
3. **Use dedicated image AI:** Integrate Stability AI or similar
4. **Crop and optimize:** Use sharp/canvas for basic improvements

---

## 📚 References

- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Image Generation Guide](https://ai.google.dev/gemini-api/docs/imagen)
- [Text Generation](https://ai.google.dev/gemini-api/docs/text-generation)
