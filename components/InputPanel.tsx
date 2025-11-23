
import React, { useState, useEffect, useRef } from 'react';
import type { CharacterReference, VideoConfig, Scene, AssetType } from '../types';
import { VIDEO_STYLES, VIDEO_FORMATS, normalizeString, DIALOGUE_LANGUAGES } from '../constants';
import SparklesIcon from './icons/SparklesIcon';
import type { TranslationKeys, Language } from '../translations';
import PhotoGroupIcon from './icons/PhotoGroupIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import WandIcon from './icons/WandIcon';
import CameraIcon from './icons/CameraIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import CodeBracketIcon from './icons/CodeBracketIcon';

interface InputPanelProps {
  scenes: Scene[];
  characterReferences: CharacterReference[];
  onUpdateCharacter: (id: string, field: keyof CharacterReference, value: string | null) => void;
  onAddCharacter: () => void;
  onDeleteCharacter: (id: string) => void;
  onGenerateCharacterPrompt: (characterId: string, file: File) => Promise<void>;
  onSuggestCharacterPrompt: (characterId: string) => Promise<void>;
  onGenerateCharacterImage: (characterId: string) => Promise<void>;
  isGeneratingPromptId: string | null;
  isSuggestingPromptId: string | null;
  isGeneratingImageId: string | null;
  storyIdea: string;
  setStoryIdea: React.Dispatch<React.SetStateAction<string>>;
  storyStyle: string;
  setStoryStyle: React.Dispatch<React.SetStateAction<string>>;
  generatedScript: string;
  videoConfig: VideoConfig;
  setVideoConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
  onPrimaryAction: () => void;
  isLoading: boolean;
  onGenerateStoryIdea: () => void;
  onSuggestStoryFromCharacters: () => void;
  onRefineStory: () => void;
  onAutoGenerateRoster: (charCount: number, propCount: number) => void;
  isRefining: boolean;
  cooldowns: { [key: string]: boolean };
  t: TranslationKeys;
  language: Language;
}

