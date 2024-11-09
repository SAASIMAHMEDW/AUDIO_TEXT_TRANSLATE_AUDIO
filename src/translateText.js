// translateText.js
import axios from "axios";

export const translateText = async (text, targetLang) => {
  try {
    const response = await axios.post("https://libretranslate.com/translate", {
      q: text,
      source: "en", // Assuming English as the input language
      target: targetLang,
      format: "text",
    });
    return response.data.translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // fallback to the original text if translation fails
  }
};
