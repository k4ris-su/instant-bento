# 🚀 Instant Bento

**Tagline:** *"From Chaos to Portfolio in 5 Seconds."*

Transform your casual selfie and rough information into a beautiful, professional portfolio with AI-powered design.

## ✨ Features

- **AI-Powered Design**: Uses Google's Gemini AI to analyze your photo and text
- **Bento Grid Layout**: Modern, responsive grid-based design
- **Professional Image Processing**: Transforms casual photos into portfolio-ready images
- **Smart Content Generation**: Creates compelling bios and skill presentations
- **Responsive Design**: Works perfectly on desktop and mobile
- **Fast Processing**: Results in under 5 seconds
- **Modern UI/UX**: Clean, minimal design with smooth animations

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **AI Integration**: Google Gemini AI API
- **Animations**: Framer Motion
- **Notifications**: Sonner
- **Package Manager**: pnpm

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd instant-bento
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Get your Gemini API key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env.local` file

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

1. **Upload a Photo**: Drag and drop or click to upload any photo (selfie, casual photo, etc.)
2. **Provide Information**: Write about yourself, paste your CV, or just add keywords
3. **Click "Magic Generate"**: Watch as AI transforms your inputs into a professional portfolio
4. **Share Your Portfolio**: Take a screenshot or share the generated layout

## 🎨 Design Philosophy

The application follows a **"Modern Seamless Minimal"** design approach:

- **Modular & Grid-based**: Information organized in clean Bento grid cells
- **Content-First**: Minimal decorations, focus on content presentation
- **Motion & Feedback**: Smooth animations and loading states
- **Responsive**: Adapts beautifully to all screen sizes

## 🔧 Project Structure

```
instant-bento/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate-portfolio/
│   │   │       └── route.ts      # AI processing API endpoint
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Main application page
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── BentoCard.tsx         # Reusable Bento grid card
│   │   ├── BentoGrid.tsx         # Portfolio display grid
│   │   ├── LoadingSkeleton.tsx   # Loading state component
│   │   └── UploadForm.tsx        # User input form
│   └── lib/
│       └── utils.ts              # Utility functions
├── public/                       # Static assets
├── package.json                  # Dependencies and scripts
└── .env.local                    # Environment variables (create this)
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add your `GEMINI_API_KEY` to environment variables
   - Deploy!

### Manual Deployment

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Start the production server**
   ```bash
   pnpm start
   ```

## 🎨 Customization

### Color Themes
The AI automatically selects color themes based on personality analysis. You can modify the prompt in `src/app/api/generate-portfolio/route.ts` to customize this behavior.

### Layout Options
Modify the grid layout in `src/components/BentoGrid.tsx` to change the portfolio arrangement.

### Animation Settings
Adjust animation parameters in the same BentoGrid component using Framer Motion properties.

## 🔒 Security

- API keys are stored server-side only
- No sensitive data is exposed to the client
- Image processing happens securely on the backend

## 🐛 Troubleshooting

### Common Issues

1. **API Key Issues**
   - Ensure your Gemini API key is valid and has proper permissions
   - Check that the API key is correctly set in `.env.local`

2. **Image Upload Issues**
   - Supported formats: JPG, PNG, GIF
   - Maximum file size: 10MB
   - Ensure the image is not corrupted

3. **Build Issues**
   - Clear `.next` folder: `rm -rf .next`
   - Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`

4. **Development Server Issues**
   - Check if port 3000 is available
   - Try a different port: `pnpm dev --port 3001`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for providing the AI capabilities
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for the smooth animations

---

**Made with ❤️ and AI magic**
