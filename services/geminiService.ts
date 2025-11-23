


import { GoogleGenAI, Modality, GenerateContentResponse, Type } from "@google/genai";
import type { VideoConfig, Scene, ScenePrompt, CharacterVariation, CharacterReference } from '../types';
import { Language, translations } from "../translations";
import { DIALOGUE_LANGUAGES } from "../constants";
import { apiKeyManager } from "./apiKeyManager";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 10,
  initialDelay = 2000,
  context: string
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        try {
          errorMessage = JSON.stringify(error);
        } catch (e) {
          errorMessage = String(error);
        }
      } else {
        errorMessage = String(error);
      }
      
      const isQuotaError = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota');
      const isServerError = errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('unavailable');

      if (isQuotaError) {
        const hasRotated = apiKeyManager.rotateToNextKey();
        if (hasRotated) {
          console.warn(`Quota error on key. Rotated to key index ${apiKeyManager.currentIndex}. Retrying immediately.`);
          // We have a new key, retry the loop without waiting.
          continue;
        }
      }

      if (isQuotaError || isServerError) {
          const delay = initialDelay * (2 ** i);
          console.warn(`Attempt ${i + 1}/${retries} failed in ${context} with a retryable error. Retrying in ${delay}ms...`);
          await sleep(delay + Math.random() * 500);
      } else {
          // Not a retryable error, throw immediately
          throw error;
      }

      if (i === retries - 1) {
          break; // Exit loop if all retries are exhausted
      }
    }
  }

  console.error(`All server retries failed in ${context}.`);
  throw lastError;
}


function getErrorMessage(error: unknown, context: string, language: Language): string {
    const t = translations[language];
    console.error(`Error in ${context}:`, error);
    
    let message = '';
    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'object' && error !== null) {
        try {
            message = JSON.stringify(error);
        } catch {
            message = String(error);
        }
    } else {
        message = String(error);
    }

    const lowerCaseMessage = message.toLowerCase();

    if (message.includes('NO_API_KEY_CONFIGURED')) {
        return t.errorNoApiKey;
    }
    if (lowerCaseMessage.includes('quota') || lowerCaseMessage.includes('resource_exhausted') || lowerCaseMessage.includes('429')) {
        return t.errorQuotaExceeded;
    }
    if (lowerCaseMessage.includes('api key not valid') || lowerCaseMessage.includes('invalid token')) {
        return t.errorInvalidApiKey(context);
    }
    if (lowerCaseMessage.includes('overloaded') || lowerCaseMessage.includes('503') || lowerCaseMessage.includes('unavailable')) {
        return t.errorServerOverloaded(context);
    }
    if (lowerCaseMessage.includes('failed to fetch') || lowerCaseMessage.includes('tls handshake')) {
        return t.errorNetworkOrProxy;
    }
    return t.errorGeneric(context, message.slice(0, 200));
}

const MODEL_NAME = 'gemini-2.5-flash';

export const generateCharacterPromptFromImage = async (
    imageBase64: string,
    language: Language,
): Promise<string> => {
    const systemInstruction = translations[language].systemInstruction_generateCharacterPrompt;
    const userPromptText = "Please describe the character in this image in detail for an animation project.";
    
    const match = imageBase64.match(/^data:(image\/.+);base64,(.+)$/);
    if (!match) {
        throw new Error("Invalid base64 image format provided.");
    }
    const mimeType = match[1];
    const data = match[2];

    const imagePart = {
        inlineData: { mimeType, data },
    };
    const textPart = { text: userPromptText };

    const apiCall = async () => {
        const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: { parts: [imagePart, textPart] },
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text.trim();
    };

    try {
        return await withRetry(apiCall, 10, 2000, 'generateCharacterPromptFromImage');
    } catch (error) {
        throw new Error(getErrorMessage(error, 'generateCharacterPromptFromImage', language));
    }
};

