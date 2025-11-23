

export const VIDEO_STYLES = [
  { key: 'veo_cinematic', en: 'Veo 3 Cinematic (Video Native)', vi: 'Veo 3 Điện ảnh (Video Native)' },
  { key: 'cinematic_realistic', en: 'Cinematic Realistic', vi: 'Điện ảnh Thực tế' },
  { key: '3d_pixar', en: '3D Animation (Pixar/Disney)', vi: 'Hoạt hình 3D (Pixar/Disney)' },
  { key: 'anime_style', en: 'Modern Anime', vi: 'Anime Hiện đại' },
  { key: 'neon_cyberpunk', en: 'Neon Cyberpunk', vi: 'Neon Cyberpunk' },
  { key: 'dark_horror', en: 'Dark Horror/Thriller', vi: 'Kinh dị/U tối' },
  { key: 'bright_pop_art', en: 'Bright Pop Art', vi: 'Pop Art Rực rỡ' },
  { key: 'comic_book', en: 'Comic Book/Graphic Novel', vi: 'Truyện tranh Mỹ' },
  { key: 'watercolor', en: 'Watercolor & Ink', vi: 'Màu nước & Mực' },
  { key: 'oil_painting', en: 'Impressionist Oil Painting', vi: 'Sơn dầu Ấn tượng' },
  { key: 'claymation', en: 'Claymation/Stop Motion', vi: 'Đất sét Stop-motion' },
  { key: 'pixel_art', en: 'Pixel Art 8-bit', vi: 'Pixel Art 8-bit' },
  { key: 'paper_cutout', en: 'Paper Cutout/Collage', vi: 'Cắt giấy Layer' },
  { key: 'low_poly', en: 'Low Poly 3D', vi: '3D Low Poly' },
  { key: 'pencil_sketch', en: 'Pencil Sketch', vi: 'Phác thảo chì' },
  { key: 'gothic_fantasy', en: 'Gothic Fantasy', vi: 'Gothic Huyền bí' },
  { key: 'minimalist_motion', en: 'Minimalist Motion', vi: 'Chuyển động Tối giản' },
  { key: 'vintage_film', en: 'Vintage Film/Retro', vi: 'Phim Cổ điển/Retro' },
  { key: 'ukiyo_e', en: 'Ukiyo-e (Japanese Woodblock)', vi: 'Tranh khắc gỗ Nhật' },
  { key: 'synthwave', en: 'Synthwave/Retrowave', vi: 'Synthwave thập niên 80' },
];

export const VIDEO_FORMATS = [
  { key: 'viral_facts', en: 'Viral Facts/Curiosities', vi: 'Sự thật Thú vị/Viral' },
  { key: 'scary_story', en: 'Scary/Creepypasta Story', vi: 'Chuyện Ma/Kinh dị' },
  { key: 'motivational', en: 'Motivational/Stoic', vi: 'Động lực/Triết lý' },
  { key: 'life_hacks', en: 'Life Hacks/Tips', vi: 'Mẹo vặt cuộc sống' },
  { key: 'history_mystery', en: 'History & Mysteries', vi: 'Lịch sử & Bí ẩn' },
  { key: 'quiz_trivia', en: 'Quiz/Trivia Challenge', vi: 'Đố vui/Thử thách' },
  { key: 'silent_visual', en: 'Silent Visual/Mime', vi: 'Kịch câm / Hình ảnh kể chuyện' },
];

export const STORY_STYLES = [
  { key: 'fast_engaging', en: 'Fast & Engaging', vi: 'Nhanh & Lôi cuốn' },
  { key: 'dramatic_intense', en: 'Dramatic & Intense', vi: 'Kịch tính & Căng thẳng' },
  { key: 'funny_witty', en: 'Funny & Witty', vi: 'Hài hước & Dí dỏm' },
  { key: 'mysterious', en: 'Mysterious & Spooky', vi: 'Huyền bí & Rùng rợn' },
  { key: 'emotional', en: 'Emotional & Touching', vi: 'Cảm động & Sâu sắc' },
  { key: 'sarcastic', en: 'Sarcastic & Ironic', vi: 'Châm biếm & Mỉa mai' },
  { key: 'enthusiastic', en: 'Enthusiastic & High Energy', vi: 'Nhiệt huyết & Năng lượng cao' },
  { key: 'calm', en: 'Calm & Soothing', vi: 'Nhẹ nhàng & Thư giãn' },
  { key: 'authoritative', en: 'Authoritative & News', vi: 'Đanh thép & Tin tức' },
  { key: 'whispering', en: 'Whispering/ASMR', vi: 'Thì thầm/ASMR' },
];

export const DIALOGUE_LANGUAGES = [
  { key: 'vi', en: 'Vietnamese', vi: 'Tiếng Việt' },
  { key: "en", en: "English", vi: "Tiếng Anh" },
  { key: "ja", en: "Japanese", vi: "Tiếng Nhật" },
  { key: "ko", en: "Korean", vi: "Tiếng Hàn" },
  { key: "fr", en: "French", vi: "Tiếng Pháp" },
  { key: "es", en: "Spanish", vi: "Tiếng Tây Ban Nha" },
  { key: "de", en: "German", vi: "Tiếng Đức" },
  { key: "zh", en: "Chinese", vi: "Tiếng Trung" },
];

export const normalizeString = (str: string): string => {
  const clean = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9\s]/g, "") // Allow spaces for split
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  // Strategy: Take the LAST word to keep it short (often the Name in Vietnamese)
  const words = clean.split(" ");
  if (words.length > 0) {
      return words[words.length - 1];
  }
  return "id";
};