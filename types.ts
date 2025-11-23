

export type AssetType = 'character' | 'prop';

export interface CharacterReference {
  id: string;
  name: string;
  normalizedName: string; // Added for (name1,name2) syntax matching
  type: AssetType; // New field: character vs prop
  prompt: string;
  imageUrl: string | null;
}

export interface CharacterVariation {
  title: string;
  description: string;
}

export interface ScenePrompt {
  scene_description: string;
  character_description: string; 
  background_description: string;
  camera_shot: string;
  lighting: string;
  color_palette: string;
  style: string;
  composition_notes: string;
  sound_effects: string;
  dialogue: string;
  keywords: string[];
  negative_prompts: string[];
  aspect_ratio: string;
  duration_seconds: number;
}


export interface Scene {
  scene_id: number;
  time: string;
  prompt: ScenePrompt; // We will reuse this structure for the prompt text
  imageUrl?: string;
  isGeneratingImage?: boolean;
  rawPromptText?: string; // The original line entered by user
  usedReferences?: string[]; // List of normalized names used
}

export interface VideoConfig {
  duration: number;
  style: string;
  includeDialogue: boolean;
  dialogueLanguage: string;
  format: 'viral_facts' | 'scary_story' | 'motivational' | 'life_hacks' | 'history_mystery' | 'quiz_trivia' | 'silent_visual';
  aspectRatio: '9:16' | '16:9';
}

export interface Project {
  id: string;
  name: string;
  characterReferences: CharacterReference[];
  storyIdea: string;
  generatedScript: string;
  videoConfig: VideoConfig;
  scenes: Scene[];
  apiProvider: string;
  selectedModel: string;
  lastModified: number;
}