export const generateCharacterImage = async (
    prompt: string,
    language: Language
): Promise<string> => {
    const model = 'gemini-2.5-flash-image';
    
    const enhancedPrompt = `Create a high-quality, detailed character design or object asset based on this description. Isolate on a simple or white background for reference use: ${prompt}`;

    const apiCall = async () => {
        const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: enhancedPrompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image data found in the response.");
    };

    try {
        return await withRetry(apiCall, 10, 5000, 'generateCharacterImage');
    } catch (error) {
        throw new Error(getErrorMessage(error, 'generateCharacterImage', language));
    }
};

export const generateCharacterPromptVariations = async (
    characterName: string,
    animationStyle: string,
    storyStyle: string,
    language: Language,
): Promise<CharacterVariation[]> => {
    const systemInstruction = translations[language].systemInstruction_generateCharacterVariations(characterName, animationStyle, storyStyle);
    const userPrompt = "Please generate 3 character variations based on the system instruction.";
    
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        variations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ['title', 'description']
          }
        }
      },
      required: ['variations']
    };

    const apiCall = async () => {
        const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.9,
            },
        });

        const jsonStr = response.text.trim();
        const parsedJson = JSON.parse(jsonStr);

        if (parsedJson.variations && Array.isArray(parsedJson.variations)) {
            return parsedJson.variations;
        }
        
        throw new Error("Invalid JSON structure for character variations received from API.");
    };

    try {
        return await withRetry(apiCall, 10, 2000, 'generateCharacterPromptVariations');
    } catch (error) {
        throw new Error(getErrorMessage(error, 'generateCharacterPromptVariations', language));
    }
};

export const generateCharacterRoster = async (
    style: string,
    storyIdea: string,
    charCount: number,
    propCount: number,
    language: Language
): Promise<{ name: string; description: string; short_id: string; type: 'character' | 'prop' }[]> => {
    const systemInstruction = translations[language].systemInstruction_generateCharacterRoster(style, storyIdea, charCount, propCount);
    const userPrompt = `Generate ${charCount} Characters and ${propCount} Props/Assets for the topic "${storyIdea}".`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            characters: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        short_id: { type: Type.STRING, description: "A very short, unique identifier (max 8 chars, no spaces). e.g., 'hero', 'sword'" },
                        type: { type: Type.STRING, enum: ['character', 'prop'] },
                        description: { type: Type.STRING }
                    },
                    required: ['name', 'description', 'short_id', 'type']
                }
            }
        },
        required: ['characters']
    };

    const apiCall = async () => {
        const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.95,
            },
        });

        const jsonStr = response.text.trim();
        const parsedJson = JSON.parse(jsonStr);

        if (parsedJson.characters && Array.isArray(parsedJson.characters)) {
            return parsedJson.characters;
        }
        throw new Error("Invalid JSON structure for character roster.");
    };

    try {
        return await withRetry(apiCall, 10, 2000, 'generateCharacterRoster');
    } catch (error) {
        throw new Error(getErrorMessage(error, 'generateCharacterRoster', language));
    }
};

export const generateStoryIdea = async (
  animationStyle: string,
  storyStyle: string,
  language: Language,
  characterDescriptions: string,
): Promise<string> => {
    const systemInstruction = translations[language].systemInstruction_generateStoryIdea(animationStyle, storyStyle, characterDescriptions);
    const userPrompt = "Please generate an animation story concept for the character(s) provided in the system instruction.";

    const apiCall = async () => {
        const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.9,
            }
        });
        return response.text.trim();
    };

  try {
     return await withRetry(apiCall, 10, 2000, 'generateStoryIdea');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'generateStoryIdea', language));
  }
};

export const refineStoryIdea = async (
    originalIdea: string,
    config: VideoConfig,
    storyStyle: string,
    language: Language
): Promise<string> => {
    const languageName = DIALOGUE_LANGUAGES.find(lang => lang.key === config.dialogueLanguage)?.en || config.dialogueLanguage;
    const systemInstruction = translations[language].systemInstruction_refineStoryIdea(config.style, storyStyle, languageName);
    
    const userPrompt = `Original Idea: "${originalIdea}"\n\nPlease refine and optimize this into a viral format.`;

    const apiCall = async () => {
        const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
            }
        });
        return response.text.trim();
    };

    try {
        return await withRetry(apiCall, 10, 2000, 'refineStoryIdea');
    } catch (error) {
        throw new Error(getErrorMessage(error, 'refineStoryIdea', language));
    }
}

