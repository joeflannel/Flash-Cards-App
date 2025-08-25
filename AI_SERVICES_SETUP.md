# AI Services Setup Guide

## 🚀 Multiple AI Providers Support

Your Flash Cards app now supports multiple AI services, giving you flexibility and fallback options when one service is unavailable.

## 🔑 Available AI Services

### 1. HuggingFace (Free Tier)
- **Status**: ✅ Available (but inference API requires special permissions)
- **Cost**: Free (30,000 requests/month)
- **Best For**: Open-source models, research
- **Setup**: `VITE_HUGGINGFACE_API_KEY=hf_your_key_here`

### 2. Groq (Recommended Alternative)
- **Status**: 🆕 New addition
- **Cost**: Very affordable ($0.10 per 1M tokens)
- **Best For**: Fast inference, production use
- **Setup**: `VITE_GROQ_API_KEY=gsk_your_key_here`
- **Models**: Llama 3, Mixtral, Gemma

### 3. OpenAI GPT-3.5 Turbo
- **Status**: Available
- **Cost**: $0.0015 per 1K tokens
- **Best For**: High quality, reliable responses
- **Setup**: `VITE_OPENAI_API_KEY=sk_your_key_here`

### 4. Anthropic Claude
- **Status**: Available
- **Cost**: $0.25 per 1M tokens
- **Best For**: Safety-focused, detailed responses
- **Setup**: `VITE_ANTHROPIC_API_KEY=sk-ant-your_key_here`

### 5. Fallback (Local)
- **Status**: ✅ Always available
- **Cost**: Free
- **Best For**: Offline use, when APIs fail
- **Setup**: No setup required

## 🛠️ Quick Setup

### Option 1: Groq (Recommended)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for free account
3. Create API key
4. Add to `.env`:
   ```bash
   VITE_GROQ_API_KEY=gsk_your_actual_key_here
   ```

### Option 2: OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up and add billing
3. Create API key
4. Add to `.env`:
   ```bash
   VITE_OPENAI_API_KEY=sk_your_actual_key_here
   ```

### Option 3: Fix HuggingFace
1. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create new token with **Write** permissions
3. Update your `.env`:
   ```bash
   VITE_HUGGINGFACE_API_KEY=hf_your_new_key_here
   ```

## 📝 Complete .env Example

```bash
# HuggingFace (Free, but limited inference access)
VITE_HUGGINGFACE_API_KEY=hf_your_key_here

# Groq (Recommended - fast and affordable)
VITE_GROQ_API_KEY=gsk_your_key_here

# OpenAI (High quality, but costs money)
VITE_OPENAI_API_KEY=sk_your_key_here

# Anthropic (Safety-focused)
VITE_ANTHROPIC_API_KEY=sk-ant-your_key_here
```

## 🎯 Why Multiple Providers?

### Benefits:
- **Reliability**: If one service is down, others continue working
- **Cost Optimization**: Choose the most cost-effective for your needs
- **Quality Options**: Different models excel at different tasks
- **Fallback**: Local generation when all APIs fail

### Use Cases:
- **Development**: Use free HuggingFace or local fallback
- **Production**: Use Groq for fast, reliable inference
- **High Quality**: Use OpenAI for premium results
- **Safety**: Use Claude for sensitive content

## 🔧 Troubleshooting

### "No AI API keys configured"
- Add at least one API key to your `.env` file
- Restart your development server
- Check the key format (no spaces, quotes, etc.)

### "Connection failed"
- Verify your API key is correct
- Check if the service is online
- Ensure you have sufficient credits/quota

### "Model not responding"
- Try switching to a different provider
- Check your internet connection
- Verify API key permissions

## 💡 Best Practices

### For Language Learning:
- **Groq**: Best balance of speed and quality
- **OpenAI**: Highest quality sentences
- **Fallback**: Always works, good for practice

### API Key Security:
- Never commit `.env` files to version control
- Use environment variables in production
- Rotate keys regularly
- Monitor usage and costs

### Rate Limiting:
- Built-in delays prevent hitting limits
- Handle errors gracefully
- Test connections before heavy usage

## 🚀 Getting Started

1. **Choose your primary AI service** (we recommend Groq)
2. **Get an API key** from the service provider
3. **Add it to your `.env` file**
4. **Restart your development server**
5. **Test the connection** using the Model Selector
6. **Start generating sentences!**

## 🆘 Need Help?

- **Groq**: [console.groq.com/docs](https://console.groq.com/docs)
- **OpenAI**: [platform.openai.com/docs](https://platform.openai.com/docs)
- **HuggingFace**: [huggingface.co/docs](https://huggingface.co/docs)
- **Anthropic**: [docs.anthropic.com](https://docs.anthropic.com)

---

**Pro Tip**: Start with Groq - it's fast, affordable, and reliable for language learning applications!
