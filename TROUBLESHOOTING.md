# Troubleshooting Guide for Hugging Face API

## Common Issues and Solutions

### 1. 404 Errors (Models Not Found)

**Problem**: Getting 404 errors when trying to access models.

**Solution**: The models have been updated to use verified working models:
- GPT-2 ✅
- DistilGPT2 ✅  
- T5 Small ✅
- BART Base ✅

### 2. Connection Failed Error

**Problem**: "Connection failed. Please check your API key and internet connection."

**Solutions**:

1. **Verify your .env file**:
   - Make sure it's in the project root directory (same level as `package.json`)
   - Check the exact format: `VITE_HUGGINGFACE_API_KEY=your_key_here`
   - No spaces around the `=` sign
   - No quotes around the API key

2. **Restart the development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

3. **Use the Test Connection button**:
   - Click the "🔗 Test" button in the Add Card modal
   - This will verify if your API key is working

### 3. API Key Not Configured

**Problem**: "HuggingFace API key not configured"

**Solution**:
1. Create a `.env` file in the project root
2. Add your API key: `VITE_HUGGINGFACE_API_KEY=your_key_here`
3. Restart the server

### 4. Getting a Hugging Face API Key

1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Sign in or create a free account
3. Click "New token"
4. Give it a name (e.g., "Flash Cards App")
5. Select "Read" role
6. Click "Generate token"
7. Copy the token

### 5. Debug Information

Check the browser console for:
- AIService initialization logs
- API request details
- Error responses

### 6. Alternative Models

If one model doesn't work, try switching to another:
- GPT-2 (most reliable)
- DistilGPT2 (faster)
- T5 Small (good for text generation)
- BART Base (good for summarization)

### 7. Network Issues

- Check if you can access [https://huggingface.co](https://huggingface.co)
- Try from a different network if possible
- Check if your firewall is blocking the requests

### 8. Rate Limiting

- Free tier has some rate limits
- Wait a few seconds between requests
- Don't spam the API

## Still Having Issues?

1. Check the browser console for detailed error messages
2. Verify your API key format
3. Try the test connection button
4. Switch between different models
5. Restart your development server

## Example Working .env File

```bash
VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note**: Replace `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual API key.
