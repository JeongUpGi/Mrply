import {SearchResultMusicItem} from '../model/model';
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
export const convertToTrack = (searchItem: SearchResultMusicItem): Track => {
  return {
    id: searchItem.id.videoId || '',
    url: '', // URL은 나중에 설정
    title: searchItem.snippet.title,
    artist: searchItem.snippet.channelTitle,
    artwork: searchItem.snippet.thumbnails.medium.url,
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
