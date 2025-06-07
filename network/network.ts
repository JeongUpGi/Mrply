import {YOUTUBE_API_KEY} from '@env';
import {
  SearchResponse,
  SearchResultMusicItem,
  AudioPlaybackData,
  AudioServiceResponseData,
} from '../model/model';

const YOUTUBE_URL = 'https://www.googleapis.com/youtube/v3';
const BASE_URL = 'http://172.30.1.93'; //url 추후 수정

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

export const getAudioUrlAndData = async (
  searchResultMusicItem: SearchResultMusicItem,
): Promise<AudioServiceResponseData> => {
  try {
    const url =
      `${BASE_URL}:3000/api/get-youtube-audio?videoId=` +
      searchResultMusicItem.id.videoId;
    const response = await fetch(url);
    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Backend responded with status ${response.status}: ${errorBody}`,
      );
    }

    const audioData = await response.json();
    console.log('Received audio data from backend:', audioData);

    if (!audioData.audioUrl) {
      throw new Error('Backend response missing audioUrl.');
    }

    const audioPlaybackData: AudioPlaybackData = {
      url: audioData.audioUrl,
      title:
        audioData.title ||
        searchResultMusicItem.snippet.title ||
        'Unknown Title',
      artist:
        audioData.author ||
        searchResultMusicItem.snippet.channelTitle ||
        'Unknown Artist',
      artwork:
        audioData.thumbnailUrl ||
        searchResultMusicItem.snippet.thumbnails.medium.url ||
        'fallback_image_url',
      id: searchResultMusicItem.id.videoId!,
    };

    return {
      audioPlaybackData: audioPlaybackData,
    };
  } catch (err: unknown) {
    console.error('Error in audioService:', err);
    if (err instanceof Error) {
      throw new Error('Failed to get audio URL: ' + err.message);
    } else {
      throw new Error('Unknown error occurred in audioService.');
    }
  }
};
