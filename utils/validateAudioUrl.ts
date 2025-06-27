import {getAudioUrlAndData} from '../network/network';
import {Track} from 'react-native-track-player';

// 오디오URL 캐싱 함수
class AudioUrlCache {
  private cache = new Map<string, {url: string; timestamp: number}>();
  private readonly CACHE_DURATION = 3 * 60 * 60 * 1000; // 3시간

  set(videoId: string, url: string) {
    this.cache.set(videoId, {
      url,
      timestamp: Date.now(),
    });
  }

  get(videoId: string): string | null {
    const cached = this.cache.get(videoId);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(videoId);
      return null;
    }
    return cached.url;
  }

  async isValidUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {method: 'HEAD'});
      return response.ok;
    } catch {
      return false;
    }
  }

  clear() {
    this.cache.clear();
  }
}

export const audioUrlCache = new AudioUrlCache();

// 오디오 URL 갱신 함수
export const getValidAudioUrl = async (track: Track): Promise<string> => {
  const videoId = track.id;
  if (!videoId) throw new Error('No videoId found for this item.');

  // AudioUrlCache에서 URL 확인
  const cachedUrl = audioUrlCache.get(videoId);
  if (cachedUrl) {
    const isValid = await audioUrlCache.isValidUrl(cachedUrl);
    if (isValid) return cachedUrl;
  }

  // AudioUrlCache에서 URL 없거나 만료됐으면 새로 요청
  const {audioPlaybackData} = await getAudioUrlAndData(track);
  audioUrlCache.set(videoId, audioPlaybackData.url);
  return audioPlaybackData.url;
};
