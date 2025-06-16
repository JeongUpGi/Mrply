import {TextStyle, ImageStyle} from 'react-native';
import TrackPlayer, {Track} from 'react-native-track-player';

export type RootStackParamList = {
  mainBottomTabs: undefined;
  playingMusicScreen: undefined;
  homeScreen: undefined;
  newMusicScreen: undefined;
  allMenuScreen: undefined;
  searchScreen: undefined;
  storageScreen: undefined;
  playlistScreen: undefined;
  playlistDetailScreen: {
    playlistId: string;
  };
};

export type PlaylistTrackScreenParams = {
  playlistId: string;
};

export interface HeaderProps {
  title: string;
  leftIcon?: undefined;
  rightIcon?: undefined;
  onPressLeft?: () => void;
  onPressRight?: () => void;

  titleStyle?: TextStyle;
  headerBackgroundColor?: TextStyle;
  leftIconStyle?: ImageStyle;
  rightIconStyle?: ImageStyle;
}

export interface SearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  regionCode?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: SearchResultMusicItem[];
}

export interface SearchResultMusicItem {
  id: {
    kind: string;
    videoId?: string;
    channelId?: string;
    playlistId?: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: {url: string; width: number; height: number};
      medium: {url: string; width: number; height: number};
      high: {url: string; width: number; height: number};
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

export interface RecentSearchItems {
  item: string; // 검색어
  onPress: (item: string) => void; // 항목 클릭 시 호출될 함수
  onDelete: (item: string) => void; // 삭제 버튼 클릭 시 호출될 함수
}

// 음악 진행중인 바 props인터페이스 정의
export interface PlayingMusicBarProps {
  imageUrl: string;
  musicTitle: string;
}

export interface AudioPlaybackData {
  url: string;
  title: string;
  artist: string;
  artwork: string;
  id: string;
}

// 추후 변수 추가 될 수 있기에 모델로 정의
export interface AudioServiceResponseData {
  audioPlaybackData: AudioPlaybackData;
}

export interface MusicPlayerState {
  currentMusic: Track | null;
  isPlaying: boolean;
  isPlayingMusicBarVisible: boolean;
  musicTrackQueue: Track[];
  currentMusicIndex: number | null;
  currentPlaybackPosition: number; // 음악 재 실행시 구간 값
}

export interface StoredPlaylist {
  id: string;
  title: string;
  tracks: Track[];
  createdAt: number;
  updatedAt: number;
}

export interface StorageState {
  storedPlaylists: StoredPlaylist[];
}

export interface TextInputModalProps {
  title: string;
  inputTitle: string;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onChangeTitle: (text: string) => void;
}

export interface ListModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  data: any[];
  renderItem: ({item}: {item: any}) => React.ReactElement;
  keyExtractor: (item: any) => string;
}

export interface SearchMusicModalProps {
  visible: boolean;
  holderText: string;
  onClose: () => void;
  onTrackSelect: (track: Track) => void;
}
