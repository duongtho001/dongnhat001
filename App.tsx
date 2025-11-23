


import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import { InputPanel } from './components/InputPanel';
import SceneTimeline from './components/SceneTimeline';
import type { Scene, CharacterReference, VideoConfig, ScenePrompt, CharacterVariation } from './types';
import { generateScenePrompts, generateScript, generateStoryIdea, generateSceneImage, generateCharacterPromptFromImage, generateCharacterPromptVariations, refineStoryIdea, generateCharacterImage, generateMultiReferenceImage, generateStoryFromCharacters, generateCharacterRoster, enrichVeoPromptsInBatch } from './services/geminiService';
import { translations, type Language } from './translations';
import GuideModal from './components/GuideModal';
import ConfirmationModal from './components/ConfirmationModal';
import ExclamationTriangleIcon from './components/icons/ExclamationTriangleIcon';
import StorySuggestionModal from './components/StorySuggestionModal';
import ContinueGenerationModal from './components/ContinueGenerationModal';
import CharacterSuggestionModal from './components/CharacterSuggestionModal';
import { normalizeString } from './constants';
import ApiKeyModal from './components/ApiKeyModal';
import { apiKeyManager } from './services/apiKeyManager';

declare var JSZip: any;

const SCENE_DURATION_SECONDS = 8;
const API_KEYS_STORAGE_KEY = 'genai_api_keys_string';

