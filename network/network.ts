import {YOUTUBE_API_KEY} from '@env';
import {SearchResponse} from '../model/model';

const YOUTUBE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * YouTube 동영상 음악을 검색하는 함수
 * @param searchText 검색어
 * @param maxResults 결과 최대 개수 (기본값 10)
 * @returns
 */
export const searchVideos = async (
  searchText: string,
  maxResults: number = 10,
): Promise<SearchResponse> => {
  const url = `${YOUTUBE_URL}/search?key=${YOUTUBE_API_KEY}&part=snippet&q=${encodeURIComponent(
    searchText,
  )}&maxResults=${maxResults}&type=video&topicId=/m/04rlf`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`HTTP error! status: ${response.status}`, errorBody);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching YouTube search results:', error);
    throw error;
  }
};