export const generateStoryFromCharacters = async (
    characterReferences: CharacterReference[],
    storyIdea: string,
    config: VideoConfig,
    language: Language
): Promise<string> => {
    const sceneDuration = 8;
    const totalScenes = Math.max(1, Math.ceil(config.duration / sceneDuration));
    const languageName = DIALOGUE_LANGUAGES.find(l => l.key === config.dialogueLanguage)?.en || "English";
    
    // Include visual traits and TYPE logic
    const availableCharacters = characterReferences.map(c => `ID: ${c.normalizedName} | Name: ${c.name} | Type: ${c.type} | Visual: ${c.prompt || 'N/A'}`).join('\n');
    
    const systemInstruction = translations[language].systemInstruction_generateStoryFromCharacters(availableCharacters, totalScenes, config.duration, storyIdea, config.style);
    
    const userPrompt = `
    WRITE A SCREENPLAY (SCRIPT).
    
    Topic/Idea: ${storyIdea}.
    Style: ${config.style}.
    Target Length: ${config.duration} seconds.
    
    DIALOGUE SETTINGS:
    - Include Dialogue: ${config.includeDialogue}
    - Dialogue Language: ${languageName}
    
    Instructions:
    - If 'Include Dialogue' is true, write the lines for characters/narrator in ${languageName}.
    - If 'Include Dialogue' is false, write (No Dialogue).
    
    Available Assets:
    ${availableCharacters}
    `;

    const apiCall = async () => {
        const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
            }
        });
        return response.text.trim();
    };

    try {
        return await withRetry(apiCall, 10, 2000, 'generateStoryFromCharacters');
    } catch (error) {
        throw new Error(getErrorMessage(error, 'generateStoryFromCharacters', language));
    }
};

