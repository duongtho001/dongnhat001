


import type { VideoConfig } from './types';
import { DIALOGUE_LANGUAGES } from './constants';

export type Language = 'en' | 'vi';

const en = {
    // ... (previous translations)
    // App.tsx
    untitledProject: "Untitled Video Project",
    generationStatusPreparing: "Director is analyzing script & Creating shots...",
    generationStatusRequesting: (batch: number) => `Requesting scene batch #${batch}...`,
    generationIncompleteError: (current: number, total: number) => `Generation incomplete. Only ${current} out of ${total} scenes were generated. You can try to resume.`,
    errorGeneratingImage: "An error occurred while generating the image.",
    errorQuotaExceeded: "API quota exceeded. You've made too many requests in a short period. Please wait a moment and try again.",
    errorInvalidApiKey: (context: string) => `The API key is not valid. Please check your environment configuration. (Context: ${context})`,
    errorNoApiKey: "No API Key configured. Please add one in the settings.",
    errorServerOverloaded: (context: string) => `The model is currently busy or overloaded. Please try again in a few moments. (Context: ${context})`,
    errorGeneric: (context: string, message: string) => `Error in ${context}: ${message}`,
    errorUnknown: (context: string) => `An unknown error occurred in ${context}.`,
    generationFailedCanResume: (errorMsg: string) => `Scene generation failed: ${errorMsg}. You can try to resume the process.`,
    errorGeneratingPrompt: "An error occurred while generating the character prompt from the image.",
    newCharacterName: "New Asset",
    errorNetworkOrProxy: "A network error occurred. Please check your connection.",

    // Header.tsx
    appTitle: "AI Video Studio",
    appDescription: "Create viral Shorts & Long-form videos",
    newProjectButton: "New Project",
    guideButtonTooltip: "Show User Guide",
    languageLabel: "Language",

    // InputPanel.tsx
    characterRosterLabel: "Characters / Props / Assets",
    characterRosterHint: "STRICT RULE: Characters = Living/Moving entities. Props = Inanimate objects/Backgrounds.",
    addCharacterButton: "Add Asset",
    autoGenerateRosterButton: "Magic Create",
    characterNamePlaceholder: "e.g., Narrator, Spooky Ghost, Golden Trophy...",
    characterImageLabel: "Reference Image",
    uploadImagePrompt: "Upload Image",
    generatePromptFromImageButton: "From Image",
    generatingPromptButton: "Analyzing...",
    suggestPromptButton: "Suggest Visuals",
    suggestingPromptButton: "Thinking...",
    generateCharacterImageButton: "Render Visual",
    characterPromptLabel: "Visual Description (Prompt)",
    characterPromptPlaceholder: "Describe the character or object in detail for consistency (e.g., 'A cyberpunk hacker with neon goggles').",
    storyIdeaLabel: "Story / Script (Full Text)",
    suggestIdeaButton: "Suggest Viral Topic",
    suggestFromAssetsButton: "Suggest Script from Characters",
    refineIdeaButton: "Refine & Optimize",
    refiningIdeaButton: "Polishing...",
    onCooldownButton: "Wait...",
    suggestingIdeaButton: "Brainstorming...",
    storyIdeaPlaceholder: "Write your full story or script here. Don't worry about formatting.\nThe AI will automatically analyze it and break it down into scene prompts for you.",
    generatedScriptLabel: "Generated Script",
    videoSettingsLabel: "Video Configuration",
    durationLabel: "Target Duration (seconds)",
    durationPlaceholder: "e.g., 45",
    durationFeedback: (scenes: number, totalSeconds: number) => `~${scenes} scenes (Total: ${totalSeconds}s).`,
    videoFormatLabel: "Content Type",
    aspectRatioLabel: "Aspect Ratio",
    ratio916: "Vertical Shorts (9:16)",
    ratio169: "Horizontal Video (16:9)",
    styleLabel: "Visual Style",
    storyStyleLabel: "Pacing & Tone",
    aiModelLabel: "AI Model",
    generateScriptButton: "Generate Script",
    generatingScriptButton: "Writing Script...",
    generateStoryboardButton: "Generate Storyboard",
    generatingStoryboardButton: "Visualizing...",
    continueGenerateStoryboardButton: "Continue Storyboard",
    includeDialogueLabel: "Include Voiceover/TTS",
    dialogueLanguageLabel: "Voiceover Language",
    generatePromptListButton: "Generate Prompt List",
    charCountLabel: "Chars",
    propCountLabel: "Props",
    typeLabel: "Type",
    typeCharacter: "Character",
    typeProp: "Prop/Object",

    // SceneTimeline.tsx
    timelineTitle: "Visual Timeline",
    downloadButton: "Download Prompts",
    primaryReferenceLabel: "Primary Reference for Style",
    selectPrimaryReferencePrompt: "Select a style/character reference",
    generateAllImagesButton: "Batch Render Images",
    generatingAllImagesButton: "Rendering...",
    downloadAllImagesButton: "Download Images (.zip)",
    emptyTimelineTitle: "Canvas Empty",
    emptyTimelineDescription: "Enter a story and generate to see your scenes here.",

    // SceneCard.tsx
    sceneLabel: "Scene",
    timeLabel: "Time",
    promptLabel: "Image Prompt (JSON)",
    promptHelperTooltip: "Prompt Magic Tools",
    invalidJsonError: "Invalid JSON.",
    sceneImageLabel: "Preview",
    selectReferenceImageLabel: "Style Ref",
    noImageGenerated: "No image yet.",
    generateImageButton: "Render Image",
    generatingImageButton: "Rendering...",
    noReferenceImagesAvailable: "No ref images",
    dialogueLabel: "Voiceover / Dialogue",

    // Tooltips
    tooltips: {
        characterName: "Enter a unique name for this character or prop.",
        deleteCharacter: "Remove this asset from your project.",
        uploadImage: "Upload a reference image.",
        generatePromptFromImage: "AI analyzes the uploaded image.",
        suggestPrompt: "AI creates a visual description.",
        generateCharacterImage: "Generate an image reference.",
        characterPrompt: "Detailed text description.",
        addCharacter: "Add a new slot.",
        autoGenerateRoster: "Automatically create a set of characters and props based on the topic.",
        storyIdea: "Describe the main concept.",
        storyStyle: "Sets tone and pacing.",
        suggestStory: "Brainstorm topic.",
        suggestFromAssets: "Generate script using these assets.",
        refineIdea: "Optimize the concept.",
        duration: "Video length.",
        format: "Content structure.",
        style: "Visual style.",
        model: "AI Model.",
        apiKeySettings: "API Key Settings",
        includeDialogue: "Voiceover toggle.",
        dialogueLanguage: "Language.",
        mainAction: "Generate Veo 3 prompts.",
        downloadPrompts: "Save prompts.",
        primaryReference: "Style anchor.",
        generateAllImages: "Batch render.",
        downloadAllImages: "Download zip.",
    },

    // Loader.tsx
    generationComplete: "All Done!",
    generatingScene: (current: number, total: number) => `Visualizing Scene ${current} / ${total}`,
    loaderText: "Processing...",

    // ConfirmationModal.tsx & App.tsx
    newProjectConfirmationTitle: "Start New Project?",
    newProjectConfirmationMessage: "This will wipe your current project. Ready to start fresh?",
    confirmButton: "Yes, New Project",
    cancelButton: "Cancel",
    resumeGenerationTitle: "Paused",
    resumeButton: "Resume",
    finishForNowButton: "Stop",

    // GuideModal.tsx
    guideModalTitle: "How to Make Viral Videos",
    guideSteps: [
        { title: "1. Define Assets", description: "Add your 'stars'. Distinguish between 'Characters' (Actors) and 'Props' (Items)." },
        { title: "2. The Hook", description: "Enter your topic. Be catchy! e.g., '3 things you didn't know about dreams'." },
        { title: "3. Style It", description: "Choose a 'Visual Style' and 'Aspect Ratio'." },
        { title: "4. Scripting", description: "Click 'Generate Script'. The AI will write a script utilizing your assets." },
        { title: "5. Storyboarding", description: "The AI breaks the script into scenes (8s blocks)." },
        { title: "6. Render", description: "Use the timeline to generate images." },
    ],
    guideProTipsTitle: "Viral Tips",
    guideProTips: [
        { title: "Asset Types", description: "Define props correctly so the AI knows they are objects to be held or placed, not actors." },
        { title: "Pacing", description: "Each scene corresponds to roughly 8 seconds of narration/video time." },
        { title: "Visual Consistency", description: "Use one 'Style Reference' image for the whole batch to make it look like a cohesive video." },
    ],
    
    // ApiKeyModal.tsx
    apiKeyModalTitle: "API Key Management",
    apiKeysLabel: "Google GenAI API Keys",
    apiKeysPlaceholder: "Paste one API key per line.\nThe app will automatically rotate to the next key if a quota limit is reached.",
    saveKeysButton: "Save Keys",

    // PromptHelper.tsx
    promptHelperTitle: "Quick Styles & Shots",
    promptHelperTags: {
        camera_shots: {
            group: "Framing",
            tags: [
                { tag: "vertical 9:16 composition", desc: "Optimized for phone screens." },
                { tag: "cinematic 16:9 wide", desc: "Standard landscape video." },
                { tag: "split screen", desc: "Two actions happening at once." },
                { tag: "extreme close-up", desc: "High detail." },
                { tag: "POV shot", desc: "First-person view." },
            ],
        },
        styles: {
            group: "Trending Aesthetics",
            tags: [
                { tag: "hyper-realistic", desc: "Looks like 4K footage." },
                { tag: "pixar style 3d render", desc: "Cute 3D animation style." },
                { tag: "studio ghibli style", desc: "Hand-drawn anime style." },
                { tag: "neon noir", desc: "Dark with bright neon lights." },
                { tag: "watercolor texture", desc: "Artistic ink and water." },
                { tag: "claymation stop motion", desc: "Clay texture like Aardman." },
                { tag: "retro vhs", desc: "90s tape glitch effect." },
                { tag: "minimalist flat 2d", desc: "Clean corporate art style." },
            ],
        },
        lighting: {
            group: "Lighting",
            tags: [
                { tag: "ring light studio", desc: "Even, bright influencer lighting." },
                { tag: "moody shadows", desc: "High contrast, dramatic." },
                { tag: "cinematic teal and orange", desc: "Movie-like color grading." },
            ],
        },
    },

    // StorySuggestionModal.tsx
    storySuggestionModalTitle: "Topic Ideas",
    useThisIdeaButton: "Use This Topic",
    regenerateIdeaButton: "New Idea",
    closeButton: "Close",
    suggestionLoadingText: "Analyzing trends...",
    storySuggestionEditHint: "Tweak the hook to make it your own.",

    // ContinueGenerationModal.tsx
    continueGenerationTitle: "Batch Complete",
    continueGenerationMessage: (generated: number, total: number) => `Generated ${generated}/${total} scenes. Ready for the next batch?`,
    continueGenerationButton: "Continue",

    // CharacterSuggestionModal.tsx
    characterSuggestionModalTitle: "Visual Style Suggestions",
    characterSuggestionLoadingText: "Dreaming up visuals...",
    useThisVariationButton: "Use This Style",

    // Gemini Service System Instructions
    systemInstruction_generateCharacterPrompt: `You are an expert visual director.
Your task is to analyze an image and generate a text prompt for **ONLY THE MAIN SUBJECT** (Character or Object).
Structure:
- **Subject:** (e.g., "A cute robot with blue eyes").
- **Appearance:** Specific details.
- **Background:** "Isolated on white background".`,

    systemInstruction_generateCharacterVariations: (characterName: string, animationStyle: string, storyStyle: string) => `You are a creative director for video content.
Generate 3 distinct visual interpretations for a subject/character based on the project style.
**Subject:** ${characterName}
**Style:** ${animationStyle}
**Vibe:** ${storyStyle}

Output a JSON object with a "variations" array. Each variation needs a \`title\` and a \`description\` (English).`,

    systemInstruction_generateCharacterRoster: (style: string, topic: string, charCount: number, propCount: number) => `You are a Creative Visual Director.
Generate a set of assets for a video based on the Topic: "${topic}".

**CRITICAL DEFINITIONS:**
- **CHARACTER (Nhân vật):** Alive entities (Humans, Animals, Creatures, Robots) that perform actions, have emotions, and drive the story.
- **PROP/ASSET (Đạo cụ/Tài nguyên):** Inanimate objects (Weapons, Vehicles, Items), Backgrounds, or Visual Elements that are USED by characters or set the scene. They do NOT act on their own.

**Task:**
1. Generate **${charCount} Characters**.
2. Generate **${propCount} Props/Assets**.

**Context:**
- **Visual Style:** ${style}

**Instructions:**
- **Short ID:** Generate a very short, unique, single-word ID (e.g., 'hero', 'knife', 'cat').
- **Type:** Must be strictly 'character' or 'prop'.
- **Descriptions:** Write a detailed visual description (Prompt) for each.
- **Output:** JSON object with a "characters" array. Each item has "name", "short_id", "type", and "description".`,

    systemInstruction_generateStoryIdea: (animationStyle: string, storyStyle: string, characterDescriptions: string) => `You are a viral content strategist. Generate a high-retention video topic/hook.
**Style:** ${animationStyle}
**Tone:** ${storyStyle}
**Available Assets:** ${characterDescriptions}

Structure:
1. **The Hook:** A clickbaity but true opening line.
2. **The Value:** What the viewer learns or sees.
3. **The Twist/Ending:** A satisfying conclusion.
Keep it under 50 words. Output plain text only.`,

    systemInstruction_refineStoryIdea: (animationStyle: string, storyStyle: string, languageName: string) => `You are a script editor.
Refine the user's idea into a viral format.
**Style:** ${animationStyle}
**Tone:** ${storyStyle}
**Language:** ${languageName}
**Format:** Hook, Content, Twist. Max 60 words.`,

    systemInstruction_generateStoryFromCharacters: (availableCharacters: string, totalScenes: number, duration: number, topic: string, style: string) => `You are a **Professional Screenwriter** (Nhà biên kịch).
Your goal is to write a **COMPLETE, COHESIVE, and LOGICAL SCREENPLAY**.

**CONTEXT:**
- **Topic:** "${topic}"
- **Target Duration:** ${duration}s.
- **Genre/Style:** ${style}.

**CLASSIC NARRATIVE STRUCTURE (MANDATORY):**
You MUST structure the story following this 5-act logical flow:
1.  **Opening (Mở đầu):** Introduce the characters, the setting, and the initial situation.
2.  **Conflict (Xung đột):** Introduce a problem, a challenge, or an inciting incident that disrupts the status quo.
3.  **Turning Point (Chuyển biến):** The characters react to the conflict, make decisions, and the story changes direction. This is the rising action.
4.  **Climax (Cao trào):** The peak of the conflict. The most intense moment where the main confrontation happens.
5.  **Resolution (Kết):** The outcome of the climax. Loose ends are tied up, and a new status quo is established.

**NARRATIVE LOGIC ENGINE (CRITICAL):**
1. **Action-Reaction:** Every scene must be a direct logical consequence of the previous scene.
2. **State Persistence:** Characters and objects must maintain their state (location, condition, items held) unless an action explicitly changes it. No teleporting or vanishing items.
3. **Role Enforcement:** Characters (Type: character) are the active agents. Props (Type: prop) are passive and are used by characters.

**INSTRUCTIONS:**
1. **Follow the 5-Act Structure:** Weave the narrative through the Opening, Conflict, Turning Point, Climax, and Resolution.
2. **Use Assets:** Naturally integrate the character/prop IDs using \`(short_id)\` syntax within the narrative.
3. **Focus on Story:** Do NOT write camera directions or technical details. Only write the story events, actions, and dialogue.
4. **Dialogue:** If dialogue is enabled, write it in the requested language.

**Available Assets:**
${availableCharacters}

**Output:**
A full text story/script in a clear narrative format.`,

    systemInstruction_enrichVeoPrompts: (style: string, aspectRatio: string, totalScenes: number, availableCharacters: string, startScene: number, endScene: number, languageName: string) => `You are a **Visionary Director & Veo 3 Prompt Engineer**.
Your task is to visualize a script into cinematic scenes. You will work in batches.

**CONTEXT:**
- **Full Story Length:** ${totalScenes} scenes.
- **Current Batch:** You are ONLY generating scenes **${startScene} to ${endScene}**.
- **Style:** ${style}
- **Format:** ${aspectRatio}
- **Available Assets (IDs):** ${availableCharacters}

**CRITICAL DIALOGUE RULE:**
The screenplay provided contains dialogue written in **${languageName}**. You MUST extract this dialogue **VERBATIM** into the \`dialogue\` field for each scene. DO NOT translate, change, or invent dialogue. If a scene has no dialogue in the script, the \`dialogue\` field MUST be an empty string "".

**CONTINUITY & FLOW PROTOCOL (ABSOLUTE REQUIREMENT):**
The final video must feel like a seamless, continuous experience.
1.  **STATE TRACKING:** The state of characters (clothing, injuries, items held) and the environment (weather, time of day, damage) MUST persist from one scene to the next unless explicitly changed by an action.
2.  **SEAMLESS TRANSITIONS / "ONE-SHOT" RULE:** The visual at the **END (6-8s)** of Scene N must perfectly match the visual at the **START (0-2s)** of Scene N+1. This creates a single, unbroken "one-shot" feel. Use camera moves (e.g., "camera pans right to reveal...", "camera follows character through a door...") to link scenes.
3.  **LOGICAL FLOW:** The action in one scene must be the direct cause or logical follow-up to the previous one.

**STRICT OUTPUT FORMULA (Single continuous paragraph per prompt):**
"(id1,id2...) [CONCEPT], captured with [CAM], showing [TIMELINE: 0-2s: (Connects from prev scene) -> 2-6s: (Main Event) -> 6-8s: (Leads to next scene)], featuring [CHAR DNA], set in [SET], mood [MOOD], with [FX], color graded in [CLR], edited as [EDIT], rendered in [RNDR + ${style}], duration 8 seconds, focus on [FOCAL]."

**Legend:**
- [TIMELINE]: Detailed breakdown. 0-2s MUST link to previous scene. 6-8s MUST set up next scene.
- [CHAR DNA]: Visual traits from Asset List.
- (id1,id2): Active IDs.

**Output:**
JSON Array of **exactly ${endScene - startScene + 1}** scene objects.`,

    systemInstruction_generateScript: (config: VideoConfig, characterDescriptions: string) => {
        const totalScenes = Math.ceil(config.duration / 8); 
        return `You are a master scriptwriter.
**Project Configuration:**
- Duration: ${config.duration}s.
- Scenes: ~${totalScenes}.
- Style: ${config.style}

**Characters & Props:**
${characterDescriptions}

Output ONLY the script, formatted as a list of numbered scenes (1 to ${totalScenes}).`;
    },

    systemInstruction_generateScenes: (config: VideoConfig, characterDescriptions: string, startSceneId: number, endSceneId: number) => {
        return `You are a **Veo 3 Prompt Engineer**.
Task: Generate exactly ${endSceneId - startSceneId + 1} scene objects.

**CRITICAL RULES:**
1. **MOTION:** Describe movement for video.
2. **CONTINUITY:** Logical flow.
3. **MANDATORY KEYWORDS:** Camera, Motion, Tech.

**Characters/Props:**
${characterDescriptions}

**JSON Structure:**
- \`scene_id\`: Int
- \`time\`: String
- \`prompt\`: Object (scene_description, etc)`;
    },
};

