import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

function App() {
  const [translateEnabled, setTranslateEnabled] = useState(false);
  const [inputLang, setInputLang] = useState("");
  const [outputLang, setOutputLang] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [recognition, setRecognition] = useState(null);

  const languages = useMemo(() => ["Hindi", "English", "Kannada", "Malayalam"], []);
  const outputLangOptions = useMemo(() => languages.filter((lang) => lang !== inputLang), [languages, inputLang]);
  const isStartButtonEnabled = useMemo(() => inputLang && (!translateEnabled || (outputLang && inputLang !== outputLang)), [inputLang, outputLang, translateEnabled]);

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
    }
  }, []);

  const getLanguageCode = useMemo(() => {
    return (lang) => {
      switch (lang) {
        case "Hindi":
          return "hi";
        case "English":
          return "en";
        case "Kannada":
          return "kn";
        case "Malayalam":
          return "ml";
        default:
          return "en";
      }
    };
  }, []);

  const translateText = useCallback(async (text, sourceLang, targetLang) => {
    const apiKey = ""; // Replace with your Google API Key
    const url = `https://translation.googleapis.com/language/translate/v2`;

    try {
      const response = await axios.post(
        url,
        {
          q: text,
          source: sourceLang,
          target: targetLang,
          format: "text",
          key: apiKey,
        }
      );
      console.log("Response from API:", response);
      return response.data.data.translations[0].translatedText; // The translated text is inside translations[0]
    } catch (error) {
      console.error("Translation error:", error.response ? error.response.data : error);
      return text; // Return original text if error occurs
    }
  }, []);

  const handleStartSpeaking = useCallback(() => {
    setInputText("");
    setTranslatedText("");
    setIsSpeaking(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const newRecognition = new SpeechRecognition();
    newRecognition.lang = `${getLanguageCode(inputLang)}-IN`;
    newRecognition.interimResults = true;
    newRecognition.continuous = true;

    newRecognition.onresult = async (event) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      setInputText((prev) => prev + transcript + " ");

      if (translateEnabled) {
        const translated = await translateText(
          transcript,
          getLanguageCode(inputLang),
          getLanguageCode(outputLang)
        );
        setTranslatedText(translated);
      }
    };

    newRecognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsSpeaking(false);
    };

    newRecognition.onend = () => {
      if (isSpeaking) {
        newRecognition.start();
      }
    };

    setRecognition(newRecognition);
    newRecognition.start();
  }, [getLanguageCode, inputLang, outputLang, translateEnabled, isSpeaking, translateText]);

  const handleStopSpeaking = useCallback(() => {
    setIsSpeaking(false);
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }
  }, [recognition]);

  const speakText = useCallback((text, lang) => {
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(lang);
    window.speechSynthesis.speak(utterance);
  }, [getLanguageCode]);

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-semibold mb-6">Audio Translation App</h1>

      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            name="translateOption"
            value="no"
            checked={!translateEnabled}
            onChange={() => setTranslateEnabled(false)}
          />
          No Translation
        </label>
        <label>
          <input
            type="radio"
            name="translateOption"
            value="yes"
            checked={translateEnabled}
            onChange={() => setTranslateEnabled(true)}
          />
          Translation
        </label>
      </div>

      <div className="flex gap-4 mb-4">
        <select
          className="p-2 border rounded"
          value={inputLang}
          onChange={(e) => setInputLang(e.target.value)}
        >
          <option value="">Select Input Language</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        {translateEnabled && (
          <select
            className="p-2 border rounded"
            value={outputLang}
            onChange={(e) => setOutputLang(e.target.value)}
          >
            <option value="">Select Output Language</option>
            {outputLangOptions.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-4">
        {isSpeaking ? (
          <button
            onClick={handleStopSpeaking}
            className="px-4 py-2 rounded text-white bg-red-500"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleStartSpeaking}
            className={`px-4 py-2 rounded text-white ${isStartButtonEnabled ? 'bg-blue-500' : 'bg-gray-400'}`}
            disabled={!isStartButtonEnabled}
          >
            Start Speaking
          </button>
        )}
      </div>

      {isSpeaking || inputText ? (
        <div className="mt-6 w-full max-w-md">
          <label className="block mb-2 font-semibold">
            {translateEnabled ? `Input (${inputLang})` : "Recognized Text"}
          </label>
          <textarea
            className="w-full p-2 border rounded h-full"
            value={inputText}
            readOnly
          />
        </div>
      ) : null}

      {translateEnabled && translatedText && (
        <div className="mt-6 w-full max-w-md">
          <label className="block mb-2 font-semibold">Translated Text ({outputLang})</label>
          <textarea
            className="w-full p-2 border rounded h-24"
            value={translatedText}
            readOnly
          />
        </div>
      )}
    </div>
  );
}

export default App;