// Re-architected to support batching for long-form content
export const enrichVeoPromptsInBatch = async (
    storyText: string,
    config: VideoConfig,
    characterReferences: CharacterReference[],
    language: Language,
    startScene: number,
    scenesToGenerate: number,
    totalScenes: number
): Promise<{ references: string[], prompt: string, dialogue: string }[]> => {
    const availableCharacters = characterReferences.map(c => `ID: ${c.normalizedName} (${c.name}) [${c.type}]`).join(', ');
    const languageName = DIALOGUE_LANGUAGES.find(l => l.key === config.dialogueLanguage)?.en || "English";
    const endScene = startScene + scenesToGenerate - 1;

    const systemInstruction = translations[language].systemInstruction_enrichVeoPrompts(
        config.style, 
        config.aspectRatio, 
        totalScenes, 
        availableCharacters,
        startScene,
        endScene,
        languageName
    );
    
    const userPrompt = `
    SCREENPLAY SOURCE:
    ${storyText}
    
    DIRECTOR'S TASK (CURRENT BATCH: Scenes ${startScene} to ${endScene}): 
    1. Analyze the full screenplay for context.
    2. Split the story section corresponding to scenes ${startScene}-${endScene} into exactly ${scenesToGenerate} continuous scenes.
    3. Generate a Veo 3 detailed VISUAL prompt for each using the [TIMELINE: 0-2s, 2-6s, 6-8s] formula.
    4. **ONE-SHOT RULE:** Ensure Scene N ends exactly where Scene N+1 begins.
    5. **DIALOGUE RULE:** Extract dialogue for each scene VERBATIM in ${languageName}. Do not translate.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            scenes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        references: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING }, 
                            description: "List of character/prop IDs active in this scene" 
                        },
                        prompt: { 
                            type: Type.STRING, 
                            description: "The Veo 3 optimized visual prompt with timeline breakdown" 
                        },
                        dialogue: {
                            type: Type.STRING,
                            description: `Spoken dialogue or narration for this scene in ${languageName}. Empty string if no dialogue.`
                        }
                    },
                    required: ['references', 'prompt', 'dialogue']
                }
            }
        },
        required: ['scenes']
    };

    const apiCall = async () => {
        const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.85,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });
        
        const jsonStr = response.text.trim();
        const parsedJson = JSON.parse(jsonStr);
        
        if (parsedJson.scenes && Array.isArray(parsedJson.scenes)) {
             if (parsedJson.scenes.length > scenesToGenerate) {
                console.warn(`AI generated ${parsedJson.scenes.length} scenes for batch, but only ${scenesToGenerate} were requested. Truncating.`);
            }
            return parsedJson.scenes.slice(0, scenesToGenerate);
        }
        throw new Error("Invalid JSON response for enriched prompts");
    };

    try {
        return await withRetry(apiCall, 10, 2000, `enrichVeoPromptsInBatch (Scenes ${startScene}-${endScene})`);
    } catch (error) {
        throw new Error(getErrorMessage(error, `enrichVeoPromptsInBatch`, language));
    }
};


export const generateScript = async (
  storyIdea: string,
  config: VideoConfig,
  language: Language,
  characterDescriptions: string,
): Promise<string> => {
    const systemInstruction = translations[language].systemInstruction_generateScript(config, characterDescriptions);

    const userPrompt = `
        **Animation Story Idea:**
        ${storyIdea}

        **Animation Style:** ${config.style}
    `;

    const apiCall = async () => {
        const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.9,
            }
        });
        return response.text.trim();
    };

  try {
    return await withRetry(apiCall, 10, 2000, 'generateScript');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'generateScript', language));
  }
};

// ... Schema definitions ...
const SCENE_PROMPT_REQUIRED_FIELDS = [
    'scene_description', 'character_description', 'background_description', 
    'camera_shot', 'lighting', 'color_palette', 'style', 'composition_notes', 
    'sound_effects', 'dialogue', 'keywords', 'negative_prompts', 'aspect_ratio', 
    'duration_seconds'
];

const scenePromptSchema = {
    type: Type.OBJECT,
    properties: {
        scene_description: { type: Type.STRING },
        character_description: { type: Type.STRING },
        background_description: { type: Type.STRING },
        camera_shot: { type: Type.STRING },
        lighting: { type: Type.STRING },
        color_palette: { type: Type.STRING },
        style: { type: Type.STRING },
        composition_notes: { type: Type.STRING },
        sound_effects: { type: Type.STRING },
        dialogue: { type: Type.STRING },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        negative_prompts: { type: Type.ARRAY, items: { type: Type.STRING } },
        aspect_ratio: { type: Type.STRING },
        duration_seconds: { type: Type.INTEGER },
    },
    required: SCENE_PROMPT_REQUIRED_FIELDS,
};

const scenesResponseSchema = {
    type: Type.OBJECT,
    properties: {
        scenes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    scene_id: { type: Type.INTEGER },
                    time: { type: Type.STRING },
                    prompt: scenePromptSchema,
                },
                required: ['scene_id', 'time', 'prompt']
            }
        }
    },
    required: ['scenes']
};

export const generateScenePrompts = async (
  generatedScript: string,
  config: VideoConfig,
  language: Language,
  characterDescriptions: string,
  existingScenesCount: number,
  scenesPerBatch: number,
): Promise<Scene[]> => {
    const SCENE_DURATION = 8;
    const totalScenesRequired = Math.ceil(config.duration / SCENE_DURATION);
    
    if (existingScenesCount >= totalScenesRequired) {
        return [];
    }

    const startSceneId = existingScenesCount + 1;
    let scenesToGenerate = scenesPerBatch;
    if (existingScenesCount + scenesToGenerate > totalScenesRequired) {
        scenesToGenerate = totalScenesRequired - existingScenesCount;
    }
    const endSceneId = startSceneId + scenesToGenerate - 1;
    
    const systemInstruction = translations[language].systemInstruction_generateScenes(
        config, 
        characterDescriptions, 
        startSceneId, 
        endSceneId
    );
    
    const userPrompt = `
        **Full Animation Script:**
        ${generatedScript}

        **Task Definition:**
        - Total Video Duration: ${config.duration}s (${totalScenesRequired} scenes total).
        - Current Status: ${existingScenesCount} scenes already generated.
        - **ACTION REQUIRED:** Generate scene prompts for **Scene ${startSceneId} to Scene ${endSceneId}** ONLY.
        
        **Instructions:**
        1. Analyze the script content corresponding to Scene ${startSceneId} through Scene ${endSceneId}.
        2. Create exactly ${scenesToGenerate} JSON objects in the 'scenes' array.
        3. Ensure the \`scene_id\` starts at ${startSceneId} and increments to ${endSceneId}.
        4. Do NOT regenerate Scene 1 or any scenes before ${startSceneId}.
    `;

    const apiCall = async () => {
        const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: scenesResponseSchema,
                temperature: 0.9,
            }
        });
        
        const jsonStr = response.text.trim();
        const parsedJson = JSON.parse(jsonStr);

        if (parsedJson.scenes && Array.isArray(parsedJson.scenes)) {
            return parsedJson.scenes.slice(0, scenesToGenerate) as Scene[];
        } else {
            console.warn("Received unexpected JSON structure.", parsedJson);
            return [];
        }
    };

    try {
        return await withRetry(apiCall, 10, 2000, 'generateScenePrompts');
    } catch (error) {
        throw new Error(getErrorMessage(error, 'generateScenePrompts', language));
    }
};
  