const vi: TranslationKeys = {
    // ... (previous translations)
    // App.tsx
    untitledProject: "Dự án Video Mới",
    generationStatusPreparing: "Đạo diễn đang phân cảnh & Tạo góc máy...",
    generationStatusRequesting: (batch: number) => `Đang xử lý lô #${batch}...`,
    generationIncompleteError: (current: number, total: number) => `Chưa hoàn tất. Mới tạo được ${current}/${total} cảnh.`,
    errorGeneratingImage: "Lỗi khi tạo ảnh.",
    errorQuotaExceeded: "Hết lượt API. Vui lòng đợi chút rồi thử lại.",
    errorInvalidApiKey: (context: string) => `API Key lỗi. Kiểm tra cài đặt. (Context: ${context})`,
    errorNoApiKey: "Chưa có API Key. Vui lòng thêm key trong Cài đặt.",
    errorServerOverloaded: (context: string) => `Server đang bận. Thử lại sau. (Context: ${context})`,
    errorGeneric: (context: string, message: string) => `Lỗi tại ${context}: ${message}`,
    errorUnknown: (context: string) => `Lỗi không xác định tại ${context}.`,
    generationFailedCanResume: (errorMsg: string) => `Tạo thất bại: ${errorMsg}. Bạn có thể thử tiếp tục.`,
    errorGeneratingPrompt: "Lỗi khi phân tích ảnh.",
    newCharacterName: "Tài nguyên mới",
    errorNetworkOrProxy: "Lỗi mạng. Vui lòng kiểm tra kết nối.",

    // Header.tsx
    appTitle: "AI Video Studio",
    appDescription: "Tạo video Shorts & Long-form",
    newProjectButton: "Dự án Mới",
    guideButtonTooltip: "Hướng dẫn",
    languageLabel: "Ngôn ngữ",

    // InputPanel.tsx
    characterRosterLabel: "Nhân vật / Đạo cụ / Tài nguyên",
    characterRosterHint: "LƯU Ý QUAN TRỌNG: 'Nhân vật' là người/vật sống có hành động. 'Đạo cụ' là đồ vật/bối cảnh tĩnh hoặc được cầm nắm.",
    addCharacterButton: "Thêm Tài nguyên",
    autoGenerateRosterButton: "Tạo dàn nhân vật",
    characterNamePlaceholder: "VD: Người dẫn chuyện, Con ma, Chiếc cúp...",
    characterImageLabel: "Ảnh mẫu",
    uploadImagePrompt: "Tải ảnh",
    generatePromptFromImageButton: "Từ ảnh này",
    generatingPromptButton: "Đang xem...",
    suggestPromptButton: "Gợi ý Visual",
    suggestingPromptButton: "Đang nghĩ...",
    generateCharacterImageButton: "Tạo Visual",
    characterPromptLabel: "Mô tả hình ảnh (Prompt)",
    characterPromptPlaceholder: "Mô tả chi tiết để AI vẽ nhất quán (VD: 'Một hacker phong cách cyberpunk đeo kính neon').",
    storyIdeaLabel: "Cốt truyện / Kịch bản (Tự do)",
    suggestIdeaButton: "Gợi ý Chủ đề Hot",
    suggestFromAssetsButton: "Gợi ý Kịch bản từ Nhân vật",
    refineIdeaButton: "Phân tích & Tối ưu",
    refiningIdeaButton: "Đang gọt giũa...",
    onCooldownButton: "Chờ...",
    suggestingIdeaButton: "Đang tìm...",
    storyIdeaPlaceholder: "Nhập toàn bộ câu chuyện hoặc kịch bản của bạn tại đây (văn xuôi).\nAI sẽ tự động phân tích, chia thành các cảnh 8 giây và tạo prompt cho Veo 3.",
    generatedScriptLabel: "Kịch bản đã tạo",
    videoSettingsLabel: "Cấu hình Video",
    durationLabel: "Thời lượng (giây)",
    durationPlaceholder: "VD: 45",
    durationFeedback: (scenes: number, totalSeconds: number) => `~${scenes} cảnh (Tổng: ${totalSeconds} giây).`,
    videoFormatLabel: "Loại nội dung",
    aspectRatioLabel: "Tỉ lệ khung hình",
    ratio916: "Dọc (9:16) - Shorts/TikTok",
    ratio169: "Ngang (16:9) - YouTube",
    styleLabel: "Phong cách Art",
    storyStyleLabel: "Nhịp điệu & Tông",
    aiModelLabel: "Model AI",
    generateScriptButton: "Tạo Kịch bản",
    generatingScriptButton: "Đang viết kịch bản...",
    generateStoryboardButton: "Lên Storyboard",
    generatingStoryboardButton: "Đang chia cảnh...",
    continueGenerateStoryboardButton: "Tiếp tục tạo cảnh",
    includeDialogueLabel: "Có lời bình (Voiceover)",
    dialogueLanguageLabel: "Ngôn ngữ lời bình",
    generatePromptListButton: "Tạo Danh sách Prompt",
    charCountLabel: "Số NV",
    propCountLabel: "Số Đạo cụ",
    typeLabel: "Loại",
    typeCharacter: "Nhân vật",
    typeProp: "Đạo cụ",

    // SceneTimeline.tsx
    timelineTitle: "Timeline Hình ảnh",
    downloadButton: "Tải Prompt",
    primaryReferenceLabel: "Ảnh tham chiếu phong cách chủ đạo",
    selectPrimaryReferencePrompt: "Chọn ảnh mẫu để đồng bộ style",
    generateAllImagesButton: "Vẽ hàng loạt (Batch Render)",
    generatingAllImagesButton: "Đang vẽ...",
    downloadAllImagesButton: "Tải ảnh (.zip)",
    emptyTimelineTitle: "Chưa có nội dung",
    emptyTimelineDescription: "Nhập truyện và tạo prompt để bắt đầu.",

    // SceneCard.tsx
    sceneLabel: "Cảnh",
    timeLabel: "Thời gian",
    promptLabel: "Prompt (JSON)",
    promptHelperTooltip: "Công cụ Prompt",
    invalidJsonError: "Lỗi JSON.",
    sceneImageLabel: "Xem trước",
    selectReferenceImageLabel: "Style Ref",
    noImageGenerated: "Chưa có ảnh (Vẽ thủ công)",
    generateImageButton: "Vẽ ảnh",
    generatingImageButton: "Đang vẽ...",
    noReferenceImagesAvailable: "Không có ảnh mẫu",
    dialogueLabel: "Lời bình / Hội thoại",
    
    // Tooltips (VI)
    tooltips: {
        characterName: "Nhập tên riêng cho nhân vật hoặc đạo cụ này.",
        deleteCharacter: "Xóa tài nguyên này khỏi dự án.",
        uploadImage: "Tải ảnh mẫu để AI tham khảo hình dáng.",
        generatePromptFromImage: "AI tự động phân tích ảnh để tạo mô tả văn bản.",
        suggestPrompt: "AI tự gợi ý mô tả hình ảnh dựa trên tên và phong cách video.",
        generateCharacterImage: "AI sẽ vẽ hình nhân vật này dựa trên mô tả để làm mẫu tham chiếu.",
        characterPrompt: "Đoạn văn tả chi tiết ngoại hình để AI vẽ nhân vật.",
        addCharacter: "Thêm một slot tài nguyên mới.",
        autoGenerateRoster: "Tự động tạo danh sách Nhân vật và Đạo cụ phù hợp với Chủ đề.",
        storyIdea: "Mô tả ý tưởng chính, câu hook hoặc nội dung video.",
        storyStyle: "Chọn nhịp điệu và tông giọng kể chuyện.",
        suggestStory: "Để AI tự nghĩ ra một chủ đề đang hot.",
        suggestFromAssets: "AI sẽ đóng vai Nhà Biên Kịch để viết một câu chuyện hoàn chỉnh, logic dựa trên các nhân vật.",
        refineIdea: "AI phân tích ý tưởng thô của bạn và viết lại thành cấu trúc viral (Hook - Nội dung - Kết).",
        duration: "Tổng thời lượng video tính bằng giây (nên từ 15-60s).",
        format: "Cấu trúc nội dung (VD: Sự thật, Chuyện ma, Đố vui).",
        style: "Phong cách đồ họa cho hình ảnh.",
        model: "Chọn phiên bản mô hình AI.",
        apiKeySettings: "Cài đặt API Key",
        includeDialogue: "Bật tùy chọn này để tạo kịch bản lời bình (Voiceover).",
        dialogueLanguage: "Chọn ngôn ngữ cho lời bình.",
        mainAction: "AI đóng vai Đạo diễn, phân tích kịch bản và chia thành các cảnh quay (Prompt) chi tiết cho Veo 3.",
        downloadPrompts: "Lưu tất cả prompt hình ảnh ra file text.",
        primaryReference: "Chọn nhân vật chính để làm chuẩn style cho cả loạt ảnh.",
        generateAllImages: "Tự động vẽ hình cho tất cả các cảnh lần lượt.",
        downloadAllImages: "Tải tất cả ảnh đã vẽ về máy (file ZIP).",
    },

    // Loader.tsx
    generationComplete: "Xong!",
    generatingScene: (current: number, total: number) => `Đang xử lý Cảnh ${current} / ${total}`,
    loaderText: "Đang xử lý...",

    // ConfirmationModal.tsx & App.tsx
    newProjectConfirmationTitle: "Tạo Dự án mới?",
    newProjectConfirmationMessage: "Dự án hiện tại sẽ bị xóa. Bạn chắc chứ?",
    confirmButton: "OK, Làm mới",
    cancelButton: "Hủy",
    resumeGenerationTitle: "Tạm dừng",
    resumeButton: "Tiếp tục",
    finishForNowButton: "Dừng",

    // GuideModal.tsx
    guideModalTitle: "Cách tạo Video Triệu View",
    guideSteps: [
        { title: "1. Định nghĩa Tài nguyên", description: "Thêm các 'diễn viên' và 'đạo cụ'. Phân loại rõ ràng để AI hiểu cái nào diễn, cái nào dùng." },
        { title: "2. Câu dẫn (Hook)", description: "Nhập chủ đề. Phải hấp dẫn ngay lập tức!" },
        { title: "3. Chọn Style", description: "Chọn 'Phong cách Art' và 'Tỉ lệ khung hình' (Dọc cho Shorts, Ngang cho Youtube)." },
        { title: "4. Kịch bản", description: "Bấm 'Tạo Danh sách Prompt'. Hệ thống sẽ tạo các thẻ scene chứa nội dung." },
        { title: "5. Vẽ Ảnh", description: "Trên mỗi thẻ scene, bấm 'Vẽ ảnh' để tạo hình. Dùng ảnh tham chiếu để style đồng nhất." },
        { title: "6. Xuất", description: "Tải ảnh về và dựng video." },
    ],
    guideProTipsTitle: "Mẹo Viral",
    guideProTips: [
        { title: "Nhân vật vs Đạo cụ", description: "AI sẽ cho nhân vật chuyển động nhiều hơn, còn đạo cụ thường đi kèm nhân vật." },
        { title: "Nhịp độ", description: "Mỗi cảnh tương ứng với 8 giây để bạn có đủ thời gian kể chuyện/thoại." },
        { title: "Đồng bộ Visual", description: "Sử dụng một ảnh tham chiếu chung cho cả bộ để video trông chuyên nghiệp như một bộ phim." },
    ],
    
    // ApiKeyModal.tsx (VI)
    apiKeyModalTitle: "Quản lý API Key",
    apiKeysLabel: "Danh sách Google GenAI API Keys",
    apiKeysPlaceholder: "Dán mỗi API key trên một dòng.\nỨng dụng sẽ tự động chuyển sang key tiếp theo nếu key hiện tại hết lượt (quota).",
    saveKeysButton: "Lưu Keys",

    promptHelperTitle: "Góc quay & Style Nhanh",
    promptHelperTags: {
        // ... (same as previous)
        camera_shots: en.promptHelperTags.camera_shots,
        styles: en.promptHelperTags.styles,
        lighting: en.promptHelperTags.lighting,
    },

    // StorySuggestionModal.tsx
    storySuggestionModalTitle: "Ý tưởng Viral",
    useThisIdeaButton: "Dùng cái này",
    regenerateIdeaButton: "Ý tưởng khác",
    closeButton: "Đóng",
    suggestionLoadingText: "Đang phân tích xu hướng...",
    storySuggestionEditHint: "Bạn có thể sửa lại câu hook cho hay hơn.",

    // ContinueGenerationModal.tsx
    continueGenerationTitle: "Xong lô hiện tại",
    continueGenerationMessage: (generated: number, total: number) => `Đã xong ${generated}/${total} cảnh. Làm tiếp lô sau nhé?`,
    continueGenerationButton: "Tiếp tục",
    
    // CharacterSuggestionModal.tsx
    characterSuggestionModalTitle: "Gợi ý Style Visual",
    characterSuggestionLoadingText: "AI đang tưởng tượng...",
    useThisVariationButton: "Dùng Style này",

    // Gemini Service System Instructions (VI - points to EN version)
    systemInstruction_generateCharacterPrompt: en.systemInstruction_generateCharacterPrompt,
    systemInstruction_generateCharacterVariations: en.systemInstruction_generateCharacterVariations,
    systemInstruction_generateCharacterRoster: en.systemInstruction_generateCharacterRoster,
    systemInstruction_generateStoryIdea: en.systemInstruction_generateStoryIdea,
    systemInstruction_refineStoryIdea: en.systemInstruction_refineStoryIdea,
    systemInstruction_generateStoryFromCharacters: en.systemInstruction_generateStoryFromCharacters,
    systemInstruction_generateScript: en.systemInstruction_generateScript,
    systemInstruction_generateScenes: en.systemInstruction_generateScenes,
    systemInstruction_enrichVeoPrompts: en.systemInstruction_enrichVeoPrompts,
};

export const translations = {
  en,
  vi,
};

export type TranslationKeys = typeof en;
