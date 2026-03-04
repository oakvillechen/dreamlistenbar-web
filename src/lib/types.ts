export interface Book {
  title: string;
  bookId: string;
  href: string;
  cover: string;
  author: string;
  speaker: string;
  summary: string;
}

export interface Chapter {
  tingId: string;
  title: string;
  url: string;
}

export interface BookDetail {
  success: boolean;
  book: {
    title: string;
    cover: string;
  };
  chapters: Chapter[];
  tabs: { offset: string; text: string }[];
}

export interface SearchResult {
  success: boolean;
  list: Book[];
}

export interface CategoryResult {
  success: boolean;
  list: Book[];
}

export interface AudioResult {
  success: boolean;
  audio_url?: string;
  error?: string;
}

export interface Category {
  id: string;
  name: string;
}

export const CATEGORIES: Category[] = [
  { id: "latest", name: "最新更新" },
  { id: "1", name: "玄幻奇幻" },
  { id: "2", name: "武侠修真" },
  { id: "3", name: "都市言情" },
  { id: "4", name: "历史军事" },
  { id: "5", name: "恐怖悬疑" },
  { id: "6", name: "科幻网游" },
  { id: "7", name: "女生言情" },
  { id: "8", name: "儿童故事" },
  { id: "9", name: "相声评书" },
  { id: "10", name: "其他" },
];