const isRetryableError = (errorMessage: string): boolean => {
  const lowerCaseError = errorMessage.toLowerCase();
  return lowerCaseError.includes('quota') 
      || lowerCaseError.includes('resource_exhausted') 
      || lowerCaseError.includes('overloaded') 
      || lowerCaseError.includes('unavailable') 
      || lowerCaseError.includes('503');
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('vi');
  const t = translations[language];

  // Project State
  const [projectName, setProjectName] = useState<string>(t.untitledProject);
  const [characterReferences, setCharacterReferences] = useState<CharacterReference[]>([]);
  const [storyIdea, setStoryIdea] = useState<string>(''); // Acts as Multi-line prompt input now
  const [storyStyle, setStoryStyle] = useState<string>('fast_engaging');
  const [generatedScript, setGeneratedScript] = useState<string>(''); // Unused in new flow but kept for types
  const [videoConfig, setVideoConfig] = useState<VideoConfig>({ 
    duration: 0, 
    style: 'cinematic_realistic',
    includeDialogue: true,
    dialogueLanguage: 'vi',
    format: 'viral_facts',
    aspectRatio: '9:16',
  });
  const [scenes, setScenes] = useState<Scene[]>([]);
  
  // UI & Loading State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingPromptId, setIsGeneratingPromptId] = useState<string | null>(null);
  const [isGeneratingImageId, setIsGeneratingImageId] = useState<string | null>(null);
  const [isSuggestingPromptId, setIsSuggestingPromptId] = useState<string | null>(null);
  const [isBatchGenerating, setIsBatchGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals State
  const [isGuideVisible, setIsGuideVisible] = useState<boolean>(false);
  const [isNewProjectConfirmVisible, setIsNewProjectConfirmVisible] = useState<boolean>(false);
  const [isResumeModalVisible, setIsResumeModalVisible] = useState<boolean>(false);
  const [isSuggestionModalVisible, setIsSuggestionModalVisible] = useState<boolean>(false);
  const [isContinueModalVisible, setIsContinueModalVisible] = useState(false);
  const [isCharacterSuggestionModalVisible, setIsCharacterSuggestionModalVisible] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  
  // Generation Progress & Control State
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [isGenerationComplete, setIsGenerationComplete] = useState<boolean>(false);
  const [generationStatusMessage, setGenerationStatusMessage] = useState<string>('');
  const [cooldowns, setCooldowns] = useState<{ [key: string]: boolean }>({});
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);
  
  // Suggestion Modals Content State
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [suggestionCooldown, setSuggestionCooldown] = useState(false);
  const [suggestedStoryIdea, setSuggestedStoryIdea] = useState<string>('');
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [characterSuggestions, setCharacterSuggestions] = useState<CharacterVariation[]>([]);
  const [charSuggestionError, setCharSuggestionError] = useState<string | null>(null);
  const [suggestionTargetCharacterId, setSuggestionTargetCharacterId] = useState<string | null>(null);
  
  // API Keys
  const [apiKeys, setApiKeys] = useState<string>('');

  useEffect(() => {
    const storedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY) || '';
    setApiKeys(storedKeys);
    apiKeyManager.loadKeys(storedKeys);
  }, []);

  useEffect(() => {
    const firstLine = storyIdea.split('\n')[0].trim();
    if (firstLine.length > 0 && firstLine.length < 50) {
      setProjectName(firstLine);
    } else {
      setProjectName(t.untitledProject);
    }
  }, [storyIdea, t.untitledProject]);

  const handleSaveApiKeys = (keys: string) => {
    setApiKeys(keys);
    localStorage.setItem(API_KEYS_STORAGE_KEY, keys);
    apiKeyManager.loadKeys(keys);
  };
  
  const startCooldown = (key: string, duration: number) => {
    setCooldowns(prev => ({...prev, [key]: true}));
    setTimeout(() => {
      setCooldowns(prev => ({...prev, [key]: false}));
    }, duration);
  };
  
  const handleError = (err: unknown, retryFn: () => void) => {
    const errorMessage = err instanceof Error ? err.message : t.errorUnknown('N/A');
    setIsLoading(false); 
    setIsSuggesting(false);
    setIsRefining(false);
    setIsSuggestingPromptId(null);
    setIsGeneratingPromptId(null);
    setIsGeneratingImageId(null);

    if (isRetryableError(errorMessage)) {
      setError(errorMessage);
      setRetryAction(() => retryFn);
      setIsResumeModalVisible(true);
    } else {
      setError(errorMessage);
    }
  };

  const resetState = () => {
    setProjectName(t.untitledProject);
    setCharacterReferences([]);
    setStoryIdea('');
    setStoryStyle('fast_engaging');
    setGeneratedScript('');
    setScenes([]);
    setVideoConfig({ 
        duration: 0, 
        style: 'cinematic_realistic',
        includeDialogue: true,
        dialogueLanguage: 'vi',
        format: 'viral_facts',
        aspectRatio: '9:16',
    });
    setError(null);
    setIsLoading(false);
    setIsSuggesting(false);
    setIsRefining(false);
    setIsGeneratingPromptId(null);
    setIsGeneratingImageId(null);
    setIsSuggestingPromptId(null);
    setIsBatchGenerating(false);
    setIsGenerationComplete(false);
    setGenerationProgress({ current: 0, total: 0 });
    setGenerationStatusMessage('');
    setCooldowns({});
    setRetryAction(null);
  };

  const handleNewProjectRequest = () => {
    if (storyIdea || characterReferences.length > 0 || scenes.length > 0 || generatedScript) {
        setIsNewProjectConfirmVisible(true);
    } else {
        resetState();
    }
  };

  const handleConfirmNewProject = () => {
      resetState();
      setIsNewProjectConfirmVisible(false);
  };
  
  const clearGeneratedContent = () => {
    // For consistency mode, we might not want to clear scenes immediately if user edits text, 
    // but to keep it simple, we'll clear if the input method changes drastically.
    // In this new mode, appending scenes is better.
  };

  const handleAddCharacter = () => {
    const name = `${t.newCharacterName} ${characterReferences.length + 1}`;
    const newCharacter: CharacterReference = {
        id: crypto.randomUUID(),
        name: name,
        normalizedName: normalizeString(name),
        type: 'character', // Default
        prompt: '',
        imageUrl: null,
    };
    setCharacterReferences(prev => [...prev, newCharacter]);
  };

  const handleUpdateCharacter = (id: string, field: keyof CharacterReference, value: string | null) => {
    setCharacterReferences(prev => prev.map(char => char.id === id ? { ...char, [field]: value } : char));
  };
  
  const handleDeleteCharacter = (id: string) => {
    setCharacterReferences(prev => prev.filter(char => char.id !== id));
  };

  const handleStoryIdeaChange = (value: string) => {
    setStoryIdea(value);
  };

  const handleVideoConfigChange = (value: React.SetStateAction<VideoConfig>) => {
    setVideoConfig(value);
  };

  const handleGenerateCharacterPrompt = async (characterId: string, file: File) => {
    setIsGeneratingPromptId(characterId);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageUrl = reader.result as string;
        handleUpdateCharacter(characterId, 'imageUrl', imageUrl);
        try {
          const prompt = await generateCharacterPromptFromImage(imageUrl, language);
          handleUpdateCharacter(characterId, 'prompt', prompt);
        } catch (err) {
          handleError(err, () => handleGenerateCharacterPrompt(characterId, file));
        } finally {
          setIsGeneratingPromptId(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      handleError(err, () => handleGenerateCharacterPrompt(characterId, file));
      setIsGeneratingPromptId(null);
    }
  };

  const handleGenerateCharacterImage = async (characterId: string) => {
    const character = characterReferences.find(c => c.id === characterId);
    if (!character || !character.prompt.trim()) return;

    setIsGeneratingImageId(characterId);
    setError(null);

    try {
        const imageUrl = await generateCharacterImage(character.prompt, language);
        handleUpdateCharacter(characterId, 'imageUrl', imageUrl);
    } catch (err) {
        handleError(err, () => handleGenerateCharacterImage(characterId));
    } finally {
        setIsGeneratingImageId(null);
    }
  };

  const handleSuggestCharacterPrompt = async (characterId: string) => {
    setSuggestionTargetCharacterId(characterId);
    setIsCharacterSuggestionModalVisible(true);
    await handleRegenerateCharacterVariations();
  };

  const handleRegenerateCharacterVariations = async () => {
    const character = characterReferences.find(c => c.id === suggestionTargetCharacterId);
    if (!character) return;
    
    setIsSuggesting(true);
    setCharSuggestionError(null);
    setSuggestionCooldown(true);
    
    try {
      const variations = await generateCharacterPromptVariations(
        character.name,
        videoConfig.style,
        storyStyle,
        language
      );
      setCharacterSuggestions(variations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.errorUnknown('N/A');
      setCharSuggestionError(errorMessage);
    } finally {
      setIsSuggesting(false);
      setTimeout(() => setSuggestionCooldown(false), 5000);
    }
  };

  const handleAcceptCharacterVariation = (description: string) => {
    if (suggestionTargetCharacterId) {
      handleUpdateCharacter(suggestionTargetCharacterId, 'prompt', description);
    }
    setIsCharacterSuggestionModalVisible(false);
    setCharacterSuggestions([]);
    setSuggestionTargetCharacterId(null);
  };
  
  const handleGenerateStoryIdea = async () => {
      // Unused in Consistency mode, but kept for interface
  };
  
  const handleSuggestStoryFromCharacters = async () => {
      if (characterReferences.length === 0) return;
      if (!videoConfig.duration) {
          alert("Please enter a duration first.");
          return;
      }
      
      setIsRefining(true); // reuse loading state for input area
      startCooldown('suggestFromAssets', 5000);
      
      try {
          // Pass storyIdea (current text input) as the topic context
          const script = await generateStoryFromCharacters(characterReferences, storyIdea, videoConfig, language);
          setStoryIdea(script);
      } catch (err) {
          handleError(err, handleSuggestStoryFromCharacters);
      } finally {
          setIsRefining(false);
      }
  };
  
  const handleRefineStory = async () => {
      setIsRefining(true);
      setError(null);
      startCooldown('refineIdea', 5000);
      try {
          // In consistency mode, this refines prompts
          const refined = await refineStoryIdea(storyIdea, videoConfig, storyStyle, language);
          setStoryIdea(refined);
      } catch (err) {
          handleError(err, handleRefineStory);
      } finally {
          setIsRefining(false);
      }
  }

  const handleAutoGenerateRoster = async (charCount: number, propCount: number) => {
      setIsLoading(true);
      startCooldown('autoRoster', 5000);
      
      try {
          // Use storyIdea as context topic, default to something creative if empty
          const topicContext = storyIdea.trim() || "Creative Animation";
          const newItems = await generateCharacterRoster(videoConfig.style, topicContext, charCount, propCount, language);
          const newCharacters: CharacterReference[] = newItems.map(item => ({
              id: crypto.randomUUID(),
              name: item.name,
              // Use the short_id from API, fallback to normalized name if missing
              normalizedName: item.short_id ? normalizeString(item.short_id) : normalizeString(item.name),
              type: item.type,
              prompt: item.description,
              imageUrl: null
          }));
          setCharacterReferences(prev => [...prev, ...newCharacters]);
      } catch (err) {
          // Pass a lambda to retry with the same quantity
          handleError(err, () => handleAutoGenerateRoster(charCount, propCount));
      } finally {
          setIsLoading(false);
      }
  }
  
  const handleAcceptSuggestedStory = (idea: string) => {
    setStoryIdea(idea);
    setIsSuggestionModalVisible(false);
    setSuggestedStoryIdea('');
  };

  // *** CORE BATCHED GENERATION LOGIC FOR LONG-FORM CONTENT ***
  const handlePrimaryAction = async () => {
    if (!storyIdea.trim() || !videoConfig.duration) return;
    
    setIsLoading(true);
    setError(null);
    setScenes([]);
    setGenerationProgress({ current: 0, total: 0 });
    setIsGenerationComplete(false);
    
    const totalScenes = Math.ceil(videoConfig.duration / SCENE_DURATION_SECONDS);
    const BATCH_SIZE = 20; // Generate 20 scenes per API call
    setGenerationProgress({ current: 0, total: totalScenes });
    
    try {
        let allGeneratedScenes: Scene[] = [];

        for (let i = 0; i < totalScenes; i += BATCH_SIZE) {
            const startScene = i + 1;
            const scenesToGenerate = Math.min(BATCH_SIZE, totalScenes - i);

            setGenerationStatusMessage(`Director is analyzing script for scenes ${startScene}-${startScene + scenesToGenerate - 1}...`);
            
            const enrichedBatch = await enrichVeoPromptsInBatch(
                storyIdea,
                videoConfig,
                characterReferences,
                language,
                startScene,
                scenesToGenerate,
                totalScenes
            );

            const newScenesBatch: Scene[] = enrichedBatch.map((item, index) => ({
                scene_id: startScene + index,
                time: `00:${((startScene + index - 1) * SCENE_DURATION_SECONDS).toString().padStart(2, '0')}`,
                prompt: {
                    scene_description: item.prompt, 
                    character_description: '',
                    background_description: '',
                    camera_shot: '',
                    lighting: '',
                    color_palette: '',
                    style: videoConfig.style,
                    composition_notes: '',
                    sound_effects: '',
                    dialogue: item.dialogue || '',
                    keywords: [],
                    negative_prompts: [],
                    aspect_ratio: videoConfig.aspectRatio,
                    duration_seconds: SCENE_DURATION_SECONDS
                },
                imageUrl: undefined,
                isGeneratingImage: false,
                rawPromptText: item.prompt,
                usedReferences: item.references
            }));
            
            allGeneratedScenes = [...allGeneratedScenes, ...newScenesBatch];
            setScenes(allGeneratedScenes); // Update UI incrementally
            setGenerationProgress({ current: allGeneratedScenes.length, total: totalScenes });
        }
        
        setGenerationStatusMessage(t.generationComplete);
        setIsGenerationComplete(true);

    } catch (err) {
        handleError(err, handlePrimaryAction);
    } finally {
        setIsLoading(false);
    }
  };


  const handleGenerateSceneImage = async (sceneId: number, referenceCharacterId: string) => {
     const sceneIndex = scenes.findIndex(s => s.scene_id === sceneId);
     if (sceneIndex === -1) return;
     
     const scene = scenes[sceneIndex];
     setScenes(prev => prev.map(s => s.scene_id === sceneId ? { ...s, isGeneratingImage: true } : s));
     
     try {
        // Logic: If reference ID is provided, use it.
        // If not, check if the scene has 'usedReferences' from syntax parsing and try to resolve one.
        let refImages: string[] = [];
        
        if (referenceCharacterId) {
            const ref = characterReferences.find(c => c.id === referenceCharacterId);
            if (ref && ref.imageUrl) refImages.push(ref.imageUrl);
        } 
        else if (scene.usedReferences && scene.usedReferences.length > 0) {
             // Try to auto-resolve from syntax if user didn't explicitly select a dropdown value
             scene.usedReferences.forEach(refName => {
                 const char = characterReferences.find(c => c.normalizedName === refName || c.id === refName);
                 if (char && char.imageUrl) refImages.push(char.imageUrl);
             });
        }

        let imageUrl = '';
        if (refImages.length > 0) {
            // Max 3 references
            imageUrl = await generateMultiReferenceImage(
                scene.prompt.scene_description, 
                refImages.slice(0, 3), 
                videoConfig.style, 
                videoConfig.aspectRatio, 
                language
            );
        } else {
            // No reference, text-to-image
             imageUrl = await generateCharacterImage(
                `${scene.prompt.scene_description}, style: ${videoConfig.style}, aspect ratio: ${videoConfig.aspectRatio}`, 
                language
            );
        }
        
        setScenes(prev => prev.map(s => s.scene_id === sceneId ? { ...s, imageUrl, isGeneratingImage: false } : s));

     } catch (error) {
        console.error(error);
        setError(t.errorGeneratingImage);
        setScenes(prev => prev.map(s => s.scene_id === sceneId ? { ...s, isGeneratingImage: false } : s));
     }
  };

  // Batch generate all images one by one (optional utility)
  const handleGenerateAllSceneImages = async (referenceCharacterId: string) => {
      setIsBatchGenerating(true);
      setGenerationProgress({ current: 0, total: scenes.length });
      
      // We iterate and await to respect rate limits somewhat, though calling specific index
      for (let i = 0; i < scenes.length; i++) {
          const scene = scenes[i];
          if (scene.imageUrl) continue; // Skip already generated
          
          setGenerationStatusMessage(t.generatingScene(i + 1, scenes.length));
          await handleGenerateSceneImage(scene.scene_id, referenceCharacterId);
          setGenerationProgress(prev => ({ ...prev, current: i + 1 }));
      }
      
      setIsBatchGenerating(false);
      setGenerationStatusMessage(t.generationComplete);
  };
  
  const handleDownloadPrompts = async () => {
     if (scenes.length === 0) return;
     
     // Construct a Master Veo 3 Prompt list
     const lines = scenes.map(s => {
         const p = s.prompt;
         // Format: 1. [Style] [Camera] [Main Action] [Lighting] [Tech/Motion]
         return `${s.scene_id}. Style: ${p.style}. ${p.scene_description}`;
     }).join('\n');

     const blob = new Blob([lines], { type: 'text/plain' });
     const link = document.createElement('a');
     link.href = URL.createObjectURL(blob);
     link.download = `${projectName}_veo3_prompts.txt`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  const handleDownloadAllImages = async () => {
    const zip = new JSZip();
    const imageScenes = scenes.filter(s => s.imageUrl);

    for (const scene of imageScenes) {
        if (scene.imageUrl) {
            const response = await fetch(scene.imageUrl);
            const blob = await response.blob();
            zip.file(`scene_${scene.scene_id}.png`, blob);
        }
    }

    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${projectName}_images.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
  };

  const handleResume = () => {
    setIsResumeModalVisible(false);
    if (retryAction) {
      retryAction();
      setRetryAction(null);
    }
  };

  const handleRegenerateStory = async () => {}; // stub

  const handleGenerateStoryboard = async () => {}; // stub

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-gray-200">
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        t={t} 
        onOpenGuide={() => setIsGuideVisible(true)}
        onNewProject={handleNewProjectRequest}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 max-w-[1600px] mx-auto">
        <InputPanel
          scenes={scenes}
          characterReferences={characterReferences}
          onUpdateCharacter={handleUpdateCharacter}
          onAddCharacter={handleAddCharacter}
          onDeleteCharacter={handleDeleteCharacter}
          onGenerateCharacterPrompt={handleGenerateCharacterPrompt}
          onSuggestCharacterPrompt={handleSuggestCharacterPrompt}
          onGenerateCharacterImage={handleGenerateCharacterImage}
          isGeneratingPromptId={isGeneratingPromptId}
          isSuggestingPromptId={isSuggestingPromptId}
          isGeneratingImageId={isGeneratingImageId}
          storyIdea={storyIdea}
          setStoryIdea={handleStoryIdeaChange}
          storyStyle={storyStyle}
          setStoryStyle={setStoryStyle}
          generatedScript={generatedScript}
          videoConfig={videoConfig}
          setVideoConfig={handleVideoConfigChange}
          onPrimaryAction={handlePrimaryAction}
          isLoading={isLoading}
          onGenerateStoryIdea={handleGenerateStoryIdea}
          onSuggestStoryFromCharacters={handleSuggestStoryFromCharacters}
          onRefineStory={handleRefineStory}
          onAutoGenerateRoster={handleAutoGenerateRoster}
          isRefining={isRefining}
          cooldowns={cooldowns}
          t={t}
          language={language}
        />
        <SceneTimeline
          scenes={scenes}
          onUpdatePrompt={(sceneId, newPrompt) => setScenes(prev => prev.map(s => s.scene_id === sceneId ? {...s, prompt: newPrompt} : s))}
          isLoading={isLoading}
          isBatchGenerating={isBatchGenerating}
          onDownloadPrompts={handleDownloadPrompts}
          onDownloadAllImages={handleDownloadAllImages}
          characterReferences={characterReferences}
          onGenerateSceneImage={handleGenerateSceneImage}
          onGenerateAllSceneImages={handleGenerateAllSceneImages}
          t={t}
          isGenerationComplete={isGenerationComplete}
          generationProgress={generationProgress}
          generationStatusMessage={generationStatusMessage}
        />
      </main>

      {error && !isResumeModalVisible && (
        <div className="fixed bottom-5 right-5 bg-red-800/90 text-white p-4 rounded-lg shadow-lg flex items-center gap-x-3 border border-red-600">
          <ExclamationTriangleIcon className="w-6 h-6" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-4 text-red-200 hover:text-white">&times;</button>
        </div>
      )}

      <GuideModal isOpen={isGuideVisible} onClose={() => setIsGuideVisible(false)} t={t} />
      
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKeys}
        currentKeys={apiKeys}
        t={t}
      />

      <ConfirmationModal
        isOpen={isNewProjectConfirmVisible}
        onClose={() => setIsNewProjectConfirmVisible(false)}
        onConfirm={handleConfirmNewProject}
        title={t.newProjectConfirmationTitle}
        message={t.newProjectConfirmationMessage}
        confirmText={t.confirmButton}
        cancelText={t.cancelButton}
        icon={<ExclamationTriangleIcon className="w-16 h-16 text-yellow-400" />}
      />
      
      <ConfirmationModal
        isOpen={isResumeModalVisible}
        onClose={() => {
          setIsResumeModalVisible(false);
          setError(null);
        }}
        onConfirm={handleResume}
        title={t.resumeGenerationTitle}
        message={error || ''}
        confirmText={t.resumeButton}
        cancelText={t.finishForNowButton}
        icon={<ExclamationTriangleIcon className="w-16 h-16 text-yellow-400" />}
        confirmButtonClass="bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
      />

      <StorySuggestionModal
        isOpen={isSuggestionModalVisible}
        onClose={() => {
          setIsSuggestionModalVisible(false);
          setSuggestionError(null);
        }}
        onAccept={handleAcceptSuggestedStory}
        onRegenerate={handleRegenerateStory}
        isLoading={isSuggesting}
        idea={suggestedStoryIdea}
        error={suggestionError}
        cooldown={suggestionCooldown}
        t={t}
      />
      
      <CharacterSuggestionModal
        isOpen={isCharacterSuggestionModalVisible}
        onClose={() => {
          setIsCharacterSuggestionModalVisible(false);
          setCharSuggestionError(null);
        }}
        onAccept={handleAcceptCharacterVariation}
        onRegenerate={handleRegenerateCharacterVariations}
        isLoading={isSuggesting}
        variations={characterSuggestions}
        error={charSuggestionError}
        cooldown={suggestionCooldown}
        t={t}
      />
      
      <ContinueGenerationModal
        isOpen={isContinueModalVisible}
        onClose={() => setIsContinueModalVisible(false)}
        onConfirm={handleGenerateStoryboard}
        generatedCount={scenes.length}
        totalCount={Math.ceil(videoConfig.duration / SCENE_DURATION_SECONDS)}
        t={t}
      />

    </div>
  );
};

export default App;