const CharacterCard: React.FC<{
    character: CharacterReference;
    onUpdate: (id: string, field: keyof CharacterReference, value: string | null) => void;
    onDelete: (id: string) => void;
    onGeneratePrompt: (id: string, file: File) => void;
    onSuggestPrompt: (id: string) => void;
    onGenerateImage: (id: string) => void;
    isGeneratingFromImage: boolean;
    isSuggesting: boolean;
    isGeneratingImage: boolean;
    t: TranslationKeys;
}> = ({ character, onUpdate, onDelete, onGeneratePrompt, onSuggestPrompt, onGenerateImage, isGeneratingFromImage, isSuggesting, isGeneratingImage, t }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTriggerFileInput = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onGeneratePrompt(character.id, file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    return (
        <div className="bg-[#0D0D0F] p-4 rounded-lg border border-gray-700 space-y-4">
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
            />
            <div className="flex justify-between items-start gap-4">
                <div className="flex-grow space-y-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder={t.characterNamePlaceholder}
                            value={character.name}
                            onChange={(e) => onUpdate(character.id, 'name', e.target.value)}
                            className="w-full bg-transparent text-lg font-semibold text-gray-200 placeholder-gray-500 border-b-2 border-gray-700 focus:border-[#5BEAFF] focus:outline-none transition-colors"
                        />
                        <select
                            value={character.type}
                            onChange={(e) => onUpdate(character.id, 'type', e.target.value as AssetType)}
                            className="bg-gray-800 text-xs text-gray-300 border border-gray-600 rounded px-2 outline-none focus:border-[#5BEAFF]"
                            title={t.typeLabel}
                        >
                            <option value="character">{t.typeCharacter}</option>
                            <option value="prop">{t.typeProp}</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-900 p-1 rounded">
                        <span className="uppercase font-bold text-gray-400">ID:</span>
                        <input 
                            type="text"
                            value={character.normalizedName}
                            onChange={(e) => onUpdate(character.id, 'normalizedName', e.target.value)}
                            className="bg-transparent text-cyan-400 font-mono focus:outline-none w-full"
                            placeholder="short_id"
                        />
                    </div>
                </div>
                <button 
                    onClick={() => onDelete(character.id)} 
                    className="text-gray-500 hover:text-red-400 transition-colors"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div 
                        onClick={handleTriggerFileInput}
                        className="relative aspect-square w-full bg-gray-900/50 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#5BEAFF] transition-colors group"
                    >
                        {isGeneratingImage ? (
                            <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-cyan-400"></div>
                        ) : character.imageUrl ? (
                            <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-gray-500 p-2">
                                <PhotoGroupIcon className="w-8 h-8 mx-auto mb-1" />
                                <p className="text-xs font-semibold">{t.uploadImagePrompt}</p>
                            </div>
                        )}
                    </div>
                     <div className="grid grid-cols-3 gap-2">
                         <button
                            onClick={() => onGenerateImage(character.id)}
                            disabled={isGeneratingFromImage || isSuggesting || isGeneratingImage || !character.prompt.trim()}
                            className="w-full flex items-center justify-center gap-x-1.5 text-xs font-semibold text-center text-white hover:text-cyan-100 py-1.5 bg-cyan-700/50 hover:bg-cyan-600/50 border border-cyan-600 rounded-lg transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-700 disabled:cursor-not-allowed"
                        >
                            <CameraIcon className="w-4 h-4" />
                            {isGeneratingImage ? "..." : "Render"}
                        </button>
                        <button
                            onClick={handleTriggerFileInput}
                            disabled={isGeneratingFromImage || isSuggesting || isGeneratingImage}
                            className="w-full flex items-center justify-center gap-x-1.5 text-xs font-semibold text-center text-cyan-300 hover:text-cyan-100 py-1.5 border border-gray-600 hover:border-[#5BEAFF] rounded-lg transition-colors disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                            <WandIcon className="w-4 h-4" />
                            {isGeneratingFromImage ? "..." : "Scan"}
                        </button>
                         <button
                            onClick={() => onSuggestPrompt(character.id)}
                            disabled={isGeneratingFromImage || isSuggesting || isGeneratingImage || !character.name.trim()}
                            className="w-full flex items-center justify-center gap-x-1.5 text-xs font-semibold text-center text-cyan-300 hover:text-cyan-100 py-1.5 border border-gray-600 hover:border-[#5BEAFF] rounded-lg transition-colors disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                            <SparklesIcon className="w-4 h-4" />
                             {isSuggesting ? "..." : "Idea"}
                        </button>
                    </div>
                </div>
                <textarea
                    rows={8}
                    className="w-full h-full bg-gray-900/50 text-gray-300 p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-[#5BEAFF] focus:border-[#5BEAFF] transition text-sm"
                    placeholder={t.characterPromptPlaceholder}
                    value={character.prompt}
                    onChange={(e) => onUpdate(character.id, 'prompt', e.target.value)}
                />
            </div>
        </div>
    );
};


export const InputPanel: React.FC<InputPanelProps> = ({
  scenes,
  characterReferences,
  onUpdateCharacter,
  onAddCharacter,
  onDeleteCharacter,
  onGenerateCharacterPrompt,
  onSuggestCharacterPrompt,
  onGenerateCharacterImage,
  isGeneratingPromptId,
  isSuggestingPromptId,
  isGeneratingImageId,
  storyIdea,
  setStoryIdea,
  storyStyle,
  setStoryStyle,
  generatedScript,
  videoConfig,
  setVideoConfig,
  onPrimaryAction,
  isLoading,
  onGenerateStoryIdea,
  onSuggestStoryFromCharacters,
  onRefineStory,
  onAutoGenerateRoster,
  isRefining,
  cooldowns,
  t,
  language,
}) => {
  const [charCount, setCharCount] = useState<number>(3);
  const [propCount, setPropCount] = useState<number>(2);

  // Automatically disable dialogue for silent format
  useEffect(() => {
    if (videoConfig.format === 'silent_visual') {
        setVideoConfig((prev) => ({ ...prev, includeDialogue: false }));
    }
  }, [videoConfig.format, setVideoConfig]);


  const handleConfigChange = <K extends keyof VideoConfig>(key: K, value: VideoConfig[K]) => {
    setVideoConfig((prev) => ({ ...prev, [key]: value }));
  };
  
  const hasAtLeastOneCharacter = characterReferences.length > 0;
  
  const isLongForm = videoConfig.aspectRatio === '16:9';
  const displayDuration = isLongForm 
    ? (videoConfig.duration > 0 ? videoConfig.duration / 60 : '') 
    : (videoConfig.duration || '');

  return (
    <div className="p-6 bg-[#1E1E22] rounded-lg shadow-lg space-y-8">
        
       {/* Section 1: Guide */}
      <div className="bg-[#0D0D0F] p-4 rounded border border-gray-700">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-100 mb-2">
            <InformationCircleIcon className="w-5 h-5 text-[#5BEAFF]" />
            {t.guideModalTitle} (Consistency Mode)
        </h3>
        <div className="text-sm text-gray-400 space-y-2">
            <p>1. <b>{t.characterRosterLabel}</b>: Upload specific images for characters or items. Check the <code className="text-cyan-400">ID</code> and <code className="text-purple-400">Type</code>.</p>
            <p>2. <b>Syntax</b>: Use <code className="text-yellow-300">(id1,id2) prompt description</code> to assign specific characters to a prompt.</p>
            <p className="italic opacity-70">Ex: (cat,dog) a cat and a dog playing poker</p>
        </div>
      </div>

      {/* Section 2: Assets */}
      <div>
        <div className="flex justify-between items-end mb-2">
            <h3 className="block text-lg font-semibold text-gray-200">
                {t.characterRosterLabel}
            </h3>
        </div>
        <div className="space-y-4">
            {characterReferences.map(char => (
                <CharacterCard
                    key={char.id}
                    character={char}
                    onUpdate={onUpdateCharacter}
                    onDelete={onDeleteCharacter}
                    onGeneratePrompt={onGenerateCharacterPrompt}
                    onSuggestPrompt={onSuggestCharacterPrompt}
                    onGenerateImage={onGenerateCharacterImage}
                    isGeneratingFromImage={isGeneratingPromptId === char.id}
                    isSuggesting={isSuggestingPromptId === char.id}
                    isGeneratingImage={isGeneratingImageId === char.id}
                    t={t}
                />
            ))}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={onAddCharacter}
                    className="w-full flex items-center justify-center gap-x-2 text-sm font-semibold text-center text-gray-300 hover:text-white py-3 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    {t.addCharacterButton}
                </button>
                 <div className="flex gap-2 items-center">
                     <div className="flex flex-col">
                         <label className="text-[10px] text-gray-500 text-center uppercase">{t.charCountLabel}</label>
                         <input
                            type="number"
                            min="1"
                            max="10"
                            className="w-14 bg-[#0D0D0F] text-gray-300 p-2 rounded-l-lg border border-cyan-800/50 text-sm focus:ring-1 focus:ring-[#5BEAFF] text-center"
                            value={charCount}
                            onChange={(e) => setCharCount(Number(e.target.value))}
                            title="Num Characters"
                         />
                     </div>
                     <div className="flex flex-col">
                         <label className="text-[10px] text-gray-500 text-center uppercase">{t.propCountLabel}</label>
                         <input
                            type="number"
                            min="0"
                            max="10"
                            className="w-14 bg-[#0D0D0F] text-gray-300 p-2 rounded-r-lg border-y border-r border-cyan-800/50 text-sm focus:ring-1 focus:ring-[#5BEAFF] text-center"
                            value={propCount}
                            onChange={(e) => setPropCount(Number(e.target.value))}
                            title="Num Props"
                         />
                     </div>
                     <button
                        onClick={() => onAutoGenerateRoster(charCount, propCount)}
                        disabled={cooldowns['autoRoster'] || isLoading}
                        className="flex-grow flex items-center justify-center gap-x-2 text-sm font-semibold text-center text-cyan-300 hover:text-white py-3 border-2 border-dashed border-cyan-800/50 hover:border-cyan-600 hover:bg-cyan-900/20 rounded-lg transition-colors disabled:text-gray-500 disabled:border-gray-700 disabled:cursor-not-allowed ml-1 h-[54px]"
                        title={t.tooltips.autoGenerateRoster}
                    >
                        <SparklesIcon className={`w-5 h-5 ${cooldowns['autoRoster'] ? 'animate-spin' : ''}`} />
                        {t.autoGenerateRosterButton}
                    </button>
                 </div>
            </div>
        </div>
      </div>

      {/* Section 3: Prompts Input */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4">
             <label htmlFor="storyIdea" className="block text-lg font-semibold text-gray-200">
                1. {t.storyIdeaLabel}
            </label>
             <div className="flex items-center gap-2">
                 <input
                    type="number"
                    value={displayDuration}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        const seconds = isLongForm ? val * 60 : val;
                        handleConfigChange('duration', isNaN(seconds) ? 0 : seconds);
                    }}
                    placeholder={isLongForm ? "e.g., 5" : t.durationPlaceholder}
                    className="w-24 bg-[#0D0D0F] text-gray-300 p-1.5 rounded-md border border-gray-700 focus:ring-1 focus:ring-[#5BEAFF] transition text-sm text-center"
                    title={t.durationLabel}
                    step={isLongForm ? "0.5" : "1"}
                 />
                 <span className="text-xs text-gray-500">{isLongForm ? "min" : "sec"}</span>
                 
                <button
                    onClick={onSuggestStoryFromCharacters}
                    disabled={isLoading || isRefining || !hasAtLeastOneCharacter || cooldowns['suggestFromAssets'] || !videoConfig.duration}
                    className="flex items-center gap-x-1.5 text-xs font-semibold bg-purple-900/50 text-purple-200 hover:bg-purple-800/50 disabled:bg-gray-800 disabled:text-gray-500 transition-colors border border-purple-700 disabled:border-gray-700 rounded px-3 py-1.5 ml-2"
                    title={t.tooltips.suggestFromAssets}
                >
                    <SparklesIcon className={`w-3 h-3 ${cooldowns['suggestFromAssets'] ? 'animate-spin' : ''}`} />
                    {t.suggestFromAssetsButton}
                </button>
            </div>
        </div>
        
        <p className="text-xs text-gray-500 mb-2">
             Enter each scene action on a new line. Use (id) syntax for logic. 
             {videoConfig.duration > 0 && <span className="ml-2 text-cyan-400 font-bold">{t.durationFeedback(Math.ceil(videoConfig.duration / 8), videoConfig.duration)}</span>}
        </p>
        <textarea
          id="storyIdea"
          rows={10}
          className="w-full bg-[#0D0D0F] text-gray-300 p-3 rounded-md border border-gray-700 focus:ring-2 focus:ring-[#5BEAFF] focus:border-[#5BEAFF] transition font-mono text-sm whitespace-pre"
          placeholder={t.storyIdeaPlaceholder}
          value={storyIdea}
          onChange={(e) => setStoryIdea(e.target.value)}
        />
        
        <div className="mt-2 flex justify-end gap-2">
             <button
                onClick={onRefineStory}
                disabled={isLoading || isRefining || !storyIdea.trim() || cooldowns['refineIdea']}
                className="flex items-center gap-x-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-100 disabled:text-gray-500 transition-colors border border-gray-700 rounded px-3 py-1"
            >
                <WandIcon className={`w-3 h-3 ${isRefining ? 'animate-spin' : ''}`} />
                {isRefining ? "Optimizing..." : "Optimize Script"}
            </button>
        </div>
      </div>
      
      {/* Section 4: Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">{t.videoSettingsLabel}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="md:col-span-2 lg:col-span-1">
            <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-400 mb-2">{t.aspectRatioLabel}</label>
            <select
              id="aspectRatio"
              className="w-full bg-[#0D0D0F] text-gray-300 p-3 rounded-md border border-gray-700 focus:ring-2 focus:ring-[#5BEAFF] focus:border-[#5BEAFF] transition"
              value={videoConfig.aspectRatio}
              onChange={(e) => handleConfigChange('aspectRatio', e.target.value as '9:16' | '16:9')}
            >
              <option value="9:16">{t.ratio916}</option>
              <option value="16:9">{t.ratio169}</option>
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label htmlFor="style" className="block text-sm font-medium text-gray-400 mb-2">{t.styleLabel}</label>
            <select
              id="style"
              className="w-full bg-[#0D0D0F] text-gray-300 p-3 rounded-md border border-gray-700 focus:ring-2 focus:ring-[#5BEAFF] focus:border-[#5BEAFF] transition"
              value={videoConfig.style}
              onChange={(e) => handleConfigChange('style', e.target.value)}
            >
              {VIDEO_STYLES.map(style => <option key={style.key} value={style.key}>{style[language]}</option>)}
            </select>
          </div>

           <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-400 mb-2 opacity-0">.</label>
                 <div className="flex items-center justify-between bg-[#0D0D0F] p-3 rounded-md border border-gray-700 h-[46px]">
                    <label htmlFor="includeDialogue" className="text-sm font-medium text-gray-400 cursor-pointer select-none">
                    {t.includeDialogueLabel}
                    </label>
                    <input
                    id="includeDialogue"
                    type="checkbox"
                    checked={videoConfig.includeDialogue}
                    onChange={(e) => handleConfigChange('includeDialogue', e.target.checked)}
                    disabled={videoConfig.format === 'silent_visual'}
                    className="w-5 h-5 rounded border-gray-600 text-[#5BEAFF] focus:ring-[#5BEAFF] bg-gray-900 cursor-pointer"
                    />
                </div>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <label htmlFor="dialogueLanguage" className="block text-sm font-medium text-gray-400 mb-2">{t.dialogueLanguageLabel}</label>
            <select
              id="dialogueLanguage"
              className="w-full bg-[#0D0D0F] text-gray-300 p-3 rounded-md border border-gray-700 focus:ring-2 focus:ring-[#5BEAFF] focus:border-[#5BEAFF] transition disabled:opacity-50 disabled:cursor-not-allowed"
              value={videoConfig.dialogueLanguage}
              onChange={(e) => handleConfigChange('dialogueLanguage', e.target.value)}
              disabled={!videoConfig.includeDialogue}
            >
              {DIALOGUE_LANGUAGES.map(lang => <option key={lang.key} value={lang.key}>{lang[language]}</option>)}
            </select>
          </div>
      </div>
      </div>

      <button
        onClick={onPrimaryAction}
        disabled={isLoading || cooldowns['mainAction'] || !storyIdea.trim()}
        className="w-full flex items-center justify-center gap-x-2 bg-[#5BEAFF] text-[#0D0D0F] font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105"
        title={t.tooltips.mainAction}
      >
        {isLoading ? <SparklesIcon className="w-6 h-6 animate-spin" /> : <CodeBracketIcon className="w-6 h-6" />}
        {isLoading ? t.generatingPromptButton : t.generatePromptListButton}
      </button>
    </div>
  );
};