export const generateSceneImage = async (scenePrompt: ScenePrompt, referenceImageBase64: string, language: Language): Promise<string> => {
      const model = 'gemini-2.5-flash-image';
      
      const match = referenceImageBase64.match(/^data:(image\/.+);base64,(.+)$/);
      if (!match) throw new Error("Invalid base64");
      
      const imagePart = { inlineData: { mimeType: match[1], data: match[2] } };
      const textPart = {
          text: `Using the provided reference image for character and style consistency, create a single animation frame based on this prompt: ${JSON.stringify(scenePrompt, null, 2)}`
      };
  
      const apiCall = async () => {
          const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
          const response: GenerateContentResponse = await ai.models.generateContent({
              model,
              contents: { parts: [imagePart, textPart] },
              config: { responseModalities: [Modality.IMAGE] },
          });
  
          for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
          }
          throw new Error("No image data found.");
      };
      
      try {
        return await withRetry(apiCall, 10, 5000, 'generateSceneImage');
      } catch (error) {
        throw new Error(getErrorMessage(error, 'generateSceneImage', language));
      }
};

export const generateMultiReferenceImage = async (
    promptText: string, 
    referenceImagesBase64: string[], 
    style: string,
    aspectRatio: '9:16' | '16:9',
    language: Language
): Promise<string> => {
    const model = 'gemini-2.5-flash-image';
    
    const parts: any[] = [];
    
    for (const base64 of referenceImagesBase64) {
        const match = base64.match(/^data:(image\/.+);base64,(.+)$/);
        if (match) {
            parts.push({
                inlineData: { mimeType: match[1], data: match[2] }
            });
        }
    }

    const textPrompt = `
    Style: ${style}.
    Aspect Ratio: ${aspectRatio} ${aspectRatio === '9:16' ? '(Vertical/Portrait)' : '(Horizontal/Landscape)'}.
    
    Task: Create a high-quality animation frame based on the user's description. 
    The user has provided ${referenceImagesBase64.length} reference images.
    Please maintain the appearance of these characters/objects exactly as shown in the references.
    
    Description:
    ${promptText}
    `;
    
    parts.push({ text: textPrompt });

    const apiCall = async () => {
        const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: { parts },
            config: { responseModalities: [Modality.IMAGE] },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        throw new Error("No image data found.");
    };
    
    try {
      return await withRetry(apiCall, 10, 5000, 'generateMultiReferenceImage');
    } catch (error) {
      throw new Error(getErrorMessage(error, 'generateMultiReferenceImage', language));
    }
};
