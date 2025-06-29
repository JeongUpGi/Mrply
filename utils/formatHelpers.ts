import {MusicRankItem, SearchResultMusicItem} from '../model/model';
import TrackPlayer, {Track} from 'react-native-track-player';

export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}년 ${month}월 ${day}일`;
};

export const formatTime = (seconds: number | undefined) => {
  if (seconds === undefined) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

// 유투브 api 통해서 받아온 data들 TrackPlayer에 맞게 데이터 변환하는 함수
export const convertToTrack = (item: SearchResultMusicItem): Track => {
  return {
    id: item.id.videoId || item.id || '',
    url: '',
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    artwork: item.snippet.thumbnails.medium.url,
  };
};

// 음악 순위 api 통해서 받아온 data들 TrackPlayer에 맞게 데이터 변환하는 함수
export const convertMusicRankItemToTrack = (item: MusicRankItem): Track => {
  return {
    id: item.video_id,
    url: '',
    title: item.title,
    artist: item.artist,
    artwork: item.thumbnail_url,
  };
};

// HTML 엔티티를 디코딩하는 함수
export const decodeHtmlEntities = (text: string): string => {
  const entities: {[key: string]: string} = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&cent;': '¢',
  };

  return text.replace(/&[^;]+;/g, entity => entities[entity] || entity);
};

export const getRoundFormatTitle = (
  stage: number,
  currentPairIndex: number,
) => {
  if (stage === 2) return '결승';
  if (stage === 4) return `준결승 (${currentPairIndex + 1} / 2)`;
  return `${stage}강 (${currentPairIndex + 1} / ${stage / 2})`;
};

export const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const sec = String(date.getSeconds()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일 ${hour}시 ${min}분`;
};
