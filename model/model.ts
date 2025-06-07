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
