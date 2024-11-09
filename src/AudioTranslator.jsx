import React, { useState } from 'react';

function AudioTranslator() {
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [inputLanguage, setInputLanguage] = useState('');
  const [outputLanguage, setOutputLanguage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  const languages = ["Hindi", "English", "Kannada", "Malayalam"];
  const languageCodes = { Hindi: "hi-IN", English: "en-US", Kannada: "kn-IN", Malayalam: "ml-IN" };

  const handleTranslationToggle = (e) => {
    setTranslationEnabled(e.target.value === "yes");
  };

  const handleInputLanguageChange = (e) => {
    setInputLanguage(e.target.value);
    if (e.target.value === outputLanguage) {
      setOutputLanguage('');
    }
  };

  const handleOutputLanguageChange = (e) => {
    setOutputLanguage(e.target.value);
    if (e.target.value === inputLanguage) {
      setInputLanguage('');
    }
  };

  const handleStartSpeaking = () => {
    if (translationEnabled && (!inputLanguage || !outputLanguage)) {
      alert("Please select both input and output languages for translation.");
      return;
    }
    setIsSpeaking(true);
    startSpeechRecognition();
  };

  const startSpeechRecognition = () => {
    const recognition = new window.SpeechRecognition();
    recognition.lang = languageCodes[inputLanguage];
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setInputText(transcript);
    };
    recognition.start();
    recognition.onend = () => {
      recognition.stop();
      if (translationEnabled) {
        translateText(transcript);
      }
    };
  };

  const translateText = (text) => {
    // Placeholder translation logic for demo purposes
    const translated = text.split('').reverse().join('');
    setTranslatedText(translated);

    // Convert translated text to audio after translation
    speakOutText(translated);
  };

  const speakOutText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCodes[outputLanguage];
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Audio Translator</h1>

      {!isSpeaking && (
        <>
          <div className="mb-4">
            <p>Do you want translation?</p>
            <label>
              <input
                type="radio"
                value="yes"
                checked={translationEnabled === true}
                onChange={handleTranslationToggle}
              />
              Yes
            </label>
            <label className="ml-4">
              <input
                type="radio"
                value="no"
                checked={translationEnabled === false}
                onChange={handleTranslationToggle}
              />
              No
            </label>
          </div>

          {translationEnabled && (
            <div className="mb-4">
              <label className="block mb-2">Select Input Language:</label>
              <select value={inputLanguage} onChange={handleInputLanguageChange} className="border p-2 rounded">
                <option value="" disabled>Select Input Language</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>

              <label className="block mt-4 mb-2">Select Output Language:</label>
              <select value={outputLanguage} onChange={handleOutputLanguageChange} className="border p-2 rounded">
                <option value="" disabled>Select Output Language</option>
                {languages
                  .filter((lang) => lang !== inputLanguage)
                  .map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <button
            onClick={handleStartSpeaking}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Start Speaking
          </button>
        </>
      )}

      {isSpeaking && (
        <div>
          <p className="text-lg font-semibold">Input Language: {inputLanguage}</p>
          <p className="text-lg font-semibold">Output Language: {outputLanguage}</p>
          <p className="text-gray-500 mt-4">Listening for your input...</p>
          
          <textarea
            className="w-full h-24 border mt-4 p-2"
            value={inputText}
            readOnly
            placeholder="Recognized input text will appear here..."
          ></textarea>

          {translationEnabled && (
            <>
              <p className="mt-4 font-semibold">Translated Text:</p>
              <textarea
                className="w-full h-24 border mt-2 p-2"
                value={translatedText}
                readOnly
                placeholder="Translated text will appear here..."
              ></textarea>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AudioTranslator;